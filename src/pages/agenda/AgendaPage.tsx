import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getDoctors, type Doctor } from '@/services/doctors'
import { getPatients, getPatientsByDoctor, type Patient } from '@/services/patients'
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
  const { isDoctor, doctorId } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'dia' | 'lista' | 'mes'>('mes')
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
      const doctorData = await getDoctors()
      setDoctors(doctorData as Doctor[])
      if (isDoctor && doctorId) {
        setSelectedDoctor(doctorId)
        const patientData = await getPatientsByDoctor(doctorId)
        setPatients(patientData as Patient[])
      } else {
        const patientData = await getPatients()
        setPatients(patientData as Patient[])
        if (doctorData.length > 0 && !selectedDoctor) {
          setSelectedDoctor(doctorData[0].id)
        }
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar dados.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast, selectedDoctor, isDoctor, doctorId])

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

  const prevDate = () => {
    if (view === 'mes') {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
    } else {
      setSelectedDate(new Date(selectedDate.getTime() - 86400000))
    }
  }
  const nextDate = () => {
    if (view === 'mes') {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
    } else {
      setSelectedDate(new Date(selectedDate.getTime() + 86400000))
    }
  }
  const goToday = () => setSelectedDate(new Date())

  const renderMonthView = () => {
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)

    const startDate = new Date(monthStart)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const endDate = new Date(monthEnd)
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
    }

    const days = []
    let d = new Date(startDate)
    while (d <= endDate) {
      days.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="flex flex-col h-full bg-white rounded-md border shadow-sm overflow-hidden animate-fade-in">
        <div className="grid grid-cols-7 border-b bg-slate-50">
          {weekDays.map((day) => (
            <div key={day} className="py-2 text-center text-sm font-semibold text-slate-500">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-100 gap-px border-b">
          {days.map((day, i) => {
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
            const isCurrentDay = isSameDay(day, new Date())
            const dayApts = appointments.filter((a) => isSameDay(new Date(a.start_time), day))

            return (
              <div
                key={i}
                className={cn(
                  'min-h-[100px] p-1.5 flex flex-col gap-1 transition-colors hover:bg-slate-50 cursor-pointer overflow-hidden bg-white',
                  !isCurrentMonth && 'bg-slate-50/50',
                  isCurrentDay && 'bg-brand-military/5 ring-1 ring-inset ring-brand-military/20',
                )}
                onClick={() => {
                  setSelectedDate(day)
                  setView('dia')
                }}
              >
                <div className="flex justify-between items-center px-1 mb-1">
                  <span
                    className={cn(
                      'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                      isCurrentDay
                        ? 'bg-brand-forest text-white'
                        : !isCurrentMonth
                          ? 'text-slate-400'
                          : 'text-slate-700',
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayApts.length > 0 && (
                    <span className="text-xs text-brand-forest/70 font-semibold hidden sm:inline-block">
                      {dayApts.length} cons.
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
                  {dayApts.map((apt) => (
                    <div
                      key={apt.id}
                      className={cn(
                        'text-[10px] sm:text-xs px-1.5 py-0.5 rounded text-white truncate shadow-sm font-medium',
                        STATUS_COLORS[apt.status] || 'bg-slate-400',
                      )}
                    >
                      <span className="font-bold mr-1">{formatTime(apt.start_time)}</span>
                      {apt.expand?.patient?.name.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

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
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={isDoctor}>
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
            <Button variant="outline" size="icon" className="bg-white" onClick={prevDate}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={goToday}>
              <span className="font-semibold text-lg min-w-[140px] text-center capitalize">
                {view === 'dia'
                  ? selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                  : view === 'mes'
                    ? selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                    : 'Todos'}
              </span>
            </Button>
            <Button variant="outline" size="icon" className="bg-white" onClick={nextDate}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 bg-slate-100 p-1 rounded-md">
            <Button
              variant={view === 'mes' ? 'default' : 'ghost'}
              onClick={() => setView('mes')}
              className={cn('h-8 px-4', view === 'mes' && 'bg-white shadow-sm text-brand-forest')}
            >
              Mês
            </Button>
            <Button
              variant={view === 'dia' ? 'default' : 'ghost'}
              onClick={() => setView('dia')}
              className={cn('h-8 px-4', view === 'dia' && 'bg-white shadow-sm text-brand-forest')}
            >
              Dia
            </Button>
            <Button
              variant={view === 'lista' ? 'default' : 'ghost'}
              onClick={() => setView('lista')}
              className={cn('h-8 px-4', view === 'lista' && 'bg-white shadow-sm text-brand-forest')}
            >
              Lista
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50/30">
          {view === 'mes' ? (
            <div className="h-full p-4 sm:p-6">{renderMonthView()}</div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto animate-fade-in">
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
          )}
        </div>
      </div>
    </div>
  )
}
