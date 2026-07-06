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
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { createMedicalRecordTemplate } from '@/services/medical-templates'

interface TemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TemplateFormDialog({ open, onOpenChange, onSuccess }: TemplateFormDialogProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (open) {
      setName('')
      setContent('')
      setFieldErrors({})
    }
  }, [open])

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      await createMedicalRecordTemplate({ name, content })
      toast({ title: 'Sucesso', description: 'Modelo criado com sucesso.' })
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
          <DialogTitle className="text-[hsl(var(--brand-green-dark))]">Novo Modelo</DialogTitle>
          <DialogDescription>Crie um modelo estruturado para prontuários.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Modelo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Evolução SOAP"
            />
            {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Conteúdo / Estrutura</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="font-mono text-sm resize-y"
              placeholder={'S:\nO:\nA:\nP:'}
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
