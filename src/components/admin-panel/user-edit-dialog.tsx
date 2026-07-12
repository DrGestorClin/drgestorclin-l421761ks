import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { updateUser, type ClinicUser } from '@/services/users'
import { getEstablishments, type Establishment } from '@/services/establishments'
import { ROLE_LABELS, getManageableRoles } from '@/lib/roles'
import { useAuth } from '@/hooks/use-auth'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  onUpdated,
}: {
  user: ClinicUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}) {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [establishmentRef, setEstablishmentRef] = useState('')
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && open) {
      setName(user.name || '')
      setRole(user.role || '')
      setEstablishmentRef(user.establishment_ref || '')
      getEstablishments()
        .then(setEstablishments)
        .catch(() => {})
    }
  }, [user, open])

  const manageableRoles = currentUser ? getManageableRoles(currentUser.role) : []
  const roleOptions: { value: string; label: string }[] = manageableRoles.map((r) => ({
    value: r,
    label: ROLE_LABELS[r as keyof typeof ROLE_LABELS] || r,
  }))
  if (user && !manageableRoles.includes(user.role)) {
    roleOptions.unshift({
      value: user.role,
      label: ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role,
    })
  }

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    try {
      await updateUser(user.id, {
        name: name.trim(),
        role: role as 'ADM' | 'Clinica' | 'Medico' | 'Assistente',
        establishment_ref: establishmentRef || undefined,
      })
      toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso.' })
      onOpenChange(false)
      onUpdated()
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={user.email} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Estabelecimento</Label>
            <Select value={establishmentRef} onValueChange={setEstablishmentRef}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um estabelecimento" />
              </SelectTrigger>
              <SelectContent>
                {establishments.map((est) => (
                  <SelectItem key={est.id} value={est.id}>
                    {est.name} ({est.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="bg-[#3B9169] hover:bg-[#28533D]"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
