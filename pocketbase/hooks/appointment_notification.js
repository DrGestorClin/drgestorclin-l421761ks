onRecordAfterCreateSuccess((e) => {
  const apt = e.record
  const patientId = apt.get('patient')
  const doctorId = apt.get('doctor')
  const startTime = apt.getString('start_time')

  var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
  var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
  var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
  var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

  var smtpConfigured = smtpHost && smtpPort && smtpUser && smtpPass

  if (!smtpConfigured) {
    return e.next()
  }

  try {
    const patient = $app.findRecordById('patients', patientId)
    const doctor = $app.findRecordById('doctors', doctorId)

    const email = patient.getString('email')
    const patientName = patient.getString('name')
    const doctorName = doctor.getString('name')

    if (!email) return e.next()

    var settings = $app.settings()
    settings.SMTP.Host = smtpHost
    settings.SMTP.Port = parseInt(smtpPort)
    settings.SMTP.Username = smtpUser
    settings.SMTP.Password = smtpPass
    settings.SMTP.Enabled = true
    settings.SMTP.TLS = parseInt(smtpPort) === 465
    $app.save(settings)

    let formattedDate = startTime
    let formattedTime = ''
    try {
      const d = new Date(startTime)
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = d.getFullYear()
        formattedDate = day + '/' + month + '/' + year

        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        formattedTime = hours + ':' + minutes
      }
    } catch (_) {}

    const subject = 'Detalhes do seu Agendamento - DrGestorClin'
    const text =
      'Olá ' +
      patientName +
      ',\n\nSeu agendamento foi confirmado!\n\nDetalhes da Consulta:\nMédico: ' +
      doctorName +
      '\nData: ' +
      formattedDate +
      '\nHora: ' +
      formattedTime +
      '\n\nAtenciosamente,\nEquipe DrGestorClin'
    const html =
      '<p>Olá <strong>' +
      patientName +
      '</strong>,</p><p>Seu agendamento foi confirmado!</p><h3>Detalhes da Consulta:</h3><ul><li><strong>Médico:</strong> ' +
      doctorName +
      '</li><li><strong>Data:</strong> ' +
      formattedDate +
      '</li><li><strong>Hora:</strong> ' +
      formattedTime +
      '</li></ul><p>Atenciosamente,<br>Equipe DrGestorClin</p>'

    $app.newMailClient().send({
      from: { address: smtpUser, name: 'DrGestorClin' },
      to: [{ address: email }],
      subject: subject,
      text: text,
      html: html,
    })

    $app.logger().info('Appointment notification sent', 'email', email)
  } catch (err) {
    $app.logger().error('Failed to send appointment notification', 'error', err.message)
  }

  return e.next()
}, 'appointments')
