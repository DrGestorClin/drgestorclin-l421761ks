import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Loader2, MailCheck, KeyRound } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { forgotPassword } from '@/services/auth'
import logoUrl from '@/assets/geminigeneratedimagel0e5l0l0e5l0l0e5-7b51d.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWith, isAuthenticated, forcePasswordChange } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const redirectHandled = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !redirectHandled.current) {
      redirectHandled.current = true
      navigate(forcePasswordChange ? '/update-password' : '/', { replace: true })
    }
  }, [isAuthenticated, forcePasswordChange, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error, forcePasswordChange: fpc } = await signIn(email, password)
    if (error) {
      setError(getErrorMessage(error))
      setLoading(false)
    } else {
      redirectHandled.current = true
      navigate(fpc ? '/update-password' : '/')
    }
  }

  const handleGoogle = async () => {
    setOauthLoading(true)
    setError('')
    const { error } = await signInWith('google')
    if (error) {
      setError(getErrorMessage(error))
      setOauthLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Informe um endereço de e-mail.')
      return
    }
    setForgotLoading(true)
    setForgotError('')
    const result = await forgotPassword(forgotEmail)
    setForgotLoading(false)
    if (result.success) {
      setForgotSuccess(true)
    } else {
      setForgotError(result.message)
    }
  }

  const openForgotDialog = () => {
    setForgotOpen(true)
    setForgotSuccess(false)
    setForgotError('')
    setForgotEmail('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--brand-green-light))] to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoUrl} alt="DrGestorClin" className="max-h-20 w-auto object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl">Bem-vindo</CardTitle>
            <CardDescription className="mt-1">
              Faça login para acessar o sistema de gestão clínica
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center bg-destructive/10 rounded-md py-2 px-3">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-dark))] text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Entrar
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={openForgotDialog}
              className="text-sm text-muted-foreground hover:text-[hsl(var(--brand-green-dark))] transition-colors inline-flex items-center gap-1"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Esqueci minha senha
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={oauthLoading}
          >
            {oauthLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continuar com Google
          </Button>

          <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-[hsl(var(--brand-green-dark))]">
                  Recuperar Senha
                </DialogTitle>
                <DialogDescription>
                  {forgotSuccess
                    ? ''
                    : 'Informe seu e-mail cadastrado para receber uma senha provisória.'}
                </DialogDescription>
              </DialogHeader>
              {forgotSuccess ? (
                <div className="space-y-4 py-2">
                  <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                    <MailCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">
                        Senha provisória enviada!
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Se o e-mail estiver cadastrado e for de um administrador ou médico, você
                        receberá uma senha provisória. Por favor, verifique sua caixa de entrada e
                        altere a senha após o login.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-dark))] text-white"
                    onClick={() => {
                      setForgotOpen(false)
                      setForgotSuccess(false)
                    }}
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">E-mail cadastrado</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu@email.com"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleForgotPassword()
                        }
                      }}
                    />
                    {forgotError && <p className="text-sm text-destructive">{forgotError}</p>}
                  </div>
                  <Button
                    className="w-full bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-dark))] text-white"
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    Enviar Senha Provisória
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
