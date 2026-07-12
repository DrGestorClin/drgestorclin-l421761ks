onRecordAfterUpdateSuccess((e) => {
  var originalForceChange = e.record.original().getBool('force_password_change')
  var currentForceChange = e.record.getBool('force_password_change')

  if (!originalForceChange || currentForceChange) {
    return e.next()
  }

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var auditRecord = new Record(auditCol)
    auditRecord.set('user', e.record.id)
    auditRecord.set('action', 'PASSWORD_CHANGE')
    auditRecord.set('resource', 'users')
    auditRecord.set('resource_id', e.record.id)
    auditRecord.set('details', 'Senha atualizada pelo usuário')
    $app.save(auditRecord)
  } catch (auditErr) {
    $app
      .logger()
      .error(
        'Failed to create audit log for password change',
        'error',
        (auditErr && auditErr.message) || '',
      )
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

  var adminEmail = 'drgestorclin@gmail.com'

  try {
    var userText =
      'Olá ' +
      name +
      ',\n\nSua senha foi atualizada com sucesso no DrGestorClin. Se você não realizou esta alteração, entre em contato imediatamente com o administrador do sistema.\n\nAtenciosamente,\nEquipe DrGestorClin'

    var userHtml =
      '<p>Olá ' +
      name +
      ',</p><p>Sua senha foi atualizada com sucesso no <strong>DrGestorClin</strong>.</p><p>Se você não realizou esta alteração, entre em contato imediatamente com o administrador do sistema.</p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>'

    $app.newMailClient().send({
      from: { address: smtpUser, name: 'DrGestorClin' },
      to: [{ address: email }],
      subject: 'DrGestorClin - Senha Atualizada com Sucesso',
      text: userText,
      html: userHtml,
    })

    $app
      .logger()
      .info('Password update confirmation email sent to user', 'email', email, 'user_id', userId)
  } catch (err) {
    $app
      .logger()
      .error(
        'Failed to send password update confirmation email to user',
        'error',
        (err && err.message) || '',
        'email',
        email,
        'user_id',
        userId,
      )
  }

  try {
    var adminText =
      'Olá Administrador,\n\nO usuário ' +
      name +
      ' (' +
      email +
      ') atualizou sua senha com sucesso no DrGestorClin.\n\nData da alteração: ' +
      new Date().toISOString() +
      '\n\nAtenciosamente,\nEquipe DrGestorClin'

    var adminHtml =
      '<p>Olá Administrador,</p><p>O usuário <strong>' +
      name +
      '</strong> (' +
      email +
      ') atualizou sua senha com sucesso no <strong>DrGestorClin</strong>.</p><p><strong>Data da alteração:</strong> ' +
      new Date().toISOString() +
      '</p><p>Atenciosamente,<br/>Equipe DrGestorClin</p>'

    $app.newMailClient().send({
      from: { address: smtpUser, name: 'DrGestorClin' },
      to: [{ address: adminEmail }],
      subject: 'DrGestorClin - Confirmação de Alteração de Senha',
      text: adminText,
      html: adminHtml,
    })

    $app
      .logger()
      .info(
        'Password update notification sent to admin',
        'admin_email',
        adminEmail,
        'user_id',
        userId,
      )
  } catch (err) {
    $app
      .logger()
      .error(
        'Failed to send password update notification to admin',
        'error',
        (err && err.message) || '',
        'admin_email',
        adminEmail,
        'user_id',
        userId,
      )
  }

  return e.next()
}, 'users')
