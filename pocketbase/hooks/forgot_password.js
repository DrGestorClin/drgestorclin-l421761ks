routerAdd('POST', '/backend/v1/forgot-password', (e) => {
  var body = e.requestInfo().body || {}
  var email = (body.email || '').trim()
  if (!email) return e.badRequestError('email is required')

  var userRecord = null
  try {
    userRecord = $app.findAuthRecordByEmail('_pb_users_auth_', email)
  } catch (_) {}

  var genericMessage =
    'Se o e-mail estiver cadastrado e for de um administrador ou médico, você receberá uma senha provisória.'

  if (!userRecord) {
    return e.json(200, { success: true, message: genericMessage })
  }

  var role = ''
  try {
    role = userRecord.get('role') || ''
  } catch (_) {}

  if (role !== 'ADM' && role !== 'Medico') {
    return e.json(200, { success: true, message: genericMessage })
  }

  var provisionalPassword = $security.randomString(16)
  try {
    userRecord.setPassword(provisionalPassword)
    userRecord.set('force_password_change', true)
    $app.save(userRecord)

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var auditRecord = new Record(auditCol)
      auditRecord.set('user', userRecord.id)
      auditRecord.set('action', 'PASSWORD_RESET')
      auditRecord.set('resource', 'users')
      auditRecord.set('resource_id', userRecord.id)
      auditRecord.set('details', 'Senha provisória enviada por e-mail')
      $app.save(auditRecord)
    } catch (auditErr) {
      $app
        .logger()
        .error(
          'Failed to create audit log for password reset',
          'error',
          (auditErr && auditErr.message) || '',
        )
    }
  } catch (err) {
    $app
      .logger()
      .error('Failed to reset password', 'error', (err && err.message) || '', 'email', email)
    return e.json(500, {
      success: false,
      message: 'Erro ao redefinir a senha. Tente novamente.',
    })
  }

  var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
  var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
  var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
  var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    try {
      var settings = $app.settings()
      settings.SMTP.Host = smtpHost
      settings.SMTP.Port = parseInt(smtpPort)
      settings.SMTP.Username = smtpUser
      settings.SMTP.Password = smtpPass
      settings.SMTP.Enabled = true
      settings.SMTP.TLS = parseInt(smtpPort) === 465
      $app.save(settings)

      $app.newMailClient().send({
        from: { address: smtpUser, name: 'DrGestorClin' },
        to: [{ address: email }],
        subject: 'DrGestorClin - Senha Provisória',
        text:
          'Sua senha provisória é: ' + provisionalPassword + '. Por favor, altere-a após o login.',
        html:
          '<p>Sua senha provisória é: <strong>' +
          provisionalPassword +
          '</strong>. Por favor, altere-a após o login.</p>',
      })

      $app.logger().info('Provisional password email sent', 'email', email)
    } catch (err) {
      $app
        .logger()
        .error('Failed to send provisional password email', 'error', err.message, 'email', email)
    }
  } else {
    $app.logger().error('SMTP_CONFIG_MISSING', 'hook', 'forgot_password', 'email', email)
  }

  return e.json(200, { success: true, message: genericMessage })
})
