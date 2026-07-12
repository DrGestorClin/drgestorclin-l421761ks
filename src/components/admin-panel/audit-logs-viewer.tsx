import { useState, useEffect, useCallback } from 'react'
import { getAuditLogs, type AuditLog } from '@/services/audit-logs'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, History } from 'lucide-react'

export function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadLogs = useCallback(async () => {
    try {
      const data = await getAuditLogs({ limit: 100 })
      setLogs(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useRealtime('audit_logs', () => {
    loadLogs()
  })

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase()
    return (
      log.action.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      log.expand?.user?.name?.toLowerCase().includes(q)
    )
  })

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-[#2A4434]">
                      {log.expand?.user?.name || 'Sistema'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-[#EAF1EC] text-[#2A4434] border-0">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#628471]">{log.resource}</TableCell>
                    <TableCell className="text-[#628471] max-w-[300px] truncate">
                      {log.details || '-'}
                    </TableCell>
                    <TableCell className="text-[#628471] whitespace-nowrap text-sm">
                      {formatDate(log.created)}
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <History className="h-8 w-8 text-[#A0B5A9]" strokeWidth={1.5} />
                    <p className="text-[#628471] font-medium">
                      Nenhum registro de auditoria encontrado.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
