import pb from '@/lib/pocketbase/client'

export interface MedicalRecordTemplate {
  id: string
  name: string
  content: string
  created: string
  updated: string
}

export const getMedicalRecordTemplates = async (): Promise<MedicalRecordTemplate[]> =>
  pb.collection('medical_record_templates').getFullList({ sort: '-created' })

export const createMedicalRecordTemplate = async (data: {
  name: string
  content: string
}): Promise<MedicalRecordTemplate> => pb.collection('medical_record_templates').create(data)

export const deleteMedicalRecordTemplate = async (id: string): Promise<void> =>
  pb.collection('medical_record_templates').delete(id)
