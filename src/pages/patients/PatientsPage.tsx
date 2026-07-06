import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  getPatients,
  getPatientsByDoctor,
  getHistoricalPatients,
  type Patient,
} from '@/services/patients'
import { getDoctors, type Doctor } from '@/services/doctors'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, UserCircle } from 'lucide-react'
import { PatientFormSheet } from '@/components/patient-form-sheet'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

export default function PatientsPage() {
  const { isAdmin, isDoctor, doctorId } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('current')

  const loadData = useCallback(async () => {
    try {
      const doctorData = await getDoctors()
      setDoctors(doctorData as Doctor[])

      if (isAdmin) {
        const patientData = await getPatients()
        setPatients(patientData as Patient[])
      } else if (doctorId) {
        if (activeTab === 'current') {
          const patientData = await getPatientsByDoctor(doctorId)
          setPatients(patientData as Patient[])
        } else {
          const patientData = await getHistoricalPatients(doctorId)
          setPatients(patientData as Patient[])
        }
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar pacientes.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [isAdmin, doctorId, activeTab, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('patients', () => {
    loadData()
  })

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setLoading(true)
  }

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.expand?.doctor?.name?.toLowerCase().includes(search.toLowerCase()) ?? false),
  )

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? 'Gerencie o cadastro de pacientes e seus médicos responsáveis.'
              : 'Acesse os pacientes sob seus cuidados.'}
          </p>
        </div>
        {isAdmin && <PatientFormSheet doctors={doctors} onSuccess={loadData} />}
      </div>

      {isDoctor && (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="current">Meus Pacientes</TabsTrigger>
            <TabsTrigger value="history">Pacientes Anteriores</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {isDoctor && activeTab === 'history' && (
        <p className="text-sm text-muted-foreground">
          Pacientes anteriormente atendidos por você. Acesso apenas leitura.
        </p>
      )}

      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center max-w-sm relative bg-slate-50/50">
          <Search className="absolute left-7 top-6 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou médico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Data de Nascimento</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Médico Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage
                          src={`https://img.usecurling.com/ppl/thumbnail?seed=${p.id}`}
                        />
                        <AvatarFallback>
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{p.name}</span>
                    </TableCell>
                    <TableCell>{formatDate(p.birth_date)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{p.phone || '—'}</div>
                      <div className="text-xs text-muted-foreground">{p.email || ''}</div>
                    </TableCell>
                    <TableCell>
                      {p.expand?.doctor ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                          {p.expand.doctor.name}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  {activeTab === 'history'
                    ? 'Nenhum paciente anterior encontrado.'
                    : 'Nenhum paciente encontrado.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
