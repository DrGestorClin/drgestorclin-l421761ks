import pb from '@/lib/pocketbase/client'
import type { Doctor } from '@/services/doctors'

export interface Patient {
  id: string
  name: string
  birth_date: string
  email: string
  phone: string
  doctor: string
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
}): Promise<Patient> => pb.collection('patients').create(data)

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> =>
  pb.collection('patients').update(id, data)
