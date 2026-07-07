import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import {
  createPatient,
  updatePatient,
  getPatient,
  getPatientPhotoUrl,
  type Patient,
} from '@/services/patients'
import type { Doctor } from '@/services/doctors'

const EMPTY_FORM = { name: '', birth_date: '', email: '', phone: '', doctor: '' }

interface PatientFormSheetProps {
  doctors: Doctor[]
  onSuccess: () => void
  patient?: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientFormSheet({
  doctors,
  onSuccess,
  patient,
  open,
  onOpenChange,
}: PatientFormSheetProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (patient) {
        setFormData({
          name: patient.name,
          birth_date: patient.birth_date || '',
          email: patient.email || '',
          phone: patient.phone || '',
          doctor: patient.doctor,
        })
        setPhotoPreview(getPatientPhotoUrl(patient))
      } else {
        setFormData(EMPTY_FORM)
        setPhotoPreview(null)
      }
      setSelectedPhoto(null)
      setFieldErrors({})
    }
  }, [open, patient])

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      setFieldErrors({ email: 'Formato de e-mail inválido.' })
      setSaving(false)
      return
    }

    try {
      const data = {
        name: formData.name,
        birth_date: formData.birth_date || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        doctor: formData.doctor,
        ...(selectedPhoto ? { photo: selectedPhoto } : {}),
      }
      if (patient) {
        await updatePatient(patient.id, data)
        toast({ title: 'Sucesso', description: 'Paciente atualizado com sucesso.' })
      } else {
        const created = await createPatient(data)
        if (formData.email) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          try {
            const updated = await getPatient(created.id)
            if (updated.email_status === 'sent') {
              toast({
                title: 'Sucesso',
                description: 'Cadastro realizado e e-mail de boas-vindas enviado!',
              })
            } else if (updated.email_status === 'failed') {
              toast({
                title: 'Atenção',
                description:
                  'Cadastro realizado, mas houve um erro ao enviar o e-mail. Verifique as configurações de SMTP.',
                variant: 'destructive',
              })
            } else {
              toast({ title: 'Sucesso', description: 'Paciente cadastrado com sucesso.' })
            }
          } catch {
            toast({ title: 'Sucesso', description: 'Paciente cadastrado com sucesso.' })
          }
        } else {
          toast({ title: 'Sucesso', description: 'Paciente cadastrado com sucesso.' })
        }
      }
      onOpenChange(false)
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{patient ? 'Editar Paciente' : 'Cadastrar Paciente'}</SheetTitle>
          <SheetDescription>
            Preencha as informações do paciente. Os dados são preservados ao trocar de aba.
          </SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="pessoal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pessoal">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="medico">Dados Médicos</TabsTrigger>
          </TabsList>
          <TabsContent value="pessoal" className="space-y-4">
            <div className="space-y-2">
              <Label>Foto do Paciente</Label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full border flex items-center justify-center bg-muted">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="flex-1"
                />
              </div>
            </div>
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
                  Nenhum médico encontrado. Cadastre médicos primeiro.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {patient ? 'Salvar Alterações' : 'Salvar Paciente'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
