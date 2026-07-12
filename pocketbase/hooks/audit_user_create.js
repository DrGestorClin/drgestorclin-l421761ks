onRecordCreateRequest((e) => {
  e.next()

  var userId = (e.auth && e.auth.id) || ''
  var recordId = (e.record && e.record.id) || ''
  var userName = ''
  try {
    userName = e.record.getString('name') || ''
  } catch (_) {}

  if (recordId) {
    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var auditRecord = new Record(auditCol)
      auditRecord.set('user', userId)
      auditRecord.set('action', 'CREATE_USER')
      auditRecord.set('resource', 'users')
      auditRecord.set('resource_id', recordId)
      auditRecord.set('details', 'Usuário criado' + (userName ? ': ' + userName : ''))
      $app.save(auditRecord)
    } catch (err) {
      $app
        .logger()
        .error('Failed to create audit log for user creation', 'error', (err && err.message) || '')
    }
  }
}, 'users')
