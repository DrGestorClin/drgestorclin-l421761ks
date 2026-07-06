import { useParams, useNavigate } from 'react-router-dom'
import { MOCK_PATIENTS, MOCK_HISTORY } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { ChevronLeft, FileSignature, AlertCircle, Save } from 'lucide-react'
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

export default function ConsultationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const patient = MOCK_PATIENTS.find((p) => p.id === id) || MOCK_PATIENTS[0]
  const history = MOCK_HISTORY.filter((h) => h.patientId === patient.id)

  const handleFinalize = () => {
    toast({
      title: 'Prontuário Salvo',
      description: 'Atendimento finalizado com sucesso. Registro bloqueado.',
    })
    navigate('/agenda')
  }

  const handleMemed = () => {
    toast({
      title: 'Prescrição Gerada',
      description: 'Receita assinada digitalmente via Memed com sucesso.',
      variant: 'default',
    })
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in min-h-[600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b mb-4 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="bg-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
            <p className="text-sm font-medium text-slate-500">
              {patient.age} anos • CPF: {patient.cpf}
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
                  do médico e paciente automaticamente via API, permitindo a busca de medicamentos e
                  assinatura digital.
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
          <Button onClick={handleFinalize} className="gap-2 shadow-sm">
            <Save className="h-4 w-4" /> Finalizar Consulta
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Lado Esquerdo - Histórico */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 lg:border-r lg:pr-6">
          {patient.allergies && (
            <Card className="bg-rose-50 border-rose-200 shadow-sm shrink-0">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-700">Alergias Graves</h4>
                  <p className="text-sm font-medium text-rose-600 mt-1">{patient.allergies}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mt-2">
            Histórico do Paciente
          </h3>
          <div className="space-y-4">
            {history.map((hist) => (
              <Card key={hist.id} className="shadow-sm border-slate-200 bg-white">
                <CardContent className="p-4">
                  <div className="text-xs font-semibold text-slate-400 mb-1">
                    {hist.date} • {hist.doctor}
                  </div>
                  <div className="font-bold text-sm text-slate-700 mb-2">{hist.type}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{hist.description}</p>
                </CardContent>
              </Card>
            ))}
            {history.length === 0 && (
              <div className="text-sm font-medium text-slate-400 text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                Nenhum histórico clínico anterior.
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito - Atendimento Atual (SOAP) */}
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
                  <Input placeholder="120x80" className="bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">FC (bpm)</Label>
                  <Input placeholder="75" className="bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Peso (kg)</Label>
                  <Input placeholder="70.5" className="bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Temp (°C)</Label>
                  <Input placeholder="36.5" className="bg-white" />
                </div>
              </div>
              <Textarea
                placeholder="Anotações adicionais da inspeção, palpação, ausculta..."
                className="min-h-[80px] bg-slate-50/50"
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
                <Input placeholder="Ex: J00 - Nasofaringite aguda" className="bg-slate-50/50" />
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
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
