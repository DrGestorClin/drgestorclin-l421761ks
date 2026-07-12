onRecordCreate((e) => {
  const key = $secrets.get('MEDICAL_RECORD_ENCRYPTION_KEY')
  if (!key) {
    throw new Error(
      'MEDICAL_RECORD_ENCRYPTION_KEY is not configured. Cannot create medical records without encryption.',
    )
  }
  const content = e.record.getString('content')
  if (content) {
    e.record.set('content', $security.encrypt(content, key))
  }
  e.next()
}, 'medical_records')
