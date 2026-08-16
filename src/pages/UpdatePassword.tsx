import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, CheckCircle, ShieldAlert, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage, extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { passwordRules } from '@/lib/password-validation'
import logoUrl from '@/assets/image-70721.png'

export default function UpdatePasswordPage() {
  const { user, isAuthenticated, forcePasswordChange, signOut } = useAuth()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!forcePasswordChange) {
    return <Navigate to="/" replace />
  }

  const passwordsMatch = newPassword === confirmPassword
  const allRulesPassed = passwordRules.every((rule) => rule.test(newPassword))
  const canSubmit =
    allRulesPassed &&
    passwordsMatch &&
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !user) return
    if (!newPassword.trim() || !confirmPassword.trim()) return

    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      // Atualiza a senha e limpa o flag force_password_change.
      // O hook backend `clear_force_password_change.js` também força o
      // flag para false quando a senha muda, mas enviamos false aqui para
      // garantir mesmo se houver alguma falha no hook.
      await pb.collection('users').update(user.id, {
        password: newPassword.trim(),
        passwordConfirm: confirmPassword.trim(),
        force_password_change: false,
      })

      // Tenta atualizar a sessão local (authRefresh) para que o registro
      // em memória reflita force_password_change=false. Se falhar,
      // ainda assim redirecionamos para o dashboard, forçando um novo
      // login silencioso com a senha recém-definida quando possível.
      try {
        await pb.collection('users').authRefresh()
      } catch {
        // authRefresh pode falhar (ex.: token expirado). Tenta reautenticar
        // silenciosamente com a nova senha para manter a sessão ativa e o
        // flag atualizado em memória.
        try {
          const email = user.email
          await pb.collection('users').authWithPassword(email, newPassword.trim())
        } catch {
          // Não consegue manter a sessão — limpa o store. Mesmo assim o
          // usuário é redirecionado para o dashboard; o ProtectedRoute
          // cuidará de mandar para /login se não houver sessão.
          pb.authStore.clear()
        }
      }

      toast.success('Sua senha foi alterada com sucesso!')
      // Sempre redireciona para o dashboard, nunca para o login.
      navigate('/', { replace: true })
    } catch (err) {
      const fieldErrs = extractFieldErrors(err)
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs)
        setError('')
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--brand-green-light))] to-slate-100 p-4 pt-[0px]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={logoUrl}
              alt="DrGestorClin"
              className="max-h-20 w-auto object-contain max-w-full"
            />
          </div>
          <div>
            <CardTitle className="text-2xl">Atualização de Senha</CardTitle>
            <CardDescription className="mt-1">
              Por segurança, você deve definir uma nova senha antes de continuar.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Os dados coletados estão sujeitos às normas da LGPD. O sigilo médico e a
              responsabilidade jurídica sobre as informações inseridas são de total responsabilidade
              do profissional de saúde.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                name="passwordConfirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {!passwordsMatch && confirmPassword.length > 0 && (
                <p className="text-sm text-destructive">As senhas não coincidem.</p>
              )}
              {fieldErrors.passwordConfirm && (
                <p className="text-sm text-destructive">{fieldErrors.passwordConfirm}</p>
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

            {error && !fieldErrors.password && !fieldErrors.passwordConfirm && (
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
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                signOut()
                navigate('/login', { replace: true })
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair e Voltar para Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
