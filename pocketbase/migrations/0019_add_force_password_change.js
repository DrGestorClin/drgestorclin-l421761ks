migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!col.fields.getByName('force_password_change')) {
      col.fields.add(
        new BoolField({
          name: 'force_password_change',
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const field = col.fields.getByName('force_password_change')
    if (field) {
      col.fields.remove(field)
    }
    app.save(col)
  },
)
