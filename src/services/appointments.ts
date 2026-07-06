import pb from '@/lib/pocketbase/client'
import type { Patient } from '@/services/patients'
import type { Doctor } from '@/services/doctors'

export interface Appointment {
  id: string
  patient: string
  doctor: string
  start_time: string
  end_time: string
  status: string
  type: string
  created: string
  updated: string
  expand?: {
    patient?: Patient
    doctor?: Doctor
  }
}

export const getAppointments = async (): Promise<Appointment[]> =>
  pb.collection('appointments').getFullList({
    expand: 'patient,doctor',
    sort: 'start_time',
  })

export const getAppointmentsByDoctor = async (doctorId: string): Promise<Appointment[]> =>
  pb.collection('appointments').getFullList({
    filter: `doctor = "${doctorId}"`,
    expand: 'patient,doctor',
    sort: 'start_time',
  })

export const createAppointment = async (data: {
  patient: string
  doctor: string
  start_time: string
  end_time?: string
  status: string
  type: string
}): Promise<Appointment> => pb.collection('appointments').create(data)

export const updateAppointment = async (
  id: string,
  data: Partial<Appointment>,
): Promise<Appointment> => pb.collection('appointments').update(id, data)

export const deleteAppointment = async (id: string): Promise<void> =>
  pb.collection('appointments').delete(id)
