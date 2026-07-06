migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('patients')

    const doctorJoao = app.findFirstRecordByData('doctors', 'crm', '12345-SP')
    const doctorMaria = app.findFirstRecordByData('doctors', 'crm', '54321-RJ')
    const doctorCarlos = app.findFirstRecordByData('doctors', 'crm', '67890-MG')

    const patients = [
      {
        name: 'Ana Costa',
        birth_date: '1992-03-15 00:00:00.000Z',
        email: 'ana.costa@email.com',
        phone: '(11) 91111-2222',
        doctor: doctorJoao.id,
      },
      {
        name: 'Pedro Alves',
        birth_date: '1981-07-22 00:00:00.000Z',
        email: 'pedro.alves@email.com',
        phone: '(11) 93333-4444',
        doctor: doctorMaria.id,
      },
      {
        name: 'Julia Martins',
        birth_date: '1998-11-30 00:00:00.000Z',
        email: 'julia.martins@email.com',
        phone: '(11) 95555-6666',
        doctor: doctorCarlos.id,
      },
    ]

    for (const p of patients) {
      try {
        app.findFirstRecordByData('patients', 'email', p.email)
        continue
      } catch (_) {}

      const record = new Record(col)
      record.set('name', p.name)
      record.set('birth_date', p.birth_date)
      record.set('email', p.email)
      record.set('phone', p.phone)
      record.set('doctor', p.doctor)
      app.save(record)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('patients')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
