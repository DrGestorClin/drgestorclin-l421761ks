onRecordAfterCreateSuccess((e) => {
  const patient = e.record
  const email = patient.getString('email')
  const phone = patient.getString('phone')
  const name = patient.getString('name')
  const patientId = patient.id

  var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
  var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
  var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
  var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

  var smtpConfigured = smtpHost && smtpPort && smtpUser && smtpPass

  if (!smtpConfigured) {
    $app.logger().error('SMTP_CONFIG_MISSING', 'hook', 'patient_welcome', 'patient_id', patientId)
  } else {
    try {
      var settings = $app.settings()
      settings.SMTP.Host = smtpHost
      settings.SMTP.Port = parseInt(smtpPort)
      settings.SMTP.Username = smtpUser
      settings.SMTP.Password = smtpPass
      settings.SMTP.Enabled = true
      settings.SMTP.TLS = true
      $app.save(settings)
    } catch (err) {
      $app.logger().error('Failed to configure SMTP settings', 'error', err.message)
    }
  }

  if (email && smtpConfigured) {
    try {
      var emailText =
        'Olá ' +
        name +
        ',\n\nObrigado por se registrar no DrGestorClin. Sua saúde e bem-estar são nossas prioridades!\n\nAtenciosamente,\nEquipe DrGestorClin'
      var emailHtml =
        '<p>Olá ' +
        name +
        ',</p><p>Obrigado por se registrar no DrGestorClin. Sua saúde e bem-estar são nossas prioridades!</p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>'

      var message = new Mail({
        from: { address: smtpUser, name: 'DrGestorClin' },
        to: [{ address: email }],
        subject: 'Bem-vindo ao DrGestorClin',
        text: emailText,
        html: emailHtml,
      })
      $app.newMailClient().send(message)

      try {
        var rec = $app.findRecordById('patients', patientId)
        rec.set('email_status', 'sent')
        $app.save(rec)
      } catch (_) {}

      $app.logger().info('Welcome email sent to patient', 'email', email)
    } catch (err) {
      var errorMsg = (err && err.message) || ''
      if (
        errorMsg.indexOf('535') !== -1 ||
        errorMsg.indexOf('auth') !== -1 ||
        errorMsg.indexOf('Auth') !== -1
      ) {
        $app
          .logger()
          .error('SMTP_AUTH_FAILED', 'hook', 'patient_welcome', 'error', errorMsg, 'email', email)
      } else {
        $app
          .logger()
          .error('SMTP_SEND_FAILED', 'hook', 'patient_welcome', 'error', errorMsg, 'email', email)
      }

      try {
        var rec2 = $app.findRecordById('patients', patientId)
        rec2.set('email_status', 'failed')
        $app.save(rec2)
      } catch (_) {}
    }
  } else if (email && !smtpConfigured) {
    try {
      var rec3 = $app.findRecordById('patients', patientId)
      rec3.set('email_status', 'failed')
      $app.save(rec3)
    } catch (_) {}
  }

  var waToken = $secrets.get('WHATSAPP_TOKEN')
  var waPhoneId = $secrets.get('WHATSAPP_PHONE_ID')
  if (waToken && waPhoneId && phone) {
    try {
      var cleanPhone = phone.replace(/\D/g, '')
      $http.send({
        url: 'https://graph.facebook.com/v17.0/' + waPhoneId + '/messages',
        method: 'POST',
        headers: { Authorization: 'Bearer ' + waToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: 'Olá ' + name + ', bem-vindo ao DrGestorClin! Obrigado por se registrar.' },
        }),
      })
      $app.logger().info('Welcome WhatsApp sent to patient', 'phone', cleanPhone)
    } catch (err) {
      $app.logger().error('Failed to send WhatsApp to patient', 'error', err.message)
    }
  }

  e.next()
}, 'patients')
