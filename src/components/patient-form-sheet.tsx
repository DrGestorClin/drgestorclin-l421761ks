import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { createPatient } from '@/services/patients'
import type { Doctor } from '@/services/doctors'

const EMPTY_FORM = {
  name: '',
  birth_date: '',
  email: '',
  phone: '',
  doctor: '',
}

interface PatientFormSheetProps {
  doctors: Doctor[]
  onSuccess: () => void
}

export function PatientFormSheet({ doctors, onSuccess }: PatientFormSheetProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

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
      await createPatient({
        name: formData.name,
        birth_date: formData.birth_date || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        doctor: formData.doctor,
      })
      toast({
        title: 'Sucesso',
        description: 'Paciente cadastrado com sucesso.',
      })
      setFormData(EMPTY_FORM)
      setOpen(false)
      onSuccess()
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

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) setFieldErrors({})
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo Paciente
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Cadastrar Paciente</SheetTitle>
          <SheetDescription>
            Preencha as informações para registrar um novo paciente. Os dados são preservados ao
            trocar de aba.
          </SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="pessoal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pessoal">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="medico">Dados Médicos</TabsTrigger>
          </TabsList>
          <TabsContent value="pessoal" className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Ex: Ana Costa"
              />
              {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleFieldChange('birth_date', e.target.value)}
              />
              {fieldErrors.birth_date && (
                <p className="text-sm text-destructive">{fieldErrors.birth_date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="paciente@email.com"
              />
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Celular / WhatsApp</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="(11) 90000-0000"
              />
              {fieldErrors.phone && <p className="text-sm text-destructive">{fieldErrors.phone}</p>}
            </div>
          </TabsContent>
          <TabsContent value="medico" className="space-y-4">
            <div className="space-y-2">
              <Label>Médico Responsável</Label>
              <Select value={formData.doctor} onValueChange={(v) => handleFieldChange('doctor', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico responsável" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} — {d.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.doctor && (
                <p className="text-sm text-destructive">{fieldErrors.doctor}</p>
              )}
              {doctors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum médico ativo encontrado. Cadastre médicos primeiro.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar Paciente
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
