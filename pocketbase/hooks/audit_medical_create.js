onRecordCreateRequest((e) => {
  e.next()

  var userId = (e.auth && e.auth.id) || ''
  var recordId = (e.record && e.record.id) || ''

  if (recordId) {
    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var auditRecord = new Record(auditCol)
      auditRecord.set('user', userId)
      auditRecord.set('action', 'CREATE_RECORD')
      auditRecord.set('resource', 'medical_records')
      auditRecord.set('resource_id', recordId)
      auditRecord.set('details', 'Prontuário criado')
      $app.save(auditRecord)
    } catch (err) {
      $app.logger().error('Failed to create audit log for record creation', 'error', err.message)
    }
  }
}, 'medical_records')
