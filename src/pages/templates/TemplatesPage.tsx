import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getMedicalRecordTemplates,
  deleteMedicalRecordTemplate,
  type MedicalRecordTemplate,
} from '@/services/medical-templates'
import { useToast } from '@/hooks/use-toast'
import { TemplateFormDialog } from '@/components/template-form-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, FileText } from 'lucide-react'

export default function TemplatesPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<MedicalRecordTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getMedicalRecordTemplates()
      setTemplates(data)
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar modelos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('medical_record_templates', () => {
    loadData()
  })

  const handleDelete = async (templateId: string) => {
    try {
      await deleteMedicalRecordTemplate(templateId)
      toast({ title: 'Sucesso', description: 'Modelo excluído.' })
      loadData()
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir modelo.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--brand-green-dark))]">
            Modelos de Prontuário
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie modelos estruturados para documentação clínica.
          </p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green-dark))] text-white border-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Modelo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))
          : templates.map((t) => (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <FileText className="h-5 w-5 text-[hsl(var(--brand-green))]" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base mt-2">{t.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-xs font-mono text-muted-foreground line-clamp-4">
                    {t.content}
                  </pre>
                </CardContent>
              </Card>
            ))}
        {!loading && templates.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum modelo encontrado. Crie o primeiro!
            </CardContent>
          </Card>
        )}
      </div>

      <TemplateFormDialog open={formOpen} onOpenChange={setFormOpen} onSuccess={loadData} />
    </div>
  )
}
