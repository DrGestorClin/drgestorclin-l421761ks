import { useState, useEffect, useCallback } from 'react'
import { getUsers, updateUserRole, deleteUser, type ClinicUser } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreHorizontal, Trash2, ShieldCheck, User, UserCog, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { UserCreateDialog } from '@/components/admin-panel/user-create-dialog'
import pb from '@/lib/pocketbase/client'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  doctor: 'Médico',
  staff: 'Atendente',
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  admin: ShieldCheck,
  doctor: UserCog,
  staff: User,
}

export function UsersManager() {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<ClinicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar usuários.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useRealtime('users', () => {
    loadUsers()
  })

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateUserRole(id, role)
      toast({ title: 'Sucesso', description: 'Role atualizada com sucesso.' })
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar role.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      toast({
        title: 'Aviso',
        description: 'Você não pode excluir sua própria conta.',
        variant: 'destructive',
      })
      return
    }
    try {
      await deleteUser(id)
      toast({ title: 'Sucesso', description: 'Usuário excluído com sucesso.' })
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir usuário.',
        variant: 'destructive',
      })
    }
  }

  const getAvatarUrl = (u: ClinicUser) =>
    u.avatar ? `${pb.baseURL}/api/files/_pb_users_auth_/${u.id}/${u.avatar}` : ''

  const getInitials = (name: string) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#4A6455]">{users.length} usuário(s) cadastrado(s)</p>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#3B9169] hover:bg-[#28533D]">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : users.map((u) => {
                  const RoleIcon = ROLE_ICONS[u.role] || User
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-[#CDE0D5]">
                            <AvatarImage src={getAvatarUrl(u)} />
                            <AvatarFallback className="bg-[#E5EFE9] text-[#4A6455] text-xs font-bold">
                              {getInitials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-[#2A4434]">
                            {u.name || 'Sem nome'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#628471]">{u.email}</TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(value) => handleRoleChange(u.id, value)}
                        >
                          <SelectTrigger className="w-[160px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">
                              <span className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5" /> Administrador
                              </span>
                            </SelectItem>
                            <SelectItem value="doctor">
                              <span className="flex items-center gap-2">
                                <UserCog className="h-3.5 w-3.5" /> Médico
                              </span>
                            </SelectItem>
                            <SelectItem value="staff">
                              <span className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5" /> Atendente
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer"
                              onClick={() => handleDelete(u.id)}
                              disabled={u.id === currentUser?.id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <UserCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
