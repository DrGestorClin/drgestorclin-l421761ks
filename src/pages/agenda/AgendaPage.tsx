import { useState } from 'react'
import { MOCK_APPOINTMENTS, MOCK_PATIENTS, MOCK_DOCTORS } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, MessageCircle, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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

export default function AgendaPage() {
  const { toast } = useToast()
  const [view, setView] = useState<'dia' | 'lista'>('dia')
  const [selectedDoctor, setSelectedDoctor] = useState('1')

  const handleWhatsApp = () => {
    toast({
      title: 'WhatsApp Enviado',
      description: 'Lembrete de consulta enviado com sucesso para o paciente.',
    })
  }

  const appointments = MOCK_APPOINTMENTS.filter((a) => a.doctorId === selectedDoctor)

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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOCK_DOCTORS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog>
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PATIENTS.map((p) => (
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
                    <Input type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Hora</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Tipo de Atendimento</Label>
                  <Select defaultValue="consulta">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="retorno">Retorno</SelectItem>
                      <SelectItem value="procedimento">Procedimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() =>
                    toast({
                      title: 'Agendado',
                      description: 'Gatilho do WhatsApp disparado para confirmação imediata.',
                    })
                  }
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
            <Button variant="outline" size="icon" className="bg-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-lg min-w-[120px] text-center">Hoje</span>
            <Button variant="outline" size="icon" className="bg-white">
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
            {appointments.map((apt) => {
              const patient = MOCK_PATIENTS.find((p) => p.id === apt.patientId)
              return (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 sm:w-32">
                    <div
                      className={cn('h-4 w-4 rounded-full shadow-inner', STATUS_COLORS[apt.status])}
                    />
                    <span className="font-bold text-xl">{apt.time}</span>
                  </div>
                  <div className="flex-1 border-l-2 border-slate-100 pl-4 sm:border-l-0 sm:pl-0">
                    <div className="font-bold text-lg text-slate-800">{patient?.name}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">
                      {apt.type} • {patient?.convenio}
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
                      <Link to={`/consultation/${apt.patientId}`}>
                        <FileText className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
            {appointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Agenda Livre</h3>
                <p className="text-slate-500 max-w-sm mt-2">
                  Nenhum agendamento marcado para este médico na data selecionada.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
