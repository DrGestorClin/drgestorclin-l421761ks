import { useEffect, useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
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
  bgColor,
  delay,
  onClick,
  clickable,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  loading: boolean
  bgColor: string
  delay: number
  onClick?: () => void
  clickable?: boolean
}) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up rounded-2xl cursor-pointer group',
        bgColor,
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
        <div className="flex items-start justify-between">
          <p className="text-sm md:text-base font-medium text-white/90">{title}</p>
          <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <p className="text-4xl md:text-5xl font-bold text-white tabular-nums tracking-tight">
            {loading ? '—' : value}
          </p>
          {clickable && (
            <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Index() {
  const { user, isDoctor } = useAuth()
  const navigate = useNavigate()
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

  const displayName = user?.name || 'DrGestorClin Admin'

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#2A4434]">Dashboard</h2>
          <p className="text-[#4A6455] mt-1 text-sm md:text-base">
            Bem-vindo(a), {displayName}! Visão geral da clínica.
          </p>
        </div>
        <Link
          to="/agenda"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B9169] hover:text-[#28533D] transition-colors group mb-1"
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
          bgColor="bg-[#3B9169]"
          delay={0}
          clickable
          onClick={() => navigate('/patients')}
        />
        <StatCard
          title="Médicos"
          value={stats.doctors}
          icon={UserRound}
          loading={loading}
          bgColor="bg-[#2B8AC1]"
          delay={75}
        />
        <StatCard
          title="Modelos de Prontuário"
          value={stats.templates}
          icon={FileText}
          loading={loading}
          bgColor="bg-[#9A4C9D]"
          delay={150}
        />
        <StatCard
          title="Consultas Hoje"
          value={appointmentsCount ?? 0}
          icon={Calendar}
          loading={appointmentsCount === null}
          bgColor="bg-[#E29923]"
          delay={225}
          clickable
          onClick={() => navigate('/agenda')}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2 shadow-sm border-none bg-white rounded-3xl animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-6 px-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-full bg-[#F0F5F2] p-2">
                <Clock className="h-5 w-5 text-[#3B9169]" />
              </div>
              <CardTitle className="text-lg font-semibold text-[#2A4434]">
                Consultas de Hoje
              </CardTitle>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {appointmentsCount ?? 0} agendadas
            </span>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="rounded-full bg-[#F5F8F6] p-5">
                  <Calendar className="h-10 w-10 text-[#A0B5A9]" strokeWidth={1.5} />
                </div>
                <p className="text-[#628471] font-medium">Nenhuma consulta agendada para hoje</p>
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
                    className="flex items-center justify-between rounded-2xl border border-border/40 bg-card hover:bg-accent/20 transition-colors px-4 py-3"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#EAF1EC] shrink-0">
                        <span className="text-sm font-bold text-[#2A4434] tabular-nums">
                          {time}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-[#2A4434] truncate">
                          {apt.expand?.patient?.name || 'Paciente'}
                        </p>
                        <p className="text-xs text-[#628471]">
                          {apt.expand?.doctor?.name || 'Médico'} · {apt.type || 'Consulta'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap shrink-0',
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
          className="shadow-sm border-none bg-white rounded-3xl animate-fade-in-up"
          style={{ animationDelay: '375ms' }}
        >
          <CardHeader className="pb-6 pt-6 px-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-full bg-[#F0F8FC] p-2">
                <Activity className="h-5 w-5 text-[#2B8AC1]" />
              </div>
              <CardTitle className="text-lg font-semibold text-[#2A4434]">
                Atividade da Clínica
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-[#F4F9F6] p-4">
              <div className="rounded-full bg-white p-2.5 shadow-sm">
                <TrendingUp className="h-5 w-5 text-[#3B9169]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#2A4434] tabular-nums leading-none">
                  {loading ? '—' : stats.patients}
                </p>
                <p className="text-xs text-[#628471] mt-1.5 font-medium">Pacientes cadastrados</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-[#F4F9FC] p-4">
              <div className="rounded-full bg-white p-2.5 shadow-sm">
                <UserRound className="h-5 w-5 text-[#2B8AC1]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#2A4434] tabular-nums leading-none">
                  {loading ? '—' : stats.doctors}
                </p>
                <p className="text-xs text-[#628471] mt-1.5 font-medium">Profissionais ativos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-[#F9F4FA] p-4">
              <div className="rounded-full bg-white p-2.5 shadow-sm">
                <FileText className="h-5 w-5 text-[#9A4C9D]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#2A4434] tabular-nums leading-none">
                  {loading ? '—' : stats.templates}
                </p>
                <p className="text-xs text-[#628471] mt-1.5 font-medium">Modelos disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
