import { MOCK_APPOINTMENTS, MOCK_PATIENTS } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle2, UserPlus, DollarSign, Clock } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const chartData = [
  { day: 'Seg', appointments: 12 },
  { day: 'Ter', appointments: 15 },
  { day: 'Qua', appointments: 9 },
  { day: 'Qui', appointments: 18 },
  { day: 'Sex', appointments: 14 },
  { day: 'Sáb', appointments: 5 },
]

export default function Index() {
  const todayAppointments = MOCK_APPOINTMENTS.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta! Aqui está o resumo de hoje.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/patients">Novo Paciente</Link>
          </Button>
          <Button asChild>
            <Link to="/agenda">Nova Consulta</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">+2 desde ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Confirmados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">66% de confirmação via WhatsApp</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Cadastros (Mês)</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1">+15% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financeiro Pendente (V2)</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 5.400</div>
            <p className="text-xs text-muted-foreground mt-1">8 faturas aguardando repasse</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Volume de Consultas (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ appointments: { label: 'Consultas', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="appointments"
                    fill="var(--color-appointments)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {todayAppointments.map((apt) => {
                const patient = MOCK_PATIENTS.find((p) => p.id === apt.patientId)
                return (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-muted text-sm font-bold shadow-sm">
                      <Clock className="h-4 w-4 mb-0.5 text-muted-foreground" />
                      {apt.time.split(':')[0]}h
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold leading-none">{patient?.name}</p>
                      <p className="text-xs text-muted-foreground">{apt.type}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-medium border-0',
                        apt.status === 'Agendado' && 'text-blue-700 bg-blue-100',
                        apt.status === 'Confirmado' && 'text-emerald-700 bg-emerald-100',
                        apt.status === 'Aguardando' && 'text-amber-700 bg-amber-100 animate-pulse',
                        apt.status === 'Em Atendimento' && 'text-purple-700 bg-purple-100',
                        apt.status === 'Finalizado' && 'text-slate-700 bg-slate-100',
                      )}
                    >
                      {apt.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
