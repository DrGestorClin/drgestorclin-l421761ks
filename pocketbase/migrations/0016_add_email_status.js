migrate(
  (app) => {
    const doctorsCol = app.findCollectionByNameOrId('doctors')
    if (!doctorsCol.fields.getByName('email_status')) {
      doctorsCol.fields.add(new TextField({ name: 'email_status' }))
    }
    app.save(doctorsCol)

    const patientsCol = app.findCollectionByNameOrId('patients')
    if (!patientsCol.fields.getByName('email_status')) {
      patientsCol.fields.add(new TextField({ name: 'email_status' }))
    }
    app.save(patientsCol)
  },
  (app) => {
    const doctorsCol = app.findCollectionByNameOrId('doctors')
    const doctorField = doctorsCol.fields.getByName('email_status')
    if (doctorField) doctorsCol.fields.remove(doctorField)
    app.save(doctorsCol)

    const patientsCol = app.findCollectionByNameOrId('patients')
    const patientField = patientsCol.fields.getByName('email_status')
    if (patientField) patientsCol.fields.remove(patientField)
    app.save(patientsCol)
  },
)
