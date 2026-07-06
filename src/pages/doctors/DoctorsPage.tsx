import { useState } from 'react'
import { MOCK_DOCTORS } from '@/lib/mock-data'
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
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState(MOCK_DOCTORS)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSoftDelete = (id: string) => {
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'Inativo' } : d)))
    toast({ title: 'Médico inativado', description: 'O registro foi inativado por segurança.' })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Médicos</h2>
          <p className="text-muted-foreground mt-1">Gerencie o corpo clínico da sua instituição.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Médico
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Cadastrar Médico</SheetTitle>
              <SheetDescription>
                Preencha as informações para registrar um novo profissional.
              </SheetDescription>
            </SheetHeader>
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="contato">Contato</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
              </TabsList>
              <TabsContent value="geral" className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input placeholder="Ex: Dr. João Silva" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label>RG</Label>
                    <Input placeholder="00.000.000-X" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Conselho</Label>
                    <Select defaultValue="crm">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crm">CRM</SelectItem>
                        <SelectItem value="cro">CRO</SelectItem>
                        <SelectItem value="crp">CRP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input placeholder="123456" />
                  </div>
                  <div className="space-y-2">
                    <Label>UF</Label>
                    <Select defaultValue="sp">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sp">SP</SelectItem>
                        <SelectItem value="rj">RJ</SelectItem>
                        <SelectItem value="mg">MG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Especialidade Principal</Label>
                  <Input placeholder="Ex: Cardiologia" />
                </div>
              </TabsContent>
              <TabsContent value="contato" className="space-y-4">
                <div className="space-y-2">
                  <Label>E-mail Principal</Label>
                  <Input type="email" placeholder="medico@clinica.com" />
                </div>
                <div className="space-y-2">
                  <Label>Celular / WhatsApp</Label>
                  <Input placeholder="(11) 90000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Senha de Acesso</Label>
                  <Input type="password" />
                </div>
              </TabsContent>
              <TabsContent value="agenda" className="space-y-4">
                <div className="space-y-2">
                  <Label>Tempo Padrão de Consulta</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipos de Atendimento</Label>
                  <div className="flex gap-4">
                    <Badge variant="secondary">Presencial</Badge>
                    <Badge variant="outline">Telemedicina</Badge>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="docs" className="space-y-4">
                <div className="space-y-2">
                  <Label>Assinatura Digitalizada</Label>
                  <Input type="file" />
                </div>
                <div className="space-y-2">
                  <Label>Texto Padrão - Atestado</Label>
                  <Textarea
                    className="min-h-[120px]"
                    placeholder="Atesto para os devidos fins..."
                  />
                </div>
              </TabsContent>
            </Tabs>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() =>
                  toast({ title: 'Sucesso', description: 'Médico cadastrado com sucesso.' })
                }
              >
                Salvar Médico
              </Button>
            </div>
          </SheetContent>
        </Sheet>
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
              <TableHead>CRM / UF</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-semibold">{doc.name}</TableCell>
                <TableCell>
                  {doc.crm} - {doc.uf}
                </TableCell>
                <TableCell>{doc.specialty}</TableCell>
                <TableCell>{doc.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant={doc.status === 'Ativo' ? 'default' : 'secondary'}
                    className={
                      doc.status === 'Ativo'
                        ? 'bg-primary/10 text-primary hover:bg-primary/20 border-0'
                        : ''
                    }
                  >
                    {doc.status}
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => handleSoftDelete(doc.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Inativar (Soft Delete)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
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
