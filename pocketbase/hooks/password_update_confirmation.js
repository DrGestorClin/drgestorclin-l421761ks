onRecordAfterUpdateSuccess((e) => {
  var originalForceChange = e.record.original().get('force_password_change')
  var currentForceChange = e.record.get('force_password_change')

  if (!originalForceChange || currentForceChange) {
    return e.next()
  }

  // Registrar no audit log
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

  // Enviar confirmação de alteração de senha
  // O SMTP da plataforma (shared relay) cuida da entrega automaticamente.
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
      from: { address: 'noreply@mail.goskip.dev', name: 'DrGestorClin' },
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

  return e.next()
}, 'users')
