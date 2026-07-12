import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getPatients } from '@/services/patients'
import { getDoctors } from '@/services/doctors'
import { getMedicalRecordTemplates } from '@/services/medical-templates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  UserRound,
  FileText,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/services/appointments'

const STATUS_STYLES: Record<string, string> = {
  Confirmado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Agendado: 'bg-sky-100 text-sky-700 border-sky-200',
  'Em Atendimento': 'bg-amber-100 text-amber-700 border-amber-200',
  Finalizado: 'bg-slate-100 text-slate-600 border-slate-200',
  Cancelado: 'bg-rose-100 text-rose-700 border-rose-200',
  Aguardando: 'bg-violet-100 text-violet-700 border-violet-200',
  Falta: 'bg-rose-100 text-rose-700 border-rose-200',
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  gradient,
  iconBg,
  delay,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  loading: boolean
  gradient: string
  iconBg: string
  delay: number
}) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-none shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up',
        gradient,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold text-white tabular-nums">{loading ? '—' : value}</p>
          </div>
          <div className={cn('rounded-xl p-2.5 bg-white/20 backdrop-blur-sm', iconBg)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Index() {
  const { user, isDoctor } = useAuth()
  const [stats, setStats] = useState({ patients: 0, doctors: 0, templates: 0 })
  const [loading, setLoading] = useState(true)
  const [appointmentsCount, setAppointmentsCount] = useState<number | null>(null)
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])

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

  useEffect(() => {
    if (isDoctor) return
    const loadApts = async () => {
      try {
        const { getAppointments } = await import('@/services/appointments')
        const all = await getAppointments()
        const today = new Date().toISOString().split('T')[0]
        const todayApts = all
          .filter((a) => a.start_time.startsWith(today))
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
        setAppointmentsCount(todayApts.length)
        setTodayAppointments(todayApts.slice(0, 5))
      } catch {
        setAppointmentsCount(0)
      }
    }
    loadApts()
  }, [isDoctor])

  if (isDoctor) {
    return <Navigate to="/patients" replace />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-forest">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Bem-vindo(a), {user?.name || 'Administrador'}! Visão geral da clínica.
          </p>
        </div>
        <Link
          to="/agenda"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-green-dark transition-colors group"
        >
          Ver agenda completa
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pacientes"
          value={stats.patients}
          icon={Users}
          loading={loading}
          gradient="bg-gradient-to-br from-[hsl(160_55%_42%)] to-[hsl(160_55%_32%)]"
          iconBg=""
          delay={0}
        />
        <StatCard
          title="Médicos"
          value={stats.doctors}
          icon={UserRound}
          loading={loading}
          gradient="bg-gradient-to-br from-[hsl(200_65%_52%)] to-[hsl(200_60%_40%)]"
          iconBg=""
          delay={75}
        />
        <StatCard
          title="Modelos de Prontuário"
          value={stats.templates}
          icon={FileText}
          loading={loading}
          gradient="bg-gradient-to-br from-[hsl(280_40%_55%)] to-[hsl(280_40%_42%)]"
          iconBg=""
          delay={150}
        />
        <StatCard
          title="Consultas Hoje"
          value={appointmentsCount ?? 0}
          icon={Calendar}
          loading={appointmentsCount === null}
          gradient="bg-gradient-to-br from-[hsl(38_90%_55%)] to-[hsl(38_85%_45%)]"
          iconBg=""
          delay={225}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2 shadow-card border-none animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-brand-green-light p-2">
                <Clock className="h-4 w-4 text-brand-green" />
              </div>
              <CardTitle className="text-base font-semibold text-brand-forest">
                Consultas de Hoje
              </CardTitle>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {todayAppointments.length} agendadas
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="rounded-full bg-muted p-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Nenhuma consulta agendada para hoje
                </p>
              </div>
            ) : (
              todayAppointments.map((apt) => {
                const time = new Date(apt.start_time).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card hover:bg-accent/40 transition-colors px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-brand-green-light shrink-0">
                        <span className="text-sm font-bold text-brand-green tabular-nums">
                          {time}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {apt.expand?.patient?.name || 'Paciente'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {apt.expand?.doctor?.name || 'Médico'} · {apt.type || 'Consulta'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0',
                        STATUS_STYLES[apt.status] || 'bg-slate-100 text-slate-600 border-slate-200',
                      )}
                    >
                      {apt.status}
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card
          className="shadow-card border-none animate-fade-in-up"
          style={{ animationDelay: '375ms' }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-sky-100 p-2">
                <Activity className="h-4 w-4 text-sky-600" />
              </div>
              <CardTitle className="text-base font-semibold text-brand-forest">
                Atividade da Clínica
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-green-light to-transparent p-3">
              <div className="rounded-lg bg-white p-2 shadow-sm">
                <TrendingUp className="h-4 w-4 text-brand-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-forest tabular-nums">
                  {loading ? '—' : stats.patients}
                </p>
                <p className="text-xs text-muted-foreground">Pacientes cadastrados</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-sky-50 to-transparent p-3">
              <div className="rounded-lg bg-white p-2 shadow-sm">
                <UserRound className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-700 tabular-nums">
                  {loading ? '—' : stats.doctors}
                </p>
                <p className="text-xs text-muted-foreground">Profissionais ativos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-50 to-transparent p-3">
              <div className="rounded-lg bg-white p-2 shadow-sm">
                <FileText className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-700 tabular-nums">
                  {loading ? '—' : stats.templates}
                </p>
                <p className="text-xs text-muted-foreground">Modelos disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
