migrate(
  (app) => {
    var collectionsToTruncate = ['patients', 'doctors']

    collectionsToTruncate.forEach(function (name) {
      try {
        var col = app.findCollectionByNameOrId(name)
        app.truncateCollection(col)
      } catch (_) {}
    })

    try {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      app.truncateCollection(usersCol)
    } catch (_) {}

    usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.createRule = '@request.auth.role = "ADM"'
    usersCol.deleteRule = '@request.auth.role = "ADM"'
    app.save(usersCol)

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

    var freshUsersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    var record = new Record(freshUsersCol)
    record.setEmail('drgestorclin@gmail.com')
    record.setPassword('B010520f$')
    record.setVerified(true)
    record.set('name', 'Administrador do Sistema')
    record.set('role', 'ADM')
    record.set('force_password_change', false)
    record.set('establishment_ref', establishmentId)
    app.save(record)
  },
  (app) => {
    try {
      var record = app.findAuthRecordByEmail('_pb_users_auth_', 'drgestorclin@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
