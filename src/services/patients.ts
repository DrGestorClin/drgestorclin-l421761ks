import pb from '@/lib/pocketbase/client'
import type { Doctor } from '@/services/doctors'

export interface Patient {
  id: string
  name: string
  birth_date: string
  email: string
  phone: string
  doctor: string
  photo?: string
  created: string
  updated: string
  expand?: { doctor?: Doctor }
}

export const getPatients = async (): Promise<Patient[]> =>
  pb.collection('patients').getFullList({
    expand: 'doctor',
    sort: '-created',
  })

export const getPatient = async (id: string): Promise<Patient> =>
  pb.collection('patients').getOne(id, { expand: 'doctor' })

export const getPatientsByDoctor = async (doctorId: string): Promise<Patient[]> =>
  pb.collection('patients').getFullList({
    filter: `doctor = "${doctorId}"`,
    expand: 'doctor',
    sort: '-created',
  })

export const getHistoricalPatients = async (doctorId: string): Promise<Patient[]> => {
  const records = await pb.collection('medical_records').getFullList({
    filter: `doctor = "${doctorId}"`,
  })

  const patientIds = [...new Set(records.map((r: any) => r.patient))]

  if (patientIds.length === 0) return []

  const filterStr = patientIds.map((pid) => `id = "${pid}"`).join(' || ')

  const patients = await pb.collection('patients').getFullList({
    filter: filterStr,
    expand: 'doctor',
  })

  return patients.filter((p: any) => p.doctor !== doctorId) as Patient[]
}

export const createPatient = async (data: {
  name: string
  birth_date?: string
  email?: string
  phone?: string
  doctor: string
  photo?: File
}): Promise<Patient> => {
  if (data.photo) {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.birth_date) formData.append('birth_date', data.birth_date)
    if (data.email) formData.append('email', data.email)
    if (data.phone) formData.append('phone', data.phone)
    formData.append('doctor', data.doctor)
    formData.append('photo', data.photo)
    return pb.collection('patients').create(formData)
  }
  const { photo, ...rest } = data
  return pb.collection('patients').create(rest)
}

export const updatePatient = async (
  id: string,
  data: Partial<{
    name: string
    birth_date: string
    email: string
    phone: string
    doctor: string
    photo: File
  }>,
): Promise<Patient> => {
  if (data.photo) {
    const formData = new FormData()
    if (data.name !== undefined) formData.append('name', data.name)
    if (data.birth_date !== undefined) formData.append('birth_date', data.birth_date)
    if (data.email !== undefined) formData.append('email', data.email)
    if (data.phone !== undefined) formData.append('phone', data.phone)
    if (data.doctor !== undefined) formData.append('doctor', data.doctor)
    formData.append('photo', data.photo)
    return pb.collection('patients').update(id, formData)
  }
  const { photo, ...rest } = data
  return pb.collection('patients').update(id, rest)
}

export const deletePatient = async (id: string): Promise<void> =>
  pb.collection('patients').delete(id)

export const getPatientPhotoUrl = (patient: Patient): string | null => {
  if (!patient.photo) return null
  return `${pb.baseURL}/api/files/patients/${patient.id}/${patient.photo}`
}
