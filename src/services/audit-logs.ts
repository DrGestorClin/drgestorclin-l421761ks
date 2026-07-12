import pb from '@/lib/pocketbase/client'

export interface AuditLog {
  id: string
  user: string
  action: string
  resource: string
  resource_id: string
  details: string
  created: string
  updated: string
  expand?: { user?: { id: string; name: string; email: string } }
}

export const getAuditLogs = async (options?: {
  resourceId?: string
  action?: string
  limit?: number
}): Promise<AuditLog[]> => {
  const filters: string[] = []
  if (options?.resourceId) {
    filters.push(`resource_id = "${options.resourceId}"`)
  }
  if (options?.action) {
    filters.push(`action = "${options.action}"`)
  }
  const filter = filters.length > 0 ? filters.join(' && ') : undefined
  return pb.collection('audit_logs').getFullList({
    filter,
    sort: '-created',
    expand: 'user',
    ...(options?.limit ? { limit: options.limit } : {}),
  })
}

export const getAuditLogsByRecord = async (recordId: string): Promise<AuditLog[]> =>
  getAuditLogs({ resourceId: recordId })
