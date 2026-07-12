migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    app.truncateCollection(usersCol)

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'comercial@drgestorclin.com')
      return
    } catch (_) {}

    var establishmentId = ''
    try {
      var est = app.findFirstRecordByData('establishments', 'name', 'DrGestorClin - Sede')
      establishmentId = est.id
    } catch (_) {
      var estCol = app.findCollectionByNameOrId('establishments')
      var newEst = new Record(estCol)
      newEst.set('name', 'DrGestorClin - Sede')
      newEst.set('type', 'Clínica')
      app.save(newEst)
      establishmentId = newEst.id
    }

    var record = new Record(usersCol)
    record.setEmail('comercial@drgestorclin.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Administrador do Sistema')
    record.set('role', 'admin')
    record.set('force_password_change', true)
    record.set('establishment_ref', establishmentId)
    app.save(record)
  },
  (app) => {
    try {
      var record = app.findAuthRecordByEmail('_pb_users_auth_', 'comercial@drgestorclin.com')
      app.delete(record)
    } catch (_) {}
  },
)
