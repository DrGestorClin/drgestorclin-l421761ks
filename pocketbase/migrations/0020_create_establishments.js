migrate(
  (app) => {
    const collection = new Collection({
      name: 'establishments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '@request.auth.role = "admin"',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"',
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['Clínica', 'Consultório'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_establishments_name_type ON establishments (name, type)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('establishments')
    app.delete(collection)
  },
)
