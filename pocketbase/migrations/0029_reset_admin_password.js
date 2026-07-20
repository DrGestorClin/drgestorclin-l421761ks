migrate(
  (app) => {
    try {
      var user = app.findAuthRecordByEmail('_pb_users_auth_', 'm.bruno.f@gmail.com')
      user.setPassword('Skip@Pass')
      user.set('force_password_change', false)
      app.save(user)
    } catch (_) {}
  },
  (app) => {},
)
