onRecordUpdateRequest((e) => {
  e.next()

  var userId = (e.auth && e.auth.id) || ''
  var recordId = (e.record && e.record.id) || ''

  if (recordId) {
    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var auditRecord = new Record(auditCol)
      auditRecord.set('user', userId)
      auditRecord.set('action', 'UPDATE_RECORD')
      auditRecord.set('resource', 'medical_records')
      auditRecord.set('resource_id', recordId)
      auditRecord.set('details', 'Prontuário atualizado')
      $app.save(auditRecord)
    } catch (err) {
      $app.logger().error('Failed to create audit log for record update', 'error', err.message)
    }
  }
}, 'medical_records')
