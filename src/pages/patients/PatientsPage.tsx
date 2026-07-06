import { useState } from 'react'
import { MOCK_PATIENTS, MOCK_HISTORY } from '@/lib/mock-data'
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
import { Search, Plus, UserCircle, Activity, AlertCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function PatientsPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_PATIENTS.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie o cadastro e histórico clínico dos pacientes.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo Paciente
        </Button>
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center max-w-sm relative bg-slate-50/50">
          <Search className="absolute left-7 top-6 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Telefone / WhatsApp</TableHead>
              <TableHead>Convênio</TableHead>
              <TableHead className="w-[80px] text-center">Prontuário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((pac) => (
              <TableRow key={pac.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${pac.id}`} />
                    <AvatarFallback>
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{pac.name}</span>
                </TableCell>
                <TableCell>{pac.cpf}</TableCell>
                <TableCell>{pac.age} anos</TableCell>
                <TableCell>{pac.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-50">
                    {pac.convenio}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
                      {pac.allergies && (
                        <div className="bg-destructive text-destructive-foreground p-3 text-sm font-semibold flex items-center gap-2 shadow-sm z-10">
                          <AlertCircle className="h-4 w-4" /> Alerta: Alergia a {pac.allergies}
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col overflow-hidden">
                        <SheetHeader className="mb-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border shadow-sm">
                              <AvatarImage
                                src={`https://img.usecurling.com/ppl/thumbnail?seed=${pac.id}`}
                              />
                            </Avatar>
                            <div>
                              <SheetTitle className="text-xl">{pac.name}</SheetTitle>
                              <p className="text-sm text-muted-foreground">
                                {pac.cpf} • {pac.age} anos
                              </p>
                            </div>
                          </div>
                        </SheetHeader>

                        <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
                          Linha do Tempo
                        </h4>
                        <ScrollArea className="flex-1 pr-4 -mr-4">
                          <div className="space-y-6 pb-6">
                            {MOCK_HISTORY.filter((h) => h.patientId === pac.id).map((hist) => (
                              <div key={hist.id} className="relative pl-6 border-l-2 border-muted">
                                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-white" />
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  {hist.date} • {hist.doctor}
                                </div>
                                <div className="font-semibold text-sm mb-1">{hist.type}</div>
                                <div className="text-sm bg-slate-50 border p-3 rounded-md shadow-sm">
                                  {hist.description}
                                </div>
                              </div>
                            ))}
                            {MOCK_HISTORY.filter((h) => h.patientId === pac.id).length === 0 && (
                              <div className="text-sm text-muted-foreground text-center py-8 bg-slate-50 rounded-md border border-dashed">
                                Nenhum histórico registrado para este paciente.
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
