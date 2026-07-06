onRecordAfterCreateSuccess((e) => {
  const patient = e.record
  const email = patient.getString('email')
  const phone = patient.getString('phone')
  const name = patient.getString('name')

  // Email Integration via SendGrid
  const sendgridKey = $secrets.get('SENDGRID_API_KEY')
  if (sendgridKey && email) {
    try {
      $http.send({
        url: 'https://api.sendgrid.com/v3/mail/send',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + sendgridKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: 'm.bruno.f@gmail.com', name: 'DrGestorClin' },
          subject: 'Bem-vindo ao DrGestorClin',
          content: [
            {
              type: 'text/plain',
              value: `Olá ${name},\n\nObrigado por se registrar no DrGestorClin. Sua saúde e bem-estar são nossas prioridades!\n\nAtenciosamente,\nEquipe DrGestorClin`,
            },
          ],
        }),
      })
      $app.logger().info('Welcome email sent to patient', 'email', email)
    } catch (err) {
      $app.logger().error('Failed to send welcome email to patient', 'error', err.message)
    }
  }

  // WhatsApp Integration via Meta API
  const waToken = $secrets.get('WHATSAPP_TOKEN')
  const waPhoneId = $secrets.get('WHATSAPP_PHONE_ID')
  if (waToken && waPhoneId && phone) {
    try {
      const cleanPhone = phone.replace(/\D/g, '')
      $http.send({
        url: `https://graph.facebook.com/v17.0/${waPhoneId}/messages`,
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + waToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: `Olá ${name}, bem-vindo ao DrGestorClin! Obrigado por se registrar.` },
        }),
      })
      $app.logger().info('Welcome WhatsApp sent to patient', 'phone', cleanPhone)
    } catch (err) {
      $app.logger().error('Failed to send WhatsApp to patient', 'error', err.message)
    }
  }

  e.next()
}, 'patients')
