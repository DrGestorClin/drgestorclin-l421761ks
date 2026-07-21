onRecordAfterCreateSuccess((e) => {
  var user = e.record
  var email = user.getString('email')
  var name = user.getString('name') || ''
  var userId = user.id
  var doctorRef = user.getString('doctor_ref')

  // Não enviar welcome email para médicos (hook doctor_onboarding cuida disso)
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

  // Se force_password_change já é true, o admin definiu uma senha
  // e o usuário vai trocar no primeiro login. Não sobrescrever.
  var forcePasswordChange = user.getBool('force_password_change')
  if (forcePasswordChange) {
    return e.next()
  }

  var siteUrl = $secrets.get('SITE_URL') || 'https://drgestorclin-52167.goskip.app'

  // Enviar email de boas-vindas informativo (sem gerar nova senha)
  // O SMTP da plataforma (shared relay) cuida da entrega automaticamente.
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
      from: { address: 'noreply@mail.goskip.dev', name: 'DrGestorClin' },
      to: [{ address: email }],
      subject: 'Bem-vindo ao DrGestorClin - Sua Conta de Acesso',
      text: emailText,
      html: emailHtml,
    })

    $app.logger().info('Welcome email sent to new user', 'email', email, 'user_id', userId)
  } catch (err) {
    $app
      .logger()
      .error(
        'Failed to send welcome email to user',
        'error',
        (err && err.message) || '',
        'email',
        email,
        'user_id',
        userId,
      )
  }

  return e.next()
}, 'users')
