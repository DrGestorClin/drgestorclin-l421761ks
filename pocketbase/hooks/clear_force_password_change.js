onRecordUpdate((e) => {
  var oldPass = e.record.original().getString('password')
  var newPass = e.record.getString('password')

  if (oldPass && newPass && oldPass !== newPass) {
    var originalForceChange = e.record.original().getBool('force_password_change')
    var currentForceChange = e.record.getBool('force_password_change')

    if (originalForceChange && currentForceChange) {
      e.record.set('force_password_change', false)
    }
  }

  e.next()
}, 'users')
