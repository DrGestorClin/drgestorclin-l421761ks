migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'drgestorclin@gmail.com')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('drgestorclin@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'DrGestorClin Admin')
    record.set('role', 'admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'drgestorclin@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
