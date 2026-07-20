onRecordAfterCreateSuccess((e) => {
  var user = e.record
  var email = user.getString('email')
  var name = user.getString('name') || ''
  var userId = user.id
  var doctorRef = user.getString('doctor_ref')

  if (doctorRef) {
    return e.next()
  }

  if (!email) {
    return e.next()
  }

  var forcePasswordChange = user.getBool('force_password_change')
  if (forcePasswordChange) {
    return e.next()
  }

  var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
  var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
  var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
  var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    $app.logger().error('SMTP_CONFIG_MISSING', 'hook', 'user_welcome_email', 'user_id', userId)
    return e.next()
  }

  var tempPassword = $security.randomString(16)

  try {
    var rec = $app.findRecordById('users', userId)
    rec.setPassword(tempPassword)
    rec.set('force_password_change', true)
    $app.save(rec)
  } catch (err) {
    $app
      .logger()
      .error(
        'Failed to set provisional password for new user',
        'error',
        (err && err.message) || '',
        'user_id',
        userId,
      )
    return e.next()
  }

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
    $app.logger().error('Failed to configure SMTP settings', 'error', (err && err.message) || '')
    return e.next()
  }

  var siteUrl = $secrets.get('SITE_URL') || 'https://drgestorclin-52167.goskip.app'

  try {
    var emailText =
      'Olá ' +
      name +
      ',\n\nSua conta foi criada no DrGestorClin!\n\nDetalhes de acesso:\nE-mail: ' +
      email +
      '\nSenha temporária: ' +
      tempPassword +
      '\nURL de acesso: ' +
      siteUrl +
      '\n\nPor segurança, você deve alterar sua senha após o primeiro login.\n\nAtenciosamente,\nEquipe DrGestorClin'

    var emailHtml =
      '<p>Olá ' +
      name +
      ',</p><p>Sua conta foi criada no <strong>DrGestorClin</strong>!</p><p><strong>Detalhes de acesso:</strong><br/>E-mail: ' +
      email +
      '<br/>Senha temporária: <strong>' +
      tempPassword +
      '</strong><br/>URL de acesso: <a href="' +
      siteUrl +
      '">' +
      siteUrl +
      '</a></p><p>Por segurança, você deve alterar sua senha após o primeiro login.</p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>'

    $app.newMailClient().send({
      from: { address: smtpUser, name: 'DrGestorClin' },
      to: [{ address: email }],
      subject: 'Bem-vindo ao DrGestorClin - Sua Conta de Acesso',
      text: emailText,
      html: emailHtml,
    })

    $app.logger().info('Welcome email sent to new user', 'email', email, 'user_id', userId)
  } catch (err) {
    var errorMsg = (err && err.message) || ''
    $app
      .logger()
      .error(
        'Failed to send welcome email to user',
        'error',
        errorMsg,
        'email',
        email,
        'user_id',
        userId,
      )
  }

  return e.next()
}, 'users')
