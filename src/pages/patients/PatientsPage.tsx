import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import {
  getPatients,
  getPatientsByDoctor,
  getHistoricalPatients,
  type Patient,
} from '@/services/patients'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import pb from '@/lib/pocketbase/client'

export default function PatientsPage() {
  const { isDoctor, doctorId } = useAuth()
  const [patients, setPatients] = useState<(Patient & { _historical?: boolean })[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadPatients = useCallback(async () => {
    try {
      if (isDoctor && doctorId) {
        const active = await getPatientsByDoctor(doctorId)
        const historical = await getHistoricalPatients(doctorId)

        const map = new Map<string, Patient & { _historical?: boolean }>()
        active.forEach((p) => map.set(p.id, p))
        historical.forEach((p) => {
          if (!map.has(p.id)) {
            map.set(p.id, { ...p, _historical: true })
          }
        })
        setPatients(Array.from(map.values()))
      } else {
        const data = await getPatients()
        setPatients(data)
      }
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao carregar pacientes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [isDoctor, doctorId, toast])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-forest">Pacientes</h1>
          <p className="text-slate-500 mt-1">Gerencie os pacientes e seus prontuários.</p>
        </div>
        {!isDoctor && (
          <Button asChild className="bg-brand-forest hover:bg-brand-forest/90">
            <Link to="/patients/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Paciente
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Carregando pacientes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
          Nenhum paciente encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => {
            const avatarUrl = patient.photo
              ? `${pb.baseURL}/api/files/patients/${patient.id}/${patient.photo}`
              : ''

            return (
              <div
                key={patient.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {patient._historical && (
                  <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    Histórico
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 border border-slate-100">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-brand-military/20 text-brand-forest font-bold">
                      {patient.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-slate-800 line-clamp-1">{patient.name}</h3>
                    <p className="text-sm text-slate-500">{patient.phone || 'Sem telefone'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    {!isDoctor && patient.expand?.doctor && (
                      <span className="flex items-center gap-1">
                        <UserCircle className="h-3 w-3" />
                        {patient.expand.doctor.name}
                      </span>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link to={`/patients/${patient.id}`}>
                      <FileText className="h-4 w-4" /> Prontuário
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
