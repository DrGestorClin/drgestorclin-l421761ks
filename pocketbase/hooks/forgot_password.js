routerAdd('POST', '/backend/v1/forgot-password', (e) => {
  var body = e.requestInfo().body || {}
  var email = (body.email || '').trim()
  if (!email) return e.badRequestError('email is required')

  function logAudit(userId, details) {
    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var auditRecord = new Record(auditCol)
      if (userId) {
        auditRecord.set('user', userId)
      }
      auditRecord.set('action', 'password_reset_request')
      auditRecord.set('resource', 'users')
      auditRecord.set('resource_id', userId || email)
      auditRecord.set('details', details)
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
  }

  var genericMessage = 'Se uma conta existir com este e-mail, você receberá uma senha provisória.'

  var userRecord = null
  try {
    userRecord = $app.findAuthRecordByEmail('_pb_users_auth_', email)
  } catch (_) {}

  if (!userRecord) {
    logAudit('', 'Tentativa de recuperação para e-mail não cadastrado: ' + email)
    return e.json(200, { success: true, message: genericMessage })
  }

  var provisionalPassword = $security.randomString(16)

  try {
    userRecord.setPassword(provisionionalPassword)
    userRecord.set('force_password_change', true)
    $app.save(userRecord)
  } catch (err) {
    logAudit(userRecord.id, 'Falha ao redefinir senha: ' + ((err && err.message) || ''))
    return e.json(500, {
      success: false,
      message: 'Erro ao redefinir a senha. Tente novamente.',
    })
  }

  var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
  var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
  var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
  var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    logAudit(userRecord.id, 'Falha ao enviar e-mail: SMTP não configurado')
    return e.json(500, {
      success: false,
      message: 'Serviço de e-mail não configurado. Contate o administrador do sistema.',
    })
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
    logAudit(
      userRecord.id,
      'Falha ao enviar e-mail de recuperação: ' + ((err && err.message) || ''),
    )
    return e.json(500, {
      success: false,
      message: 'Falha ao enviar o e-mail de recuperação. Tente novamente ou contate o suporte.',
    })
  }

  logAudit(userRecord.id, 'Senha provisória enviada por e-mail')

  return e.json(200, { success: true, message: genericMessage })
})
