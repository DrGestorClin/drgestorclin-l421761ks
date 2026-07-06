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

export const createMedicalRecord = async (data: {
  patient: string
  doctor: string
  title: string
  content: string
}): Promise<MedicalRecord> => pb.collection('medical_records').create(data)

export const getDoctorByEmail = async (email: string): Promise<Doctor | null> => {
  try {
    return await pb.collection('doctors').getFirstListItem(`email = "${email}"`)
  } catch {
    return null
  }
}
