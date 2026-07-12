import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Lock, CheckCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const passwordRules = [
  { test: (p: string) => p.length >= 8, label: 'Mínimo de 8 caracteres' },
  { test: (p: string) => /[a-z]/.test(p), label: 'Pelo menos uma letra minúscula' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Pelo menos uma letra maiúscula' },
  { test: (p: string) => /[0-9]/.test(p), label: 'Pelo menos um número' },
  {
    test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
    label: 'Pelo menos um caractere especial',
  },
]

export default function UpdatePasswordPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const passwordsMatch = newPassword === confirmPassword
  const allRulesPassed = passwordRules.every((rule) => rule.test(newPassword))
  const canSubmit = allRulesPassed && passwordsMatch && newPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !user) return

    setLoading(true)
    setError('')

    try {
      const updated = await pb.collection('users').update(user.id, {
        password: newPassword,
        passwordConfirm: confirmPassword,
        force_password_change: false,
      })
      pb.authStore.save(pb.authStore.token, updated)
      window.location.href = '/'
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--brand-green-light))] to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-[hsl(var(--brand-green-light))] p-3">
              <Lock className="h-8 w-8 text-[hsl(var(--brand-green-dark))]" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Atualização de Senha</CardTitle>
            <CardDescription className="mt-1">
              Por segurança, você deve definir uma nova senha antes de continuar.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              {!passwordsMatch && confirmPassword.length > 0 && (
                <p className="text-sm text-destructive">As senhas não coincidem.</p>
              )}
            </div>

            <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
              {passwordRules.map((rule, i) => {
                const passed = rule.test(newPassword)
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {passed ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />
                    )}
                    <span className={passed ? 'text-green-700' : 'text-muted-foreground'}>
                      {rule.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center bg-destructive/10 rounded-md py-2 px-3">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-dark))] text-white"
              disabled={!canSubmit || loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Atualizar Senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
