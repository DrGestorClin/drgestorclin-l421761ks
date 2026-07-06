import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getPatients } from '@/services/patients'
import { getDoctors } from '@/services/doctors'
import { getMedicalRecordTemplates } from '@/services/medical-templates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserRound, FileText, Calendar } from 'lucide-react'

export default function Index() {
  const { user, isDoctor } = useAuth()
  const [stats, setStats] = useState({ patients: 0, doctors: 0, templates: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDoctor) return
    const loadStats = async () => {
      try {
        const [patients, doctors, templates] = await Promise.all([
          getPatients(),
          getDoctors(),
          getMedicalRecordTemplates(),
        ])
        setStats({
          patients: patients.length,
          doctors: doctors.length,
          templates: templates.length,
        })
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [isDoctor])

  if (isDoctor) {
    return <Navigate to="/patients" replace />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Bem-vindo(a), {user?.name || 'Administrador'}! Visão geral da clínica.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : stats.patients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos</CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : stats.doctors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos de Prontuário</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : stats.templates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agenda</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
