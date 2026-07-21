onRecordAfterCreateSuccess((e) => {
  var user = e.record
  var email = user.getString('email')
  var name = user.getString('name') || ''
  var userId = user.id
  var doctorRef = user.getString('doctor_ref')

  // Não enviar welcome email para médicos (já têm o hook doctor_onboarding)
  if (doctorRef) {
    return e.next()
  }

  // Não enviar para admins
  var role = user.getString('role')
  if (role === 'ADM') {
    return e.next()
  }

  if (!email) {
    return e.next()
  }

  // Se force_password_change já é true, o admin já definiu uma senha
  // e o usuário vai trocar no primeiro login. Não sobrescrever.
  var forcePasswordChange = user.getBool('force_password_change')
  if (forcePasswordChange) {
    return e.next()
  }

  // ── Verificar SMTP ──
  var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
  var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
  var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
  var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    $app.logger().error('SMTP_CONFIG_MISSING', 'hook', 'user_welcome_email', 'user_id', userId)
    return e.next()
  }

  // ── Configurar SMTP ──
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

  // ── Enviar email de boas-vindas (sem gerar nova senha) ──
  // A senha foi definida pelo admin ou pelo próprio usuário no signup.
  // Aqui apenas enviamos um email informativo de boas-vindas.
  var siteUrl = $secrets.get('SITE_URL') || 'https://drgestorclin-52167.goskip.app'

  try {
    var emailText =
      'Olá ' +
      name +
      ',\n\nSua conta foi criada no DrGestorClin!\n\nDetalhes de acesso:\nE-mail: ' +
      email +
      '\nURL de acesso: ' +
      siteUrl +
      '\n\nUse a senha que foi definida no seu cadastro. Se foi criado por um administrador, você será solicitado a alterar sua senha no primeiro login.\n\nAtenciosamente,\nEquipe DrGestorClin'

    var emailHtml =
      '<p>Olá ' +
      name +
      ',</p><p>Sua conta foi criada no <strong>DrGestorClin</strong>!</p><p><strong>Detalhes de acesso:</strong><br/>E-mail: ' +
      email +
      '<br/>URL de acesso: <a href="' +
      siteUrl +
      '">' +
      siteUrl +
      '</a></p><p>Use a senha que foi definida no seu cadastro. Se foi criado por um administrador, você será solicitado a alterar sua senha no primeiro login.</p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>'

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
