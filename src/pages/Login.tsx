import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import logoUrl from '@/assets/geminigeneratedimagel0e5l0l0e5l0l0e5-7b51d.png'

export default function LoginPage() {
  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError(getErrorMessage(error))
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img
              src={logoUrl}
              alt="DrGestorClin Logo"
              className="h-32 object-contain bg-transparent"
            />
          </div>
          <p className="text-muted-foreground">Faça login para acessar o sistema</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-lg border shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@clinica.com"
              required
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
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Entrar
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground">
          Use o e-mail e senha fornecidos pela administração.
        </p>
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <a
            href="https://www.drgestorclin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-primary transition-colors"
          >
            www.drgestorclin.com
          </a>
        </div>
      </div>
    </div>
  )
}
