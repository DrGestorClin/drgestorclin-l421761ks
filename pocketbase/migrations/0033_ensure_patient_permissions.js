migrate(
  (app) => {
    const patientsCol = app.findCollectionByNameOrId('patients')
    patientsCol.createRule = '@request.auth.id != ""'
    patientsCol.updateRule = '@request.auth.role = "ADM" || doctor = @request.auth.doctor_ref'
    patientsCol.deleteRule = '@request.auth.role = "ADM"'
    app.save(patientsCol)
  },
  (app) => {
    const patientsCol = app.findCollectionByNameOrId('patients')
    patientsCol.createRule = '@request.auth.id != ""'
    app.save(patientsCol)
  },
)
