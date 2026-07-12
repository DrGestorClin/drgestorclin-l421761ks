migrate(
  (app) => {
    const establishmentsId = app.findCollectionByNameOrId('establishments').id

    // Add establishment_ref to users + fix access rules for admin management
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('establishment_ref')) {
      usersCol.fields.add(
        new RelationField({
          name: 'establishment_ref',
          collectionId: establishmentsId,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    usersCol.listRule = '@request.auth.role = "admin" || id = @request.auth.id'
    usersCol.viewRule = '@request.auth.role = "admin" || id = @request.auth.id'
    usersCol.createRule = ''
    usersCol.updateRule = '@request.auth.role = "admin" || id = @request.auth.id'
    usersCol.deleteRule = '@request.auth.role = "admin" || id = @request.auth.id'
    app.save(usersCol)

    // Add establishment_ref to patients
    const patientsCol = app.findCollectionByNameOrId('patients')
    if (!patientsCol.fields.getByName('establishment_ref')) {
      patientsCol.fields.add(
        new RelationField({
          name: 'establishment_ref',
          collectionId: establishmentsId,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    app.save(patientsCol)

    // Add establishment_ref to doctors
    const doctorsCol = app.findCollectionByNameOrId('doctors')
    if (!doctorsCol.fields.getByName('establishment_ref')) {
      doctorsCol.fields.add(
        new RelationField({
          name: 'establishment_ref',
          collectionId: establishmentsId,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    app.save(doctorsCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const userField = usersCol.fields.getByName('establishment_ref')
    if (userField) usersCol.fields.remove(userField)
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    usersCol.createRule = ''
    usersCol.updateRule = 'id = @request.auth.id'
    usersCol.deleteRule = 'id = @request.auth.id'
    app.save(usersCol)

    const patientsCol = app.findCollectionByNameOrId('patients')
    const patientField = patientsCol.fields.getByName('establishment_ref')
    if (patientField) patientsCol.fields.remove(patientField)
    app.save(patientsCol)

    const doctorsCol = app.findCollectionByNameOrId('doctors')
    const doctorField = doctorsCol.fields.getByName('establishment_ref')
    if (doctorField) doctorsCol.fields.remove(doctorField)
    app.save(doctorsCol)
  },
)
