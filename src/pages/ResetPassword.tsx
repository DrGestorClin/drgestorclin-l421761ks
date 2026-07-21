import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, CheckCircle, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage, extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { passwordRules } from '@/lib/password-validation'
import logoUrl from '@/assets/image-70721.png'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--brand-green-light))] to-slate-100 p-4">
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
              <CardTitle className="text-2xl">Link Inválido</CardTitle>
              <CardDescription className="mt-1">
                O link de redefinição de senha é inválido ou expirou.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-dark))] text-white"
              onClick={() => navigate('/login', { replace: true })}
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
    if (!canSubmit) return

    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      await pb
        .collection('users')
        .confirmPasswordReset(token, newPassword.trim(), confirmPassword.trim())
      setSuccess(true)
      toast.success('Sua senha foi redefinida com sucesso!')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--brand-green-light))] to-slate-100 p-4">
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
            <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
            <CardDescription className="mt-1">
              {success ? '' : 'Defina sua nova senha de acesso ao DrGestorClin.'}
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

          {success ? (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800 font-medium">
                    Senha redefinida com sucesso!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Você será redirecionado para a tela de login em instantes.
                  </p>
                </div>
              </div>
              <Button
                className="w-full bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-dark))] text-white"
                onClick={() => navigate('/login', { replace: true })}
              >
                Ir para Login
              </Button>
            </div>
          ) : (
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
                Redefinir Senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
