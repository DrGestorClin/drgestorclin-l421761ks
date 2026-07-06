migrate(
  (app) => {
    const patientsCollectionId = app.findCollectionByNameOrId('patients').id
    const doctorsCollectionId = app.findCollectionByNameOrId('doctors').id

    const collection = new Collection({
      name: 'medical_records',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
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
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_medical_records_patient ON medical_records (patient)',
        'CREATE INDEX idx_medical_records_doctor ON medical_records (doctor)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('medical_records')
    app.delete(collection)
  },
)
