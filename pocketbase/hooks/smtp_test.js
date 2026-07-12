routerAdd(
  'POST',
  '/backend/v1/test-email',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')
    var userRole = ''
    try {
      userRole = e.auth.get('role') || ''
    } catch (_) {}
    if (userRole !== 'ADM') return e.forbiddenError('admin access required')

    var body = e.requestInfo().body || {}
    var toEmail = (body.email || '').trim()
    if (!toEmail) return e.badRequestError('email is required')

    var smtpHost = $secrets.get('GMAIL_SMTP_HOST')
    var smtpPort = $secrets.get('GMAIL_SMTP_PORT')
    var smtpUser = $secrets.get('GMAIL_SMTP_USERNAME')
    var smtpPass = $secrets.get('GMAIL_SMTP_PASSWORD')

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      $app.logger().error('SMTP_CONFIG_MISSING', 'hook', 'smtp_test')
      return e.json(400, {
        success: false,
        error: 'SMTP_CONFIG_MISSING',
        message:
          'Configurações de SMTP não encontradas. Verifique se GMAIL_SMTP_HOST, GMAIL_SMTP_PORT, GMAIL_SMTP_USERNAME e GMAIL_SMTP_PASSWORD estão configurados.',
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
    } catch (err) {
      $app.logger().error('Failed to configure SMTP settings', 'error', err.message)
    }

    try {
      $app.newMailClient().send({
        from: { address: smtpUser, name: 'DrGestorClin' },
        to: [{ address: toEmail }],
        subject: 'DrGestorClin - Teste de Configuração de E-mail',
        text: 'Este é um e-mail de teste do DrGestorClin.\n\nSe você recebeu esta mensagem, as configurações de SMTP estão funcionando corretamente.\n\nAtenciosamente,\nEquipe DrGestorClin',
        html: '<p>Este é um e-mail de teste do DrGestorClin.</p><p>Se você recebeu esta mensagem, as configurações de SMTP estão funcionando corretamente.</p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>',
      })
      $app.logger().info('Test email sent successfully', 'to', toEmail)
      return e.json(200, {
        success: true,
        message: 'E-mail de teste enviado com sucesso para ' + toEmail,
      })
    } catch (err) {
      var errorMsg = (err && err.message) || ''
      if (
        errorMsg.indexOf('535') !== -1 ||
        errorMsg.indexOf('auth') !== -1 ||
        errorMsg.indexOf('Auth') !== -1
      ) {
        $app.logger().error('SMTP_AUTH_FAILED', 'hook', 'smtp_test', 'error', errorMsg)
        return e.json(500, {
          success: false,
          error: 'SMTP_AUTH_FAILED',
          message: 'Falha na autenticação SMTP. Verifique o usuário e senha do Gmail.',
        })
      }
      $app.logger().error('SMTP_SEND_FAILED', 'hook', 'smtp_test', 'error', errorMsg)
      return e.json(500, {
        success: false,
        error: 'SMTP_SEND_FAILED',
        message: 'Falha ao enviar e-mail: ' + errorMsg,
      })
    }
  },
  $apis.requireAuth(),
)
