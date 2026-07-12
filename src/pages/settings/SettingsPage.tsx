import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Users,
  History,
  ShieldAlert,
} from 'lucide-react'
import { sendTestEmail } from '@/services/smtp'
import { useToast } from '@/hooks/use-toast'
import { UsersManager } from '@/components/admin-panel/users-manager'
import { AuditLogsViewer } from '@/components/admin-panel/audit-logs-viewer'

export default function SettingsPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: 'Erro',
        description: 'Informe um endereço de e-mail.',
        variant: 'destructive',
      })
      return
    }
    setSending(true)
    setResult(null)
    try {
      const res = await sendTestEmail(testEmail)
      setResult({ success: res.success, message: res.message })
      toast({
        title: res.success ? 'Sucesso' : 'Erro',
        description: res.message,
        variant: res.success ? 'default' : 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#2A4434]">Configurações</h2>
        <p className="text-[#4A6455] mt-1">Gerencie as configurações do sistema.</p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Os dados coletados estão sujeitos às normas da LGPD. O sigilo médico e a responsabilidade
          jurídica sobre as informações inseridas são de total responsabilidade do profissional de
          saúde.
        </p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="email" className="text-xs sm:text-sm">
            <Mail className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">E-mail (SMTP)</span>
            <span className="sm:hidden">SMTP</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            <Users className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Usuários</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs sm:text-sm">
            <History className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#3B9169]" />
                <div>
                  <CardTitle className="text-[#2A4434]">Configuração de E-mail (SMTP)</CardTitle>
                  <CardDescription>
                    Envie um e-mail de teste para verificar se as configurações de SMTP do Gmail
                    estão funcionando corretamente.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>E-mail para teste</Label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="teste@exemplo.com"
                />
              </div>
              <Button
                onClick={handleTestEmail}
                disabled={sending}
                className="bg-[#3B9169] hover:bg-[#28533D]"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Testar Configuração de E-mail
              </Button>
              {result && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-md ${
                    result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0" />
                  )}
                  <p className="text-sm">{result.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#F0F5F2] p-2">
              <ShieldCheck className="h-5 w-5 text-[#3B9169]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#2A4434]">Gerenciamento de Usuários</h3>
              <p className="text-sm text-[#4A6455]">
                Gerencie usuários e níveis de acesso da clínica.
              </p>
            </div>
          </div>
          <UsersManager />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#F0F5F2] p-2">
              <History className="h-5 w-5 text-[#3B9169]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#2A4434]">Logs de Auditoria</h3>
              <p className="text-sm text-[#4A6455]">
                Monitore ações do sistema e histórico de acesso.
              </p>
            </div>
          </div>
          <AuditLogsViewer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
