onRecordAfterCreateSuccess((e) => {
  const doctor = e.record
  const email = doctor.getString('email')
  const phone = doctor.getString('phone')
  const name = doctor.getString('name')
  const doctorId = doctor.id

  const siteUrl = $secrets.get('SITE_URL') || 'https://drgestorclin-52167.goskip.app'

  let tempPassword = ''
  let userCreated = false

  if (email) {
    let userExists = false
    try {
      $app.findAuthRecordByEmail('_pb_users_auth_', email)
      userExists = true
    } catch (_) {}

    if (!userExists) {
      tempPassword = $security.randomString(16)
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
        userCreated = true
        $app.logger().info('User account created for doctor', 'email', email, 'doctor_id', doctorId)
      } catch (err) {
        $app.logger().error('Failed to create user account for doctor', 'error', err.message)
      }
    } else {
      $app.logger().info('User account already exists for doctor email', 'email', email)
    }

    try {
      var emailText
      var emailHtml
      if (userCreated) {
        emailText =
          'Olá Dr(a). ' +
          name +
          ',\n\nSua conta de acesso ao DrGestorClin foi criada com sucesso!\n\nDetalhes de acesso:\nE-mail: ' +
          email +
          '\nSenha temporária: ' +
          tempPassword +
          '\nURL de acesso: ' +
          siteUrl +
          '\n\nPor segurança, recomendamos que você altere sua senha após o primeiro login.\n\nAtenciosamente,\nEquipe DrGestorClin'
        emailHtml =
          '<p>Olá Dr(a). ' +
          name +
          ',</p><p>Sua conta de acesso ao DrGestorClin foi criada com sucesso!</p><p><strong>Detalhes de acesso:</strong><br/>E-mail: ' +
          email +
          '<br/>Senha temporária: ' +
          tempPassword +
          '<br/>URL de acesso: <a href="' +
          siteUrl +
          '">' +
          siteUrl +
          '</a></p><p>Por segurança, recomendamos que você altere sua senha após o primeiro login.</p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>'
      } else {
        emailText =
          'Olá Dr(a). ' +
          name +
          ',\n\nBem-vindo ao DrGestorClin! Seu cadastro foi realizado com sucesso.\n\nURL de acesso: ' +
          siteUrl +
          '\n\nAtenciosamente,\nEquipe DrGestorClin'
        emailHtml =
          '<p>Olá Dr(a). ' +
          name +
          ',</p><p>Bem-vindo ao DrGestorClin! Seu cadastro foi realizado com sucesso.</p><p>URL de acesso: <a href="' +
          siteUrl +
          '">' +
          siteUrl +
          '</a></p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>'
      }

      var message = new Mail({
        from: { address: 'noreply@drgestorclin.com', name: 'DrGestorClin' },
        to: [{ address: email }],
        subject: 'Bem-vindo ao DrGestorClin - Sua Conta de Acesso',
        text: emailText,
        html: emailHtml,
      })
      $app.newMailClient().send(message)
      $app.logger().info('Onboarding email sent to doctor via internal mailer', 'email', email)
    } catch (err) {
      $app.logger().error('Failed to send onboarding email to doctor', 'error', err.message)
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
          text: {
            body:
              'Olá Dr(a). ' +
              name +
              ', bem-vindo ao DrGestorClin! Sua conta de acesso foi criada. Verifique seu e-mail para obter a senha temporária.',
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
