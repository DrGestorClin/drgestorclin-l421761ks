migrate(
  (app) => {
    const doctorsCollectionId = app.findCollectionByNameOrId('doctors').id

    const collection = new Collection({
      name: 'patients',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'birth_date', type: 'date' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        {
          name: 'doctor',
          type: 'relation',
          required: true,
          collectionId: doctorsCollectionId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_patients_doctor ON patients (doctor)'],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('patients')
    app.delete(collection)
  },
)
