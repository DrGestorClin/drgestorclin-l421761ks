migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    var adminRecord = null
    try {
      adminRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'm.bruno.f@gmail.com')
    } catch (_) {}

    if (adminRecord) {
      adminRecord.setPassword('Skip@Pass')
      adminRecord.set('role', 'ADM')
      adminRecord.set('force_password_change', false)
      adminRecord.setVerified(true)
      app.save(adminRecord)
    } else {
      var establishmentId = ''
      try {
        var est = app.findFirstRecordByData('establishments', 'name', 'DrGestorClin - Sede')
        establishmentId = est.id
      } catch (_) {}

      var newRecord = new Record(usersCol)
      newRecord.setEmail('m.bruno.f@gmail.com')
      newRecord.setPassword('Skip@Pass')
      newRecord.setVerified(true)
      newRecord.set('name', 'Administrador do Sistema')
      newRecord.set('role', 'ADM')
      newRecord.set('force_password_change', true)
      if (establishmentId) {
        newRecord.set('establishment_ref', establishmentId)
      }
      app.save(newRecord)
    }
  },
  (app) => {
    try {
      var record = app.findAuthRecordByEmail('_pb_users_auth_', 'm.bruno.f@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
