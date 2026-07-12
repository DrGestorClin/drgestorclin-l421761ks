import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, CheckCircle, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage, extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { passwordRules } from '@/lib/password-validation'
import { Captcha } from '@/components/captcha'
import logoUrl from '@/assets/image-70721.png'

export default function UpdatePasswordPage() {
  const { user, isAuthenticated, forcePasswordChange, signOut } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaKey, setCaptchaKey] = useState(0)

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
    confirmPassword.trim().length > 0 &&
    captchaVerified

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !user) return
    if (!newPassword.trim() || !confirmPassword.trim()) return

    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      await pb.collection('users').update(user.id, {
        password: newPassword.trim(),
        passwordConfirm: confirmPassword.trim(),
        force_password_change: false,
      })
      signOut()
      toast.success('Senha atualizada com sucesso! Redirecionando para o login...')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    } catch (err) {
      const fieldErrs = extractFieldErrors(err)
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs)
        setError('')
      } else {
        setError(getErrorMessage(err))
      }
      setCaptchaVerified(false)
      setCaptchaKey((k) => k + 1)
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

            <Captcha key={captchaKey} onVerify={setCaptchaVerified} />
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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
