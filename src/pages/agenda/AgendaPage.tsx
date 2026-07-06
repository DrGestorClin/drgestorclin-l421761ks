import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getDoctors, type Doctor } from '@/services/doctors'
import { getPatients, type Patient } from '@/services/patients'
import {
  getAppointmentsByDoctor,
  createAppointment,
  type Appointment,
} from '@/services/appointments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, MessageCircle, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STATUS_COLORS: Record<string, string> = {
  Agendado: 'bg-blue-500',
  Confirmado: 'bg-emerald-500',
  Aguardando: 'bg-amber-500',
  'Em Atendimento': 'bg-purple-500',
  Finalizado: 'bg-slate-500',
  Cancelado: 'bg-rose-500',
  Falta: 'bg-black',
}

const formatDateInput = (date: Date) => date.toISOString().split('T')[0]

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const formatTime = (iso: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function AgendaPage() {
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'dia' | 'lista'>('dia')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    patient: '',
    date: formatDateInput(new Date()),
    time: '09:00',
    type: 'Consulta',
  })

  const loadData = useCallback(async () => {
    try {
      const [doctorData, patientData] = await Promise.all([getDoctors(), getPatients()])
      setDoctors(doctorData as Doctor[])
      setPatients(patientData as Patient[])
      if (doctorData.length > 0 && !selectedDoctor) {
        setSelectedDoctor(doctorData[0].id)
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar dados.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast, selectedDoctor])

  const loadAppointments = useCallback(async () => {
    if (!selectedDoctor) return
    try {
      const data = await getAppointmentsByDoctor(selectedDoctor)
      setAppointments(data as Appointment[])
    } catch {
      setAppointments([])
    }
  }, [selectedDoctor])

  useEffect(() => {
    loadData()
  }, [loadData])
  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])
  useRealtime('appointments', () => {
    loadAppointments()
  })

  const visibleAppointments =
    view === 'dia'
      ? appointments.filter((a) => isSameDay(new Date(a.start_time), selectedDate))
      : appointments

  const prevDay = () => setSelectedDate(new Date(selectedDate.getTime() - 86400000))
  const nextDay = () => setSelectedDate(new Date(selectedDate.getTime() + 86400000))
  const goToday = () => setSelectedDate(new Date())

  const handleWhatsApp = () => {
    toast({ title: 'WhatsApp Enviado', description: 'Lembrete de consulta enviado com sucesso.' })
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const startTime = new Date(`${formData.date}T${formData.time}`).toISOString()
      await createAppointment({
        patient: formData.patient,
        doctor: selectedDoctor,
        start_time: startTime,
        status: 'Agendado',
        type: formData.type,
      })
      toast({ title: 'Agendado', description: 'Consulta agendada com sucesso.' })
      setDialogOpen(false)
      setFormData({
        patient: '',
        date: formatDateInput(selectedDate),
        time: '09:00',
        type: 'Consulta',
      })
      await loadAppointments()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao agendar consulta.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground mt-1">
            Controle de horários e status dos atendimentos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Selecione o médico" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Agendar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Paciente</Label>
                  <Select
                    value={formData.patient}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, patient: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Tipo de Atendimento</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="Retorno">Retorno</SelectItem>
                      <SelectItem value="Procedimento">Procedimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSubmit}
                  disabled={saving || !formData.patient || !selectedDoctor}
                >
                  Salvar Agendamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
          <div className="flex items-center gap-2 self-center sm:self-auto">
            <Button variant="outline" size="icon" className="bg-white" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={goToday}>
              <span className="font-semibold text-lg min-w-[120px] text-center">
                {view === 'dia'
                  ? selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                  : 'Todos'}
              </span>
            </Button>
            <Button variant="outline" size="icon" className="bg-white" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={view === 'dia' ? 'default' : 'outline'}
              onClick={() => setView('dia')}
              className={view !== 'dia' ? 'bg-white' : ''}
            >
              Dia
            </Button>
            <Button
              variant={view === 'lista' ? 'default' : 'outline'}
              onClick={() => setView('lista')}
              className={view !== 'lista' ? 'bg-white' : ''}
            >
              Lista
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/30">
          <div className="space-y-4 max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando agenda...</div>
            ) : visibleAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Agenda Livre</h3>
                <p className="text-slate-500 max-w-sm mt-2">
                  Nenhum agendamento marcado para este médico
                  {view === 'dia' ? ' na data selecionada' : ''}.
                </p>
              </div>
            ) : (
              visibleAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 sm:w-32">
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full shadow-inner',
                        STATUS_COLORS[apt.status] || 'bg-slate-400',
                      )}
                    />
                    <span className="font-bold text-xl">{formatTime(apt.start_time)}</span>
                  </div>
                  <div className="flex-1 border-l-2 border-slate-100 pl-4 sm:border-l-0 sm:pl-0">
                    <div className="font-bold text-lg text-slate-800">
                      {apt.expand?.patient?.name || 'Paciente'}
                    </div>
                    <div className="text-sm font-medium text-slate-500 mt-1">
                      {apt.type || 'Consulta'}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                    <Badge variant="secondary" className="mr-2 font-medium bg-slate-100">
                      {apt.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleWhatsApp}
                      title="Enviar WhatsApp"
                      className="group-hover:border-emerald-200 group-hover:text-emerald-600 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button asChild variant="default" size="icon" title="Abrir Prontuário">
                      <Link to={`/patients/${apt.patient}`}>
                        <FileText className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
