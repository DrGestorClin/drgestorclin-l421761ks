import pb from '@/lib/pocketbase/client'
import type { Patient } from '@/services/patients'
import type { Doctor } from '@/services/doctors'

export interface MedicalRecord {
  id: string
  patient: string
  doctor: string
  title: string
  content: string
  created: string
  updated: string
  expand?: { patient?: Patient; doctor?: Doctor }
}

export const getMedicalRecords = async (patientId: string): Promise<MedicalRecord[]> =>
  pb.collection('medical_records').getFullList({
    filter: `patient = "${patientId}"`,
    expand: 'doctor,patient',
    sort: '-created',
  })

export const getMedicalRecord = async (id: string): Promise<MedicalRecord> =>
  pb.collection('medical_records').getOne(id, { expand: 'doctor,patient' })

export const createMedicalRecord = async (data: {
  patient: string
  doctor: string
  title: string
  content: string
}): Promise<MedicalRecord> => pb.collection('medical_records').create(data)

export const updateMedicalRecord = async (
  id: string,
  data: Partial<{ title: string; content: string; doctor: string }>,
): Promise<MedicalRecord> => pb.collection('medical_records').update(id, data)

export const getDoctorByEmail = async (email: string): Promise<Doctor | null> => {
  try {
    return await pb.collection('doctors').getFirstListItem(`email = "${email}"`)
  } catch {
    return null
  }
}
