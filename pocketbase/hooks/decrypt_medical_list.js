onRecordListRequest((e) => {
  var records = e.records || []
  var key = $secrets.get('ENCRYPTION_KEY')
  var userId = (e.auth && e.auth.id) || ''
  var userRole = (e.auth && e.auth.getString && e.auth.getString('role')) || ''
  var doctorRef = (e.auth && e.auth.getString && e.auth.getString('doctor_ref')) || ''
  var patientDoctorCache = {}

  var isSuperuser = false
  try {
    isSuperuser = e.hasSuperuserAuth()
  } catch (_) {}

  for (var i = 0; i < records.length; i++) {
    var record = records[i]
    var authorized = userRole === 'admin' || isSuperuser

    if (!authorized) {
      authorized = record.getString('doctor') === doctorRef
    }

    if (!authorized) {
      var patientId = record.getString('patient')
      if (!patientDoctorCache[patientId]) {
        try {
          var patient = $app.findRecordById('patients', patientId)
          patientDoctorCache[patientId] = patient.getString('doctor')
        } catch (_) {
          patientDoctorCache[patientId] = ''
        }
      }
      authorized = patientDoctorCache[patientId] === doctorRef
    }

    if (authorized && key) {
      try {
        var encrypted = record.getString('content')
        if (encrypted) {
          record.set('content', $security.decrypt(encrypted, key))
        }
      } catch (_) {}
    } else if (!authorized) {
      record.set('content', '[Acesso negado]')
    }
  }

  if (records.length > 0 && userId) {
    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var auditRecord = new Record(auditCol)
      auditRecord.set('user', userId)
      auditRecord.set('action', 'LIST_RECORDS')
      auditRecord.set('resource', 'medical_records')
      auditRecord.set('resource_id', records[0].id)
      auditRecord.set('details', 'Listagem de ' + records.length + ' prontuário(s)')
      $app.save(auditRecord)
    } catch (_) {}
  }

  e.next()
}, 'medical_records')
