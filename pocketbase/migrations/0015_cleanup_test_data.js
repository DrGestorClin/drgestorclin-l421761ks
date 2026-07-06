migrate(
  (app) => {
    const doctors = app.findRecordsByFilter('doctors', "name != 'Lina'", 'created', 1000, 0)
    for (const doctor of doctors) {
      app.delete(doctor)
    }

    try {
      const apptCol = app.findCollectionByNameOrId('appointments')
      app.truncateCollection(apptCol)
    } catch (_) {}

    const patientsCol = app.findCollectionByNameOrId('patients')
    patientsCol.deleteRule = '@request.auth.role = "admin"'
    patientsCol.updateRule = '@request.auth.role = "admin" || doctor = @request.auth.doctor_ref'
    app.save(patientsCol)
  },
  (app) => {
    const patientsCol = app.findCollectionByNameOrId('patients')
    patientsCol.deleteRule = "@request.auth.id != ''"
    patientsCol.updateRule = "@request.auth.id != ''"
    app.save(patientsCol)
  },
)
