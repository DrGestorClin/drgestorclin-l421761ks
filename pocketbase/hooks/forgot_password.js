routerAdd('POST', '/backend/v1/forgot-password', (e) => {
  var body = e.requestInfo().body || {}
  var email = (body.email || '').trim().toLowerCase()
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

  // ── 1. Buscar usuário pelo email ──
  var userRecord = null
  try {
    userRecord = $app.findAuthRecordByEmail('_pb_users_auth_', email)
  } catch (_) {}

  if (!userRecord) {
    logAudit('', 'Tentativa de recuperação para e-mail não cadastrado: ' + email)
    // Retornar 200 genérico para não vazar quais emails existem
    return e.json(200, {
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.',
    })
  }

  // ── 2. Verificar SMTP ──
  var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
  var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
  var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
  var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    logAudit(userRecord.id, 'Falha ao enviar e-mail: SMTP não configurado')
    $app.logger().error('SMTP_CONFIG_MISSING', 'hook', 'forgot_password', 'email', email)
    return e.json(200, {
      success: false,
      error: 'SMTP_UNAVAILABLE',
      message: 'Serviço de e-mail temporariamente indisponível. Contate o suporte.',
    })
  }

  // ── 3. Configurar SMTP ──
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
    logAudit(userRecord.id, 'Falha ao configurar SMTP: ' + ((err && err.message) || ''))
    return e.json(200, {
      success: false,
      error: 'SMTP_UNAVAILABLE',
      message: 'Serviço de e-mail temporariamente indisponível. Contate o suporte.',
    })
  }

  // ── 4. Gerar senha provisória e SALVAR PRIMEIRO ──
  var provisionalPassword = $security.randomString(16)

  try {
    userRecord.setPassword(provisionionalPassword)
    userRecord.set('force_password_change', true)
    $app.save(userRecord)
  } catch (err) {
    logAudit(userRecord.id, 'Falha ao salvar senha provisória: ' + ((err && err.message) || ''))
    return e.json(500, {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro ao processar a solicitação. Tente novamente.',
    })
  }

  // ── 5. ENVIAR EMAIL DEPOIS de salvar (ordem correta) ──
  try {
    $app.newMailClient().send({
      from: { address: smtpUser, name: 'DrGestorClin' },
      to: [{ address: email }],
      subject: 'DrGestorClin - Recuperação de Senha',
      text:
        'Olá,\n\nVocê solicitou a recuperação de sua senha no DrGestorClin.\n\nSua senha provisória é: ' +
        provisionalPassword +
        '\n\nPor segurança, altere-a após o login.\n\nAtenciosamente,\nEquipe DrGestorClin',
      html:
        '<p>Olá,</p><p>Você solicitou a recuperação de sua senha no <strong>DrGestorClin</strong>.</p><p>Sua senha provisória é: <strong>' +
        provisionalPassword +
        '</strong></p><p>Por segurança, altere-a após o login.</p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>',
    })
  } catch (err) {
    // Email falhou — mas a senha já foi salva no banco
    // Logar erro mas informar que a senha foi alterada
    logAudit(
      userRecord.id,
      'Senha alterada mas falha ao enviar e-mail: ' + ((err && err.message) || ''),
    )
    $app
      .logger()
      .error(
        'Failed to send password reset email',
        'error',
        (err && err.message) || '',
        'email',
        email,
      )
    return e.json(200, {
      success: false,
      error: 'EMAIL_SEND_FAILED',
      message:
        'Não foi possível enviar o e-mail. Contate o administrador para receber sua senha provisória.',
    })
  }

  $app.logger().info('Provisional password email sent', 'email', email)
  logAudit(userRecord.id, 'Senha provisória enviada por e-mail')

  return e.json(200, {
    success: true,
    message: 'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.',
  })
})
