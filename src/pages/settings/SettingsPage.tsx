import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { sendTestEmail } from '@/services/smtp'
import { useToast } from '@/hooks/use-toast'

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
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-1">Gerencie as configurações do sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Configuração de E-mail (SMTP)</CardTitle>
              <CardDescription>
                Envie um e-mail de teste para verificar se as configurações de SMTP do Gmail estão
                funcionando corretamente.
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
          <Button onClick={handleTestEmail} disabled={sending}>
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
    </div>
  )
}
