import pb from '@/lib/pocketbase/client'

export interface Doctor {
  id: string
  name: string
  crm: string
  specialty: string
  email: string
  phone: string
  active: boolean
  created: string
  updated: string
}

export const getDoctors = async (): Promise<Doctor[]> =>
  pb.collection('doctors').getFullList({
    filter: 'active = true',
    sort: '-created',
  })

export const createDoctor = async (data: {
  name: string
  crm: string
  specialty: string
  email: string
  phone: string
  active: boolean
}): Promise<Doctor> => pb.collection('doctors').create(data)

export const updateDoctor = async (id: string, data: Partial<Doctor>): Promise<Doctor> =>
  pb.collection('doctors').update(id, data)

export const softDeleteDoctor = async (id: string): Promise<Doctor> =>
  pb.collection('doctors').update(id, { active: false })

export const getAllDoctors = async (): Promise<Doctor[]> =>
  pb.collection('doctors').getFullList({
    sort: '-created',
  })

export const deleteDoctor = async (id: string): Promise<void> => pb.collection('doctors').delete(id)
