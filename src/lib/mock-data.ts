export const MOCK_DOCTORS = [
  {
    id: '1',
    name: 'Dr. João Silva',
    crm: '12345',
    uf: 'SP',
    specialty: 'Cardiologia',
    phone: '(11) 98765-4321',
    status: 'Ativo',
  },
  {
    id: '2',
    name: 'Dra. Maria Souza',
    crm: '54321',
    uf: 'RJ',
    specialty: 'Pediatria',
    phone: '(21) 99876-5432',
    status: 'Ativo',
  },
  {
    id: '3',
    name: 'Dr. Carlos Mendes',
    crm: '67890',
    uf: 'MG',
    specialty: 'Ortopedia',
    phone: '(31) 91234-5678',
    status: 'Inativo',
  },
]

export const MOCK_PATIENTS = [
  {
    id: '1',
    name: 'Ana Costa',
    cpf: '111.222.333-44',
    age: 34,
    phone: '(11) 91111-2222',
    convenio: 'Unimed Premium',
    allergies: 'Penicilina',
    status: 'Ativo',
  },
  {
    id: '2',
    name: 'Pedro Alves',
    cpf: '555.666.777-88',
    age: 45,
    phone: '(11) 93333-4444',
    convenio: 'Particular',
    allergies: '',
    status: 'Ativo',
  },
  {
    id: '3',
    name: 'Julia Martins',
    cpf: '999.000.111-22',
    age: 28,
    phone: '(11) 95555-6666',
    convenio: 'Bradesco Saúde',
    allergies: 'Dipirona, Frutos do mar',
    status: 'Ativo',
  },
]

export const MOCK_APPOINTMENTS = [
  { id: '1', doctorId: '1', patientId: '1', time: '09:00', type: 'Consulta', status: 'Finalizado' },
  {
    id: '2',
    doctorId: '1',
    patientId: '2',
    time: '10:30',
    type: 'Retorno',
    status: 'Em Atendimento',
  },
  { id: '3', doctorId: '1', patientId: '3', time: '11:00', type: 'Consulta', status: 'Aguardando' },
  {
    id: '4',
    doctorId: '1',
    patientId: '2',
    time: '14:00',
    type: 'Procedimento',
    status: 'Confirmado',
  },
  { id: '5', doctorId: '2', patientId: '1', time: '15:30', type: 'Consulta', status: 'Agendado' },
]

export const MOCK_HISTORY = [
  {
    id: '1',
    patientId: '1',
    date: '2026-06-10',
    doctor: 'Dr. João Silva',
    description: 'Consulta de rotina. PA normal. Solicitado exames laboratoriais.',
    type: 'Consulta',
  },
  {
    id: '2',
    patientId: '1',
    date: '2026-06-15',
    doctor: 'Dr. João Silva',
    description: 'Retorno com exames. Hemograma dentro dos padrões normais. Tudo OK.',
    type: 'Retorno',
  },
  {
    id: '3',
    patientId: '3',
    date: '2026-05-02',
    doctor: 'Dra. Maria Souza',
    description: 'Paciente apresenta quadro febril. Prescrito repouso e hidratação.',
    type: 'Consulta',
  },
]
