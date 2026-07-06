migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    if (!col.fields.getByName('photo')) {
      col.fields.add(
        new FileField({
          name: 'photo',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    const field = col.fields.getByName('photo')
    if (field) {
      col.fields.remove(field)
    }
    app.save(col)
  },
)
