onRecordViewRequest((e) => {
  const record = e.record
  const userId = (e.auth && e.auth.id) || ''
  const userRole = (e.auth && e.auth.getString && e.auth.getString('role')) || ''
  const doctorRef = (e.auth && e.auth.getString && e.auth.getString('doctor_ref')) || ''

  var isSuperuser = false
  try {
    isSuperuser = e.hasSuperuserAuth()
  } catch (_) {}

  if (userRole !== 'admin' && !isSuperuser) {
    var isAuthor = record.getString('doctor') === doctorRef
    var isPatientDoctor = false
    if (!isAuthor) {
      try {
        var patient = $app.findRecordById('patients', record.getString('patient'))
        isPatientDoctor = patient.getString('doctor') === doctorRef
      } catch (_) {}
    }
    if (!isAuthor && !isPatientDoctor) {
      return e.forbiddenError('Você não tem permissão para visualizar este prontuário.')
    }
  }

  var key = $secrets.get('ENCRYPTION_KEY')
  if (key) {
    try {
      var encrypted = record.getString('content')
      if (encrypted) {
        record.set('content', $security.decrypt(encrypted, key))
      }
    } catch (err) {
      $app
        .logger()
        .error('Failed to decrypt medical record', 'error', err.message, 'record_id', record.id)
    }
  }

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var auditRecord = new Record(auditCol)
    auditRecord.set('user', userId)
    auditRecord.set('action', 'VIEW_RECORD')
    auditRecord.set('resource', 'medical_records')
    auditRecord.set('resource_id', record.id)
    auditRecord.set('details', 'Prontuário visualizado')
    $app.save(auditRecord)
  } catch (err) {
    $app.logger().error('Failed to create audit log', 'error', err.message)
  }

  e.next()
}, 'medical_records')
