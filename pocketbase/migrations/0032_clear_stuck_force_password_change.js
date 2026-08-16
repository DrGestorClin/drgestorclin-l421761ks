// Corrige o loop infinito em /update-password: o admin drgestorclin@gmail.com
// está com force_password_change=true travado no banco, mesmo após trocar a
// senha (o hook antigo não limpu o flag de forma confiável). Esta migration
// zera o flag para os admins já verificados que ainda estão presos.
//
// O hook `clear_force_password_change.js` (reescrito) agora garante que
// qualquer alteração de senha zere o flag, então isso não deve se repetir.
migrate(
  (app) => {
    var targets = ['drgestorclin@gmail.com', 'm.bruno.f@gmail.com']

    for (var i = 0; i < targets.length; i++) {
      try {
        var rec = app.findAuthRecordByEmail('_pb_users_auth_', targets[i])
        if (rec.getBool('force_password_change')) {
          rec.set('force_password_change', false)
          app.save(rec)
        }
      } catch (_) {}
    }

    // Zera o flag para qualquer outro ADM verificado que ainda esteja preso
    // (defensivo — não deve existir, mas evita loops para outros admins).
    try {
      var admins = app.findRecordsByFilter(
        '_pb_users_auth_',
        "role = 'ADM' && force_password_change = true && verified = true",
        '',
        0,
        0,
      )
      for (var j = 0; j < admins.length; j++) {
        admins[j].set('force_password_change', false)
        app.save(admins[j])
      }
    } catch (_) {}
  },
  (app) => {
    // Nada a desfazer — correção de dados pontual.
  },
)
