import pb from '@/lib/pocketbase/client'

export interface ClinicUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  doctor_ref?: string
  created: string
  updated: string
}

export const getUsers = async (): Promise<ClinicUser[]> =>
  pb.collection('users').getFullList({ sort: '-created' })

export const updateUserRole = async (id: string, role: string): Promise<ClinicUser> =>
  pb.collection('users').update(id, { role })

export const deleteUser = async (id: string): Promise<void> => pb.collection('users').delete(id)
