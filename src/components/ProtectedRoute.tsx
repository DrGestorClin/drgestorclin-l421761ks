import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function ProtectedRoute({
  adminOnly = false,
  forcePasswordChangeGuard = false,
}: {
  adminOnly?: boolean
  forcePasswordChangeGuard?: boolean
}) {
  const { isAuthenticated, isAdmin, loading, forcePasswordChange } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (forcePasswordChangeGuard && forcePasswordChange) {
    return <Navigate to="/update-password" replace />
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          <Button asChild>
            <Link to="/">Voltar ao Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
