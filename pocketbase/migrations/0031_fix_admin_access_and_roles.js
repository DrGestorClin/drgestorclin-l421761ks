migrate(
  (app) => {
    // ── 1. Garantir que o campo `role` tem os 4 valores corretos ──
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    // Remover e recriar o campo role com os 4 valores
    try {
      usersCol.fields.removeByName('role')
    } catch (_) {}

    usersCol.fields.add(
      new SelectField({
        name: 'role',
        values: ['ADM', 'Clinica', 'Assistente', 'Medico'],
        maxSelect: 1,
      }),
    )

    // RLS — mesmas regras da migration 0028
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

    // ── 2. Garantir admin m.bruno.f@gmail.com com senha Skip@Pass ──
    var adminEmail = 'm.bruno.f@gmail.com'
    var adminPassword = 'Skip@Pass'

    var adminRecord = null
    try {
      adminRecord = app.findAuthRecordByEmail('_pb_users_auth_', adminEmail)
    } catch (_) {}

    // Buscar establishment
    var establishmentId = ''
    try {
      var est = app.findFirstRecordByData('establishments', 'name', 'DrGestorClin - Sede')
      establishmentId = est.id
    } catch (_) {}

    if (adminRecord) {
      // Admin existe — resetar senha e garantir role ADM
      adminRecord.setPassword(adminPassword)
      adminRecord.set('role', 'ADM')
      adminRecord.set('force_password_change', false)
      adminRecord.setVerified(true)
      if (establishmentId) {
        adminRecord.set('establishment_ref', establishmentId)
      }
      app.save(adminRecord)
    } else {
      // Admin não existe — criar
      var freshCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var newRecord = new Record(freshCol)
      newRecord.setEmail(adminEmail)
      newRecord.setPassword(adminPassword)
      newRecord.setVerified(true)
      newRecord.set('name', 'Administrador do Sistema')
      newRecord.set('role', 'ADM')
      newRecord.set('force_password_change', false)
      if (establishmentId) {
        newRecord.set('establishment_ref', establishmentId)
      }
      app.save(newRecord)
    }

    // ── 3. Garantir que drgestorclin@gmail.com também tem role ADM (se existir) ──
    try {
      var otherAdmin = app.findAuthRecordByEmail('_pb_users_auth_', 'drgestorclin@gmail.com')
      otherAdmin.set('role', 'ADM')
      app.save(otherAdmin)
    } catch (_) {}
  },
  (app) => {
    // Down migration: nada a desfazer
  },
)
