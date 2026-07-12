export const ROLES = {
  ADMIN: 'ADM',
  CLINICA: 'Clinica',
  STAFF: 'Assistente',
  DOCTOR: 'Medico',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<UserRole, string> = {
  ADM: 'Administrador',
  Clinica: 'Clínica',
  Assistente: 'Atendente',
  Medico: 'Médico',
}

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const ROLE_HIERARCHY: Record<string, number> = {
  ADM: 4,
  Clinica: 3,
  Assistente: 2,
  Medico: 1,
}

export function canManageUser(
  managerRole: string | undefined,
  targetRole: string | undefined,
): boolean {
  const managerLevel = ROLE_HIERARCHY[managerRole || ''] || 0
  const targetLevel = ROLE_HIERARCHY[targetRole || ''] || 0
  return managerLevel > targetLevel
}

export function getManageableRoles(role: string | undefined): string[] {
  const level = ROLE_HIERARCHY[role || ''] || 0
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, targetLevel]) => targetLevel < level)
    .map(([targetRole]) => targetRole)
}
