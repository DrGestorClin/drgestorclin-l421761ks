onRecordUpdate((e) => {
  const content = e.record.getString('content')
  const originalContent = e.record.original().getString('content')
  if (content === originalContent) {
    e.next()
    return
  }
  const key = $secrets.get('MEDICAL_RECORD_ENCRYPTION_KEY')
  if (!key) {
    throw new Error(
      'MEDICAL_RECORD_ENCRYPTION_KEY is not configured. Cannot update medical records without encryption.',
    )
  }
  e.record.set('content', $security.encrypt(content, key))
  e.next()
}, 'medical_records')
