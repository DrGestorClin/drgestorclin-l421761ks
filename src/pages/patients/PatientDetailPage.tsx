import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPatient, type Patient } from '@/services/patients'
import { getMedicalRecords, type MedicalRecord } from '@/services/medical-records'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Edit, Plus, Clock, FileText, Lock } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export default function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDoctor, doctorId, isAdmin } = useAuth()
  const { toast } = useToast()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const p = await getPatient(id)
      setPatient(p)

      const r = await getMedicalRecords(id)

      if (isDoctor && p.doctor !== doctorId) {
        setRecords(r.filter((rec) => rec.doctor === doctorId))
      } else {
        setRecords(r)
      }
    } catch (err) {
      toast({ title: 'Erro', description: 'Paciente não encontrado', variant: 'destructive' })
      navigate('/patients')
    } finally {
      setLoading(false)
    }
  }, [id, doctorId, isDoctor, navigate, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Carregando dados...</div>
  }

  if (!patient) return null

  const isCurrentDoctor = patient.doctor === doctorId
  const isHistorical = isDoctor && !isCurrentDoctor
  const canEditPatient = isAdmin || isCurrentDoctor
  const canAddRecord = isCurrentDoctor

  const avatarUrl = patient.photo
    ? `${pb.baseURL}/api/files/patients/${patient.id}/${patient.photo}`
    : ''

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/patients')}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-brand-forest">
            Prontuário do Paciente
          </h1>
        </div>
      </div>

      {isHistorical && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-800">
          <Lock className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold">Acesso Histórico (Somente Leitura)</h4>
            <p className="text-sm mt-1 opacity-90">
              Você não é o médico atual deste paciente. Você tem permissão apenas para visualizar os
              prontuários criados por você anteriormente.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24 border-2 border-slate-100 shadow-sm shrink-0">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-brand-military/20 text-brand-forest text-2xl font-bold">
            {patient.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>
                <strong>Email:</strong> {patient.email || 'Não informado'}
              </p>
              <p>
                <strong>Telefone:</strong> {patient.phone || 'Não informado'}
              </p>
              {patient.birth_date && (
                <p>
                  <strong>Nascimento:</strong> {format(new Date(patient.birth_date), 'dd/MM/yyyy')}
                </p>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>
                <strong>Médico Responsável:</strong>{' '}
                <Badge variant={isCurrentDoctor ? 'default' : 'secondary'} className="ml-1">
                  {patient.expand?.doctor?.name || 'Nenhum'}
                </Badge>
              </p>
              <p>
                <strong>Cadastrado em:</strong> {format(new Date(patient.created), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
        </div>

        {canEditPatient && (
          <Button variant="outline" className="w-full md:w-auto shrink-0">
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-military" />
            Histórico de Prontuários
          </h3>
          {canAddRecord && (
            <Button className="bg-brand-forest hover:bg-brand-forest/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Registro
            </Button>
          )}
        </div>

        {records.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p>Nenhum registro encontrado para este paciente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">{record.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(record.created), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                      <span>•</span>
                      <span>Dr(a). {record.expand?.doctor?.name}</span>
                    </div>
                  </div>
                  {(!isHistorical || isAdmin) && record.doctor === doctorId && (
                    <Button variant="ghost" size="sm" className="h-8">
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                  )}
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                  {record.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
