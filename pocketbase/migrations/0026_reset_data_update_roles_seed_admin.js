migrate(
  (app) => {
    var collectionsToTruncate = [
      'appointments',
      'medical_records',
      'audit_logs',
      'patients',
      'doctors',
    ]

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

    var oldRoleField = usersCol.fields.getByName('role')
    if (oldRoleField) {
      usersCol.fields.remove(oldRoleField)
    }
    usersCol.fields.add(
      new SelectField({
        name: 'role',
        values: ['ADM', 'Medico', 'Assistente'],
        maxSelect: 1,
      }),
    )

    usersCol.listRule = '@request.auth.role = "ADM" || id = @request.auth.id'
    usersCol.viewRule = '@request.auth.role = "ADM" || id = @request.auth.id'
    usersCol.updateRule = '@request.auth.role = "ADM" || id = @request.auth.id'
    usersCol.deleteRule = '@request.auth.role = "ADM" || id = @request.auth.id'
    app.save(usersCol)

    function updateRules(name, rules) {
      var col = app.findCollectionByNameOrId(name)
      Object.keys(rules).forEach(function (key) {
        col[key] = rules[key]
      })
      app.save(col)
    }

    updateRules('doctors', {
      createRule: '@request.auth.role = "ADM"',
      updateRule: '@request.auth.role = "ADM"',
      deleteRule: '@request.auth.role = "ADM"',
    })

    updateRules('patients', {
      updateRule: '@request.auth.role = "ADM" || doctor = @request.auth.doctor_ref',
      deleteRule: '@request.auth.role = "ADM"',
    })

    updateRules('appointments', {
      deleteRule: '@request.auth.role = "ADM"',
    })

    updateRules('audit_logs', {
      listRule: '@request.auth.role = "ADM"',
      viewRule: '@request.auth.role = "ADM"',
      updateRule: '@request.auth.role = "ADM"',
      deleteRule: '@request.auth.role = "ADM"',
    })

    updateRules('establishments', {
      createRule: '@request.auth.role = "ADM"',
      updateRule: '@request.auth.role = "ADM"',
      deleteRule: '@request.auth.role = "ADM"',
    })

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'drgestorclin@gmail.com')
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
