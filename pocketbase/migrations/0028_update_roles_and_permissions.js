migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    usersCol.fields.removeByName('role')
    usersCol.fields.add(
      new SelectField({
        name: 'role',
        values: ['ADM', 'Clinica', 'Assistente', 'Medico'],
        maxSelect: 1,
      }),
    )

    usersCol.listRule =
      '@request.auth.role = "ADM" || id = @request.auth.id || (@request.auth.role = "Clinica" && (role = "Assistente" || role = "Medico")) || (@request.auth.role = "Assistente" && role = "Medico")'
    usersCol.viewRule =
      '@request.auth.role = "ADM" || id = @request.auth.id || (@request.auth.role = "Clinica" && (role = "Assistente" || role = "Medico")) || (@request.auth.role = "Assistente" && role = "Medico")'
    usersCol.createRule =
      '@request.auth.role = "ADM" || (@request.auth.role = "Clinica" && (@request.body.role = "Assistente" || @request.body.role = "Medico")) || (@request.auth.role = "Assistente" && @request.body.role = "Medico")'
    usersCol.updateRule =
      '@request.auth.role = "ADM" || id = @request.auth.id || (@request.auth.role = "Clinica" && (role = "Assistente" || role = "Medico")) || (@request.auth.role = "Assistente" && role = "Medico")'
    usersCol.deleteRule =
      '@request.auth.role = "ADM" || (@request.auth.role = "Clinica" && (role = "Assistente" || role = "Medico")) || (@request.auth.role = "Assistente" && role = "Medico")'
    app.save(usersCol)

    try {
      var adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'drgestorclin@gmail.com')
      adminUser.set('role', 'ADM')
      app.save(adminUser)
    } catch (_) {}

    var doctorsCol = app.findCollectionByNameOrId('doctors')
    doctorsCol.createRule =
      '@request.auth.role = "ADM" || @request.auth.role = "Clinica" || @request.auth.role = "Assistente"'
    doctorsCol.updateRule =
      '@request.auth.role = "ADM" || @request.auth.role = "Clinica" || @request.auth.role = "Assistente"'
    doctorsCol.deleteRule =
      '@request.auth.role = "ADM" || @request.auth.role = "Clinica" || @request.auth.role = "Assistente"'
    app.save(doctorsCol)
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.fields.removeByName('role')
    usersCol.fields.add(
      new SelectField({
        name: 'role',
        values: ['ADM', 'Medico', 'Assistente'],
        maxSelect: 1,
      }),
    )
    usersCol.listRule = '@request.auth.role = "ADM" || id = @request.auth.id'
    usersCol.viewRule = '@request.auth.role = "ADM" || id = @request.auth.id'
    usersCol.createRule = '@request.auth.role = "ADM"'
    usersCol.updateRule = '@request.auth.role = "ADM" || id = @request.auth.id'
    usersCol.deleteRule = '@request.auth.role = "ADM"'
    app.save(usersCol)

    try {
      var adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'drgestorclin@gmail.com')
      adminUser.set('role', 'ADM')
      app.save(adminUser)
    } catch (_) {}

    var doctorsCol = app.findCollectionByNameOrId('doctors')
    doctorsCol.createRule = '@request.auth.role = "ADM"'
    doctorsCol.updateRule = '@request.auth.role = "ADM"'
    doctorsCol.deleteRule = '@request.auth.role = "ADM"'
    app.save(doctorsCol)
  },
)
