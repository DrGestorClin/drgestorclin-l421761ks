migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'm.bruno.f@gmail.com')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('m.bruno.f@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Administrador')
    record.set('role', 'admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'm.bruno.f@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
