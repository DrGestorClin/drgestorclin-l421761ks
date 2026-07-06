migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('doctors')

    const doctors = [
      {
        name: 'Dr. João Silva',
        crm: '12345-SP',
        specialty: 'Cardiologia',
        email: 'joao.silva@clinica.com',
        phone: '(11) 98765-4321',
        active: true,
      },
      {
        name: 'Dra. Maria Souza',
        crm: '54321-RJ',
        specialty: 'Pediatria',
        email: 'maria.souza@clinica.com',
        phone: '(21) 99876-5432',
        active: true,
      },
      {
        name: 'Dr. Carlos Mendes',
        crm: '67890-MG',
        specialty: 'Ortopedia',
        email: 'carlos.mendes@clinica.com',
        phone: '(31) 91234-5678',
        active: false,
      },
    ]

    for (const d of doctors) {
      try {
        app.findFirstRecordByData('doctors', 'crm', d.crm)
        continue
      } catch (_) {}

      const record = new Record(col)
      record.set('name', d.name)
      record.set('crm', d.crm)
      record.set('specialty', d.specialty)
      record.set('email', d.email)
      record.set('phone', d.phone)
      record.set('active', d.active)
      app.save(record)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('doctors')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
