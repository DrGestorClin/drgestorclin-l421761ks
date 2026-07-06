import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getPatient, type Patient } from '@/services/patients'
import { getMedicalRecords, type MedicalRecord } from '@/services/medical-records'
import { getDoctors, type Doctor } from '@/services/doctors'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { MedicalRecordForm } from '@/components/medical-record-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Plus, UserCircle, Stethoscope, Calendar, Lock } from 'lucide-react'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin, isDoctor, doctorId } = useAuth()
  const { toast } = useToast()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const [p, recs, docs] = await Promise.all([
        getPatient(id),
        getMedicalRecords(id),
        getDoctors(),
      ])
      setPatient(p)
      setRecords(recs)
      setDoctors(docs)
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do paciente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('medical_records', () => {
    loadData()
  })

  useRealtime('patients', () => {
    loadData()
  })

  const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—')
  const fmtDateTime = (d: string) =>
    d
      ? new Date(d).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'

  const isCurrentDoctor = isDoctor && patient?.doctor === doctorId
  const hasHistoricalRecords = isDoctor && records.some((r) => r.doctor === doctorId)
  const canEdit = isAdmin || isCurrentDoctor
  const hasAccess = !isDoctor || isCurrentDoctor || hasHistoricalRecords

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Paciente não encontrado.</p>
        <Button asChild className="mt-4">
          <Link to="/patients">Voltar</Link>
        </Button>
      </div>
    )
  }

  if (!hasAccess) {
    return <Navigate to="/patients" replace />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/patients" className="text-[hsl(var(--brand-green-dark))]">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Pacientes
        </Link>
      </Button>

      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start gap-4 p-6">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${patient.id}`} />
            <AvatarFallback>
              <UserCircle className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold">{patient.name}</h2>
              {!canEdit && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-0">
                  <Lock className="mr-1 h-3 w-3" /> Apenas Leitura
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                <Calendar className="inline mr-1 h-3 w-3" /> {fmtDate(patient.birth_date)}
              </span>
              <span>{patient.phone || '—'}</span>
              <span>{patient.email || ''}</span>
            </div>
          </div>
          {patient.expand?.doctor && (
            <Badge
              variant="outline"
              className="bg-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-dark))] border-0"
            >
              <Stethoscope className="mr-1 h-3 w-3" /> {patient.expand.doctor.name}
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[hsl(var(--brand-green-dark))]">Prontuários</h3>
        {canEdit && (
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-dark))] text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Prontuário
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              Nenhum prontuário registrado.
            </CardContent>
          </Card>
        ) : (
          records.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{r.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{fmtDateTime(r.created)}</p>
                  </div>
                  {r.expand?.doctor && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {r.expand.doctor.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm font-sans text-muted-foreground line-clamp-6">
                  {r.content}
                </pre>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {canEdit && (
        <MedicalRecordForm
          patientId={patient.id}
          doctors={doctors}
          defaultDoctorId={doctorId || ''}
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
