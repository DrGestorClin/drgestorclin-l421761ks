onRecordAfterUpdateSuccess((e) => {
  var originalForceChange = e.record.original().getBool('force_password_change')
  var currentForceChange = e.record.getBool('force_password_change')

  // Only fire when force_password_change goes from true to false
  // (which happens during the password update flow)
  if (!originalForceChange || currentForceChange) {
    return e.next()
  }

  var email = e.record.getString('email')
  var name = e.record.getString('name') || 'Usuário'
  var userId = e.record.id

  if (!email) {
    return e.next()
  }

  var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
  var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
  var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
  var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    $app
      .logger()
      .error('SMTP_CONFIG_MISSING', 'hook', 'password_update_confirmation', 'user_id', userId)
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
    $app.logger().error('Failed to configure SMTP settings', 'error', err.message)
    return e.next()
  }

  try {
    var emailText =
      'Olá ' +
      name +
      ',\n\nSua senha foi atualizada com sucesso no DrGestorClin. Se você não realizou esta alteração, entre em contato imediatamente com o administrador do sistema.\n\nAtenciosamente,\nEquipe DrGestorClin'

    var emailHtml =
      '<p>Olá ' +
      name +
      ',</p><p>Sua senha foi atualizada com sucesso no <strong>DrGestorClin</strong>.</p><p>Se você não realizou esta alteração, entre em contato imediatamente com o administrador do sistema.</p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>'

    $app.newMailClient().send({
      from: { address: smtpUser, name: 'DrGestorClin' },
      to: [{ address: email }],
      subject: 'DrGestorClin - Senha Atualizada com Sucesso',
      text: emailText,
      html: emailHtml,
    })

    $app.logger().info('Password update confirmation email sent', 'email', email, 'user_id', userId)
  } catch (err) {
    var errorMsg = (err && err.message) || ''
    $app
      .logger()
      .error(
        'Failed to send password update confirmation email',
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
