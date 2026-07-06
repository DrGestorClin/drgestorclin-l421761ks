onRecordAfterCreateSuccess((e) => {
  const doctor = e.record
  const email = doctor.getString('email')
  const phone = doctor.getString('phone')
  const name = doctor.getString('name')
  const doctorId = doctor.id

  const tempPassword = $security.randomString(16)

  if (email) {
    let userExists = false
    try {
      $app.findAuthRecordByEmail('_pb_users_auth_', email)
      userExists = true
    } catch (_) {}

    if (!userExists) {
      try {
        const usersCol = $app.findCollectionByNameOrId('_pb_users_auth_')
        const userRecord = new Record(usersCol)
        userRecord.setEmail(email)
        userRecord.setPassword(tempPassword)
        userRecord.setVerified(true)
        userRecord.set('name', name)
        userRecord.set('role', 'doctor')
        userRecord.set('doctor_ref', doctorId)
        $app.save(userRecord)
        $app.logger().info('User account created for doctor', 'email', email, 'doctor_id', doctorId)

        const sendgridKey = $secrets.get('SENDGRID_API_KEY')
        if (sendgridKey) {
          try {
            $http.send({
              url: 'https://api.sendgrid.com/v3/mail/send',
              method: 'POST',
              headers: {
                Authorization: 'Bearer ' + sendgridKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                personalizations: [{ to: [{ email: email }] }],
                from: { email: 'contato@drgestorclin.com', name: 'DrGestorClin' },
                subject: 'Bem-vindo ao DrGestorClin - Sua Conta de Acesso',
                content: [
                  {
                    type: 'text/plain',
                    value: `Olá Dr(a). ${name},\n\nSua conta de acesso ao DrGestorClin foi criada com sucesso!\n\nDetalhes de acesso:\nE-mail: ${email}\nSenha temporária: ${tempPassword}\nURL de acesso: https://www.drgestorclin.com\n\nPor segurança, recomendamos que você altere sua senha após o primeiro login.\n\nAtenciosamente,\nEquipe DrGestorClin`,
                  },
                ],
              }),
            })
            $app.logger().info('Welcome email with credentials sent to doctor', 'email', email)
          } catch (err) {
            $app.logger().error('Failed to send welcome email to doctor', 'error', err.message)
          }
        }
      } catch (err) {
        $app.logger().error('Failed to create user account for doctor', 'error', err.message)
      }
    } else {
      $app.logger().info('User account already exists for doctor email', 'email', email)
    }
  }

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
            body: `Olá Dr(a). ${name}, bem-vindo ao DrGestorClin! Sua conta de acesso foi criada. Verifique seu e-mail para obter a senha temporária. Acesse: https://www.drgestorclin.com`,
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
