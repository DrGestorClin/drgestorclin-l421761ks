onRecordAfterCreateSuccess((e) => {
  const doctor = e.record
  const email = doctor.getString('email')
  const phone = doctor.getString('phone')
  const name = doctor.getString('name')

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
          from: { email: 'contato@drgestorclin.com', name: 'DrGestorClin' },
          subject: 'Bem-vindo ao DrGestorClin',
          content: [
            {
              type: 'text/plain',
              value: `Olá Dr(a). ${name},\n\nObrigado por se juntar ao DrGestorClin. Estamos muito felizes em tê-lo conosco e prontos para ajudar na gestão da sua clínica!\n\nAtenciosamente,\nEquipe DrGestorClin`,
            },
          ],
        }),
      })
      $app.logger().info('Welcome email sent to doctor', 'email', email)
    } catch (err) {
      $app.logger().error('Failed to send welcome email to doctor', 'error', err.message)
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
          text: {
            body: `Olá Dr(a). ${name}, bem-vindo ao DrGestorClin! Obrigado por se juntar à nossa plataforma.`,
          },
        }),
      })
      $app.logger().info('Welcome WhatsApp sent to doctor', 'phone', cleanPhone)
    } catch (err) {
      $app.logger().error('Failed to send WhatsApp to doctor', 'error', err.message)
    }
  }

  e.next()
}, 'doctors')
