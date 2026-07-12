import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getAppointment, updateAppointment, type Appointment } from '@/services/appointments'
import {
  getMedicalRecordsByPatient,
  createMedicalRecord,
  type MedicalRecord,
} from '@/services/medical-records'
import { Button } from '@/components/ui/button'
import { ChevronLeft, FileSignature, Save, Loader2, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function ConsultationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [soap, setSoap] = useState({
    subjetivo: '',
    pa: '',
    fc: '',
    peso: '',
    temp: '',
    objetivo: '',
    cid10: '',
    plano: '',
  })

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const apt = await getAppointment(id)
      setAppointment(apt)
      if (apt.patient) {
        try {
          const recs = await getMedicalRecordsByPatient(apt.patient)
          setRecords(recs)
        } catch {
          setRecords([])
        }
      }
    } catch {
      setAppointment(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('appointments', (e) => {
    if (e.record.id === id) {
      loadData()
    }
  })

  useRealtime('medical_records', (e) => {
    if (appointment && e.record.patient === appointment.patient) {
      loadData()
    }
  })

  const handleFinalize = async () => {
    if (!appointment) return
    setSaving(true)
    try {
      const content = [
        '## Subjetivo (Anamnese)',
        soap.subjetivo || '—',
        '',
        '## Objetivo (Exame Físico)',
        `PA: ${soap.pa || '—'} | FC: ${soap.fc || '—'} | Peso: ${soap.peso || '—'} | Temp: ${soap.temp || '—'}`,
        soap.objetivo || '—',
        '',
        '## Avaliação (Diagnóstico)',
        `CID-10: ${soap.cid10 || '—'}`,
        '',
        '## Plano (Conduta)',
        soap.plano || '—',
      ].join('\n')

      await createMedicalRecord({
        patient: appointment.patient,
        doctor: appointment.doctor,
        title: `${appointment.type || 'Consulta'} - ${formatDate(appointment.start_time)}`,
        content,
      })

      await updateAppointment(appointment.id, { status: 'Finalizado' })

      toast({
        title: 'Prontuário Salvo',
        description: 'Atendimento finalizado com sucesso. Registro bloqueado.',
      })
      navigate('/agenda')
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar o prontuário.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleMemed = () => {
    toast({
      title: 'Prescrição Gerada',
      description: 'Receita assinada digitalmente via Memed com sucesso.',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold text-muted-foreground">Consulta não encontrada</p>
        <Button variant="outline" onClick={() => navigate('/agenda')}>
          Voltar para Agenda
        </Button>
      </div>
    )
  }

  const patientName = appointment.expand?.patient?.name || 'Paciente'
  const patientAge = appointment.expand?.patient?.birth_date
    ? calculateAge(appointment.expand.patient.birth_date)
    : null
  const doctorName = appointment.expand?.doctor?.name || 'Médico'

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in min-h-[600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b mb-4 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="bg-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{patientName}</h2>
            <p className="text-sm font-medium text-slate-500">
              {patientAge !== null ? `${patientAge} anos` : 'Idade não informada'} • {doctorName} •{' '}
              {appointment.type || 'Consulta'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 bg-white shadow-sm"
              >
                <FileSignature className="h-4 w-4" /> Prescrição Memed
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Módulo Memed (Simulação)</DialogTitle>
              </DialogHeader>
              <div className="h-[400px] bg-slate-50 rounded-lg border border-dashed flex items-center justify-center p-6 text-center flex-col gap-4">
                <Badge
                  variant="outline"
                  className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1"
                >
                  Integração Ativa
                </Badge>
                <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                  Na versão de produção, o iframe da Memed será renderizado aqui, passando os dados
                  do médico e paciente automaticamente via API.
                </p>
                <Button
                  onClick={handleMemed}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Simular Assinatura e Emissão
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleFinalize} disabled={saving} className="gap-2 shadow-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Finalizar Consulta
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 lg:border-r lg:pr-6">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mt-2">
            Histórico do Paciente
          </h3>
          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="text-sm font-medium text-slate-400 text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                Nenhum histórico clínico anterior.
              </div>
            ) : (
              records.map((rec) => (
                <Card key={rec.id} className="shadow-sm border-slate-200 bg-white">
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold text-slate-400 mb-1">
                      {formatDate(rec.created)} • {rec.expand?.doctor?.name || 'Médico'}
                    </div>
                    <div className="font-bold text-sm text-slate-700 mb-2">{rec.title}</div>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {rec.content || '[Sem conteúdo]'}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <Card className="flex-1 overflow-y-auto shadow-sm border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                  S
                </div>
                <h3 className="font-bold text-xl text-slate-800">
                  Subjetivo{' '}
                  <span className="text-slate-400 font-medium text-base ml-1">(Anamnese)</span>
                </h3>
              </div>
              <Textarea
                placeholder="Queixa principal, duração, e relato do paciente..."
                className="min-h-[120px] bg-slate-50/50 resize-y"
                value={soap.subjetivo}
                onChange={(e) => setSoap({ ...soap, subjetivo: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  O
                </div>
                <h3 className="font-bold text-xl text-slate-800">
                  Objetivo{' '}
                  <span className="text-slate-400 font-medium text-base ml-1">(Exame Físico)</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">PA (mmHg)</Label>
                  <Input
                    placeholder="120x80"
                    className="bg-white"
                    value={soap.pa}
                    onChange={(e) => setSoap({ ...soap, pa: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">FC (bpm)</Label>
                  <Input
                    placeholder="75"
                    className="bg-white"
                    value={soap.fc}
                    onChange={(e) => setSoap({ ...soap, fc: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Peso (kg)</Label>
                  <Input
                    placeholder="70.5"
                    className="bg-white"
                    value={soap.peso}
                    onChange={(e) => setSoap({ ...soap, peso: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Temp (°C)</Label>
                  <Input
                    placeholder="36.5"
                    className="bg-white"
                    value={soap.temp}
                    onChange={(e) => setSoap({ ...soap, temp: e.target.value })}
                  />
                </div>
              </div>
              <Textarea
                placeholder="Anotações adicionais da inspeção, palpação, ausculta..."
                className="min-h-[80px] bg-slate-50/50"
                value={soap.objetivo}
                onChange={(e) => setSoap({ ...soap, objetivo: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                  A
                </div>
                <h3 className="font-bold text-xl text-slate-800">
                  Avaliação{' '}
                  <span className="text-slate-400 font-medium text-base ml-1">(Diagnóstico)</span>
                </h3>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-600">Busca Rápida CID-10</Label>
                <Input
                  placeholder="Ex: J00 - Nasofaringite aguda"
                  className="bg-slate-50/50"
                  value={soap.cid10}
                  onChange={(e) => setSoap({ ...soap, cid10: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                  P
                </div>
                <h3 className="font-bold text-xl text-slate-800">
                  Plano <span className="text-slate-400 font-medium text-base ml-1">(Conduta)</span>
                </h3>
              </div>
              <Textarea
                placeholder="Plano de tratamento, recomendações gerais, encaminhamentos e orientações..."
                className="min-h-[140px] bg-slate-50/50"
                value={soap.plano}
                onChange={(e) => setSoap({ ...soap, plano: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
