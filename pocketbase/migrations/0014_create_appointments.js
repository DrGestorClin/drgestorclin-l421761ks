migrate(
  (app) => {
    const patientsCollectionId = app.findCollectionByNameOrId('patients').id
    const doctorsCollectionId = app.findCollectionByNameOrId('doctors').id

    const collection = new Collection({
      name: 'appointments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: '@request.auth.role = "admin"',
      fields: [
        {
          name: 'patient',
          type: 'relation',
          required: true,
          collectionId: patientsCollectionId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'doctor',
          type: 'relation',
          required: true,
          collectionId: doctorsCollectionId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'start_time', type: 'date', required: true },
        { name: 'end_time', type: 'date' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: [
            'Agendado',
            'Confirmado',
            'Aguardando',
            'Em Atendimento',
            'Finalizado',
            'Cancelado',
            'Falta',
          ],
          maxSelect: 1,
        },
        {
          name: 'type',
          type: 'select',
          values: ['Consulta', 'Retorno', 'Procedimento'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_appointments_doctor ON appointments (doctor)',
        'CREATE INDEX idx_appointments_patient ON appointments (patient)',
        'CREATE INDEX idx_appointments_start_time ON appointments (start_time)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('appointments')
    app.delete(collection)
  },
)
