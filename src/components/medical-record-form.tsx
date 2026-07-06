import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { createMedicalRecord } from '@/services/medical-records'
import { getMedicalRecordTemplates, type MedicalRecordTemplate } from '@/services/medical-templates'
import type { Doctor } from '@/services/doctors'

interface MedicalRecordFormProps {
  patientId: string
  doctors: Doctor[]
  defaultDoctorId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MedicalRecordForm({
  patientId,
  doctors,
  defaultDoctorId,
  open,
  onOpenChange,
  onSuccess,
}: MedicalRecordFormProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<MedicalRecordTemplate[]>([])
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [doctorId, setDoctorId] = useState(defaultDoctorId)
  const [content, setContent] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (open) {
      getMedicalRecordTemplates()
        .then(setTemplates)
        .catch(() => {})
      setTitle('')
      setContent('')
      setDoctorId(defaultDoctorId)
      setFieldErrors({})
    }
  }, [open, defaultDoctorId])

  const handleTemplateChange = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId)
    if (tpl) {
      setContent(tpl.content)
      if (!title) setTitle(tpl.name)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      await createMedicalRecord({ patient: patientId, doctor: doctorId, title, content })
      toast({ title: 'Sucesso', description: 'Prontuário criado com sucesso.' })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Verifique os campos.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--brand-green-dark))]">Novo Prontuário</DialogTitle>
          <DialogDescription>Crie um registro clínico para o paciente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Consulta de rotina"
            />
            {fieldErrors.title && <p className="text-sm text-destructive">{fieldErrors.title}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Médico</Label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.doctor && (
                <p className="text-sm text-destructive">{fieldErrors.doctor}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="font-mono text-sm resize-y"
              placeholder="Digite ou selecione um modelo..."
            />
            {fieldErrors.content && (
              <p className="text-sm text-destructive">{fieldErrors.content}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-dark))] text-white border-0"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
