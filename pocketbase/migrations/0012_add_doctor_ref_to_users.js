migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!col.fields.getByName('doctor_ref')) {
      const doctorsCollectionId = app.findCollectionByNameOrId('doctors').id
      col.fields.add(
        new RelationField({
          name: 'doctor_ref',
          collectionId: doctorsCollectionId,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const field = col.fields.getByName('doctor_ref')
    if (field) {
      col.fields.remove(field)
    }
    app.save(col)
  },
)
