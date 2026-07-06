onRecordAfterCreateSuccess((e) => {
  const patient = e.record
  const email = patient.getString('email')
  const phone = patient.getString('phone')
  const name = patient.getString('name')

  if (email) {
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
        from: { address: 'noreply@drgestorclin.com', name: 'DrGestorClin' },
        to: [{ address: email }],
        subject: 'Bem-vindo ao DrGestorClin',
        text: emailText,
        html: emailHtml,
      })
      $app.newMailClient().send(message)
      $app.logger().info('Welcome email sent to patient via internal mailer', 'email', email)
    } catch (err) {
      $app.logger().error('Failed to send welcome email to patient', 'error', err.message)
    }
  }

  var waToken = $secrets.get('WHATSAPP_TOKEN')
  var waPhoneId = $secrets.get('WHATSAPP_PHONE_ID')
  if (waToken && waPhoneId && phone) {
    try {
      var cleanPhone = phone.replace(/\D/g, '')
      $http.send({
        url: 'https://graph.facebook.com/v17.0/' + waPhoneId + '/messages',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + waToken,
          'Content-Type': 'application/json',
        },
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
