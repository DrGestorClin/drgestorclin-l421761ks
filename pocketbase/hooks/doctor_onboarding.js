onRecordAfterCreateSuccess((e) => {
  const doctor = e.record
  const email = doctor.getString('email')
  const phone = doctor.getString('phone')
  const name = doctor.getString('name')
  const doctorId = doctor.id

  const siteUrl = $secrets.get('SITE_URL') || 'https://drgestorclin-52167.goskip.app'

  var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
  var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
  var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
  var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

  var smtpConfigured = smtpHost && smtpPort && smtpUser && smtpPass

  if (!smtpConfigured) {
    $app.logger().error('SMTP_CONFIG_MISSING', 'hook', 'doctor_onboarding', 'doctor_id', doctorId)
  } else {
    try {
      var settings = $app.settings()
      settings.SMTP.Host = smtpHost
      settings.SMTP.Port = parseInt(smtpPort)
      settings.SMTP.Username = smtpUser
      settings.SMTP.Password = smtpPass
      settings.SMTP.Enabled = true
      settings.SMTP.TLS = parseInt(smtpPort) === 465
      $app.save(settings)
    } catch (err) {
      $app.logger().error('Failed to configure SMTP settings', 'error', err.message)
    }
  }

  var tempPassword = ''
  var userCreated = false

  if (email) {
    var userExists = false
    try {
      $app.findAuthRecordByEmail('_pb_users_auth_', email)
      userExists = true
    } catch (_) {}

    if (!userExists) {
      tempPassword = $security.randomString(16)
      try {
        var usersCol = $app.findCollectionByNameOrId('_pb_users_auth_')
        var userRecord = new Record(usersCol)
        userRecord.setEmail(email)
        userRecord.setPassword(tempPassword)
        userRecord.setVerified(true)
        userRecord.set('name', name)
        userRecord.set('role', 'Medico')
        userRecord.set('doctor_ref', doctorId)
        userRecord.set('force_password_change', true)
        $app.save(userRecord)
        userCreated = true
        $app.logger().info('User account created for doctor', 'email', email, 'doctor_id', doctorId)
      } catch (err) {
        $app.logger().error('Failed to create user account for doctor', 'error', err.message)
      }
    } else {
      $app.logger().info('User account already exists for doctor email', 'email', email)
    }

    if (smtpConfigured) {
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

        $app.newMailClient().send({
          from: { address: smtpUser, name: 'DrGestorClin' },
          to: [{ address: email }],
          subject: 'Bem-vindo ao DrGestorClin - Sua Conta de Acesso',
          text: emailText,
          html: emailHtml,
        })

        try {
          var rec = $app.findRecordById('doctors', doctorId)
          rec.set('email_status', 'sent')
          $app.save(rec)
        } catch (_) {}

        $app.logger().info('Onboarding email sent to doctor', 'email', email)
      } catch (err) {
        var errorMsg = (err && err.message) || ''
        if (
          errorMsg.indexOf('535') !== -1 ||
          errorMsg.indexOf('auth') !== -1 ||
          errorMsg.indexOf('Auth') !== -1
        ) {
          $app
            .logger()
            .error(
              'SMTP_AUTH_FAILED',
              'hook',
              'doctor_onboarding',
              'error',
              errorMsg,
              'email',
              email,
            )
        } else {
          $app
            .logger()
            .error(
              'SMTP_SEND_FAILED',
              'hook',
              'doctor_onboarding',
              'error',
              errorMsg,
              'email',
              email,
            )
        }

        try {
          var rec2 = $app.findRecordById('doctors', doctorId)
          rec2.set('email_status', 'failed')
          $app.save(rec2)
        } catch (_) {}
      }
    } else {
      try {
        var rec3 = $app.findRecordById('doctors', doctorId)
        rec3.set('email_status', 'failed')
        $app.save(rec3)
      } catch (_) {}
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
        headers: { Authorization: 'Bearer ' + waToken, 'Content-Type': 'application/json' },
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
