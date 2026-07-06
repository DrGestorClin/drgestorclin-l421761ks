import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getDoctors, createDoctor, softDeleteDoctor, type Doctor } from '@/services/doctors'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

const EMPTY_FORM = {
  name: '',
  crm: '',
  specialty: '',
  email: '',
  phone: '',
}

export default function DoctorsPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadDoctors = useCallback(async () => {
    try {
      const data = await getDoctors()
      setDoctors(data as Doctor[])
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar médicos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  useRealtime('doctors', () => {
    loadDoctors()
  })

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSoftDelete = async (id: string) => {
    try {
      await softDeleteDoctor(id)
      toast({
        title: 'Médico inativado',
        description: 'O registro foi inativado por segurança.',
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao inativar médico.',
        variant: 'destructive',
      })
    }
  }

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      await createDoctor({ ...formData, active: true })
      toast({
        title: 'Sucesso',
        description: 'Médico cadastrado com sucesso.',
      })
      setFormData(EMPTY_FORM)
      setSheetOpen(false)
      await loadDoctors()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({
        title: 'Erro',
        description: 'Verifique os campos do formulário.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      setFormData(EMPTY_FORM)
      setFieldErrors({})
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Médicos</h2>
          <p className="text-muted-foreground mt-1">Gerencie o corpo clínico da sua instituição.</p>
        </div>
        {isAdmin && (
          <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Médico
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Cadastrar Médico</SheetTitle>
                <SheetDescription>
                  Preencha as informações para registrar um novo profissional. Os dados são
                  preservados ao trocar de aba.
                </SheetDescription>
              </SheetHeader>
              <Tabs defaultValue="pessoal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="pessoal">Informações Pessoais</TabsTrigger>
                  <TabsTrigger value="profissional">Dados Profissionais</TabsTrigger>
                </TabsList>
                <TabsContent value="pessoal" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="Ex: Dr. João Silva"
                    />
                    {fieldErrors.name && (
                      <p className="text-sm text-destructive">{fieldErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="medico@clinica.com"
                    />
                    {fieldErrors.email && (
                      <p className="text-sm text-destructive">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Celular / WhatsApp</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder="(11) 90000-0000"
                    />
                    {fieldErrors.phone && (
                      <p className="text-sm text-destructive">{fieldErrors.phone}</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="profissional" className="space-y-4">
                  <div className="space-y-2">
                    <Label>CRM</Label>
                    <Input
                      value={formData.crm}
                      onChange={(e) => handleFieldChange('crm', e.target.value)}
                      placeholder="12345-SP"
                    />
                    {fieldErrors.crm && (
                      <p className="text-sm text-destructive">{fieldErrors.crm}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Especialidade</Label>
                    <Input
                      value={formData.specialty}
                      onChange={(e) => handleFieldChange('specialty', e.target.value)}
                      placeholder="Ex: Cardiologia"
                    />
                    {fieldErrors.specialty && (
                      <p className="text-sm text-destructive">{fieldErrors.specialty}</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Salvar Médico
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center max-w-sm relative bg-slate-50/50">
          <Search className="absolute left-7 top-6 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CRM</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-semibold">{doc.name}</TableCell>
                    <TableCell>{doc.crm}</TableCell>
                    <TableCell>{doc.specialty}</TableCell>
                    <TableCell>{doc.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={doc.active ? 'default' : 'secondary'}
                        className={
                          doc.active
                            ? 'bg-primary/10 text-primary hover:bg-primary/20 border-0'
                            : ''
                        }
                      >
                        {doc.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isAdmin && (
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                          )}
                          {isAdmin && doc.active && (
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleSoftDelete(doc.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Inativar (Soft Delete)
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Nenhum médico encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
