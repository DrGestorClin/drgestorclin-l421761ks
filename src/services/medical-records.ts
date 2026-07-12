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
  expand?: {
    patient?: Patient
    doctor?: Doctor
  }
}

export const getMedicalRecords = async (): Promise<MedicalRecord[]> =>
  pb.collection('medical_records').getFullList({
    expand: 'patient,doctor',
    sort: '-created',
  })

export const getMedicalRecord = async (id: string): Promise<MedicalRecord> =>
  pb.collection('medical_records').getOne(id, {
    expand: 'patient,doctor',
  })

export const getMedicalRecordsByPatient = async (patientId: string): Promise<MedicalRecord[]> =>
  pb.collection('medical_records').getFullList({
    filter: `patient = "${patientId}"`,
    expand: 'patient,doctor',
    sort: '-created',
  })

export const createMedicalRecord = async (data: {
  patient: string
  doctor: string
  title: string
  content: string
}): Promise<MedicalRecord> => pb.collection('medical_records').create(data)

export const updateMedicalRecord = async (
  id: string,
  data: Partial<MedicalRecord>,
): Promise<MedicalRecord> => pb.collection('medical_records').update(id, data)

export const getDoctorByEmail = async (email: string) => {
  try {
    return await pb.collection('doctors').getFirstListItem(`email = "${email}"`)
  } catch {
    return null
  }
}
