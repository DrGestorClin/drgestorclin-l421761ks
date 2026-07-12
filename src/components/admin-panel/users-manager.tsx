import { useState, useEffect, useCallback, useMemo } from 'react'
import { getUsers, updateUserRole, deleteUser, type ClinicUser } from '@/services/users'
import { getEstablishments, type Establishment } from '@/services/establishments'
import { useRealtime } from '@/hooks/use-realtime'
import { ROLE_LABELS, canManageUser, getManageableRoles } from '@/lib/roles'
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
import {
  MoreHorizontal,
  Trash2,
  ShieldCheck,
  User,
  UserPlus,
  Building2,
  Stethoscope,
  Pencil,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { UserCreateDialog } from '@/components/admin-panel/user-create-dialog'
import { UserEditDialog } from '@/components/admin-panel/user-edit-dialog'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

const ROLE_ICONS: Record<string, React.ElementType> = {
  ADM: ShieldCheck,
  Clinica: Building2,
  Assistente: User,
  Medico: Stethoscope,
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  ADM: 'bg-violet-100 text-violet-700 border-violet-200',
  Clinica: 'bg-teal-100 text-teal-700 border-teal-200',
  Assistente: 'bg-sky-100 text-sky-700 border-sky-200',
  Medico: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export function UsersManager() {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<ClinicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState<ClinicUser | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      await getUsers()
      setUsers(await getUsers())
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar usuários.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('users', () => loadData())

  const grouped = useMemo(() => {
    const groups = new Map<string, { establishment: Establishment | null; users: ClinicUser[] }>()
    const noEstKey = '__no_establishment__'
    groups.set(noEstKey, { establishment: null, users: [] })

    for (const u of users) {
      const est = u.expand?.establishment_ref
      if (est) {
        const key = est.id
        if (!groups.has(key)) groups.set(key, { establishment: est, users: [] })
        groups.get(key)!.users.push(u)
      } else {
        groups.get(noEstKey)!.users.push(u)
      }
    }

    const result = Array.from(groups.values()).filter((g) => g.users.length > 0)
    result.sort((a, b) => {
      if (!a.establishment && !b.establishment) return 0
      if (!a.establishment) return 1
      if (!b.establishment) return -1
      return a.establishment.name.localeCompare(b.establishment.name)
    })
    return result
  }, [users])

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateUserRole(id, role)
      toast({ title: 'Sucesso', description: 'Role atualizada com sucesso.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar role.', variant: 'destructive' })
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
      toast({ title: 'Erro', description: 'Falha ao excluir usuário.', variant: 'destructive' })
    }
  }

  const handleEdit = (u: ClinicUser) => {
    setEditUser(u)
    setEditOpen(true)
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

  const getRoleOptions = (targetUser: ClinicUser) => {
    const manageable = getManageableRoles(currentUser?.role)
    const options = manageable.map((r) => ({
      value: r,
      label: ROLE_LABELS[r as keyof typeof ROLE_LABELS] || r,
    }))
    if (!manageable.includes(targetUser.role)) {
      options.unshift({
        value: targetUser.role,
        label: ROLE_LABELS[targetUser.role as keyof typeof ROLE_LABELS] || targetUser.role,
      })
    }
    return options
  }

  const renderUserRow = (u: ClinicUser) => {
    const RoleIcon = ROLE_ICONS[u.role] || User
    const canManage = canManageUser(currentUser?.role, u.role)
    const isSelf = u.id === currentUser?.id

    return (
      <div
        key={u.id}
        className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-white hover:bg-accent/20 transition-colors px-4 py-3"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar className="h-9 w-9 border border-[#CDE0D5] shrink-0">
            <AvatarImage src={getAvatarUrl(u)} />
            <AvatarFallback className="bg-[#E5EFE9] text-[#4A6455] text-xs font-bold">
              {getInitials(u.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#2A4434] truncate">{u.name || 'Sem nome'}</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] py-0 px-1.5 font-medium border',
                  ROLE_BADGE_STYLES[u.role],
                )}
              >
                <RoleIcon className="h-2.5 w-2.5 mr-0.5" />
                {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}
              </Badge>
            </div>
            <p className="text-xs text-[#628471] truncate">{u.email}</p>
            {u.role === 'Medico' && u.expand?.doctor_ref && (
              <p className="text-[11px] text-[#8A9E92] flex items-center gap-1 mt-0.5">
                <Stethoscope className="h-3 w-3" />
                {u.expand.doctor_ref.specialty}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={u.role}
            onValueChange={(value) => handleRoleChange(u.id, value)}
            disabled={!canManage || isSelf}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getRoleOptions(u).map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleEdit(u)}
                disabled={!canManage || isSelf}
              >
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer"
                onClick={() => handleDelete(u.id)}
                disabled={!canManage || isSelf}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#4A6455]">{users.length} usuário(s) cadastrado(s)</p>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#3B9169] hover:bg-[#28533D]">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.establishment?.id || '__none__'} className="space-y-3">
              {group.establishment ? (
                <div className="flex items-center gap-2.5 px-1">
                  <div className="rounded-lg bg-[#F0F5F2] p-1.5">
                    <Building2 className="h-4 w-4 text-[#3B9169]" />
                  </div>
                  <h4 className="font-bold text-[#2A4434] text-sm">{group.establishment.name}</h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] py-0 px-1.5',
                      group.establishment.type === 'Clínica'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200',
                    )}
                  >
                    {group.establishment.type}
                  </Badge>
                  <span className="text-xs text-[#8A9E92]">{group.users.length} usuário(s)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 px-1">
                  <div className="rounded-lg bg-amber-50 p-1.5">
                    <Building2 className="h-4 w-4 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-amber-700 text-sm">Sem Estabelecimento</h4>
                  <span className="text-xs text-[#8A9E92]">{group.users.length} usuário(s)</span>
                </div>
              )}
              <div className="space-y-2 pl-1">{group.users.map(renderUserRow)}</div>
            </div>
          ))}
          {!loading && users.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      )}

      <UserCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <UserEditDialog
        user={editUser}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={loadData}
      />
    </div>
  )
}
