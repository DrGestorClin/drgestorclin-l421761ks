export const ROLES = {
  ADMIN: 'ADM',
  DOCTOR: 'Medico',
  STAFF: 'Assistente',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<UserRole, string> = {
  ADM: 'Administrador',
  Medico: 'Médico',
  Assistente: 'Assistente',
}

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}))
