migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    // Delete all existing user records for a clean restart
    app.truncateCollection(usersCol)

    // Idempotency check: skip if admin already exists
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'comercial@drgestorclin.com')
      return
    } catch (_) {}

    // Seed new primary administrator
    const record = new Record(usersCol)
    record.setEmail('comercial@drgestorclin.com')
    record.setPassword('DrGestorClin@123')
    record.setVerified(true)
    record.set('name', 'Administrador do Sistema')
    record.set('role', 'admin')
    record.set('force_password_change', true)
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'comercial@drgestorclin.com')
      app.delete(record)
    } catch (_) {}
  },
)
