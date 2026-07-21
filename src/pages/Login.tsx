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
import logoUrl from '@/assets/image-70721.png'

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
    if (forgotLoading) return
    if (!forgotEmail.trim()) {
      setForgotError('Informe um endereço de e-mail.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(forgotEmail.trim())) {
      setForgotError('E-mail inválido. Verifique o formato do endereço.')
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
            <img
              src={logoUrl}
              alt="DrGestorClin"
              className="max-h-20 w-auto object-contain max-w-full"
            />
          </div>{' '}
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
              disabled={!email || !password || loading}
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

          {/* Botão Google removido temporariamente — OAuth clientId inválido.
              Para reativar, configurar um Client ID OAuth válido no Skip Cloud. */}

          <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-[hsl(var(--brand-green-dark))]">
                  Recuperar Senha
                </DialogTitle>
                <DialogDescription>
                  {forgotSuccess
                    ? ''
                    : 'Informe seu e-mail cadastrado para receber o link de recuperação.'}
                </DialogDescription>
              </DialogHeader>
              {forgotSuccess ? (
                <div className="space-y-4 py-2">
                  <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                    <MailCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">
                        Link de recuperação enviado!
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Link de recuperação enviado para o seu e-mail. Verifique sua caixa de
                        entrada e siga as instruções para recuperar seu acesso.
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
                      required
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
                    Enviar Link de Recuperação
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
