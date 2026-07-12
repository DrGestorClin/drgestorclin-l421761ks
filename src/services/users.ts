import pb from '@/lib/pocketbase/client'

export interface ClinicUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  doctor_ref?: string
  establishment_ref?: string
  force_password_change?: boolean
  created: string
  updated: string
}

export const getUsers = async (): Promise<ClinicUser[]> =>
  pb.collection('users').getFullList({ sort: '-created' })

export const updateUserRole = async (id: string, role: string): Promise<ClinicUser> =>
  pb.collection('users').update(id, { role })

export const deleteUser = async (id: string): Promise<void> => pb.collection('users').delete(id)

export const createUser = async (data: {
  name: string
  email: string
  password: string
  role: 'admin' | 'doctor' | 'staff'
  doctor_ref?: string
  establishment_ref?: string
}): Promise<ClinicUser> =>
  pb.collection('users').create({
    email: data.email,
    password: data.password,
    passwordConfirm: data.password,
    name: data.name,
    role: data.role,
    doctor_ref: data.doctor_ref,
    establishment_ref: data.establishment_ref,
    force_password_change: true,
  })
