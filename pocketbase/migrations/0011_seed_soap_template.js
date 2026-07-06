migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('medical_record_templates')

    try {
      app.findFirstRecordByData('medical_record_templates', 'name', 'Evolução SOAP')
      return
    } catch (_) {}

    const record = new Record(col)
    record.set('name', 'Evolução SOAP')
    record.set('content', 'S:\nO:\nA:\nP:')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('medical_record_templates', 'name', 'Evolução SOAP')
      app.delete(record)
    } catch (_) {}
  },
)
