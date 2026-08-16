// Limpa o flag `force_password_change` sempre que a senha de um usuário
// auth é efetivamente alterada, seja pelo fluxo "esqueci minha senha"
// (confirmPasswordReset), pelo endpoint de update do próprio usuário
// (UpdatePassword.tsx) ou por um admin redefinindo a senha.
//
// Antes este hook só limpava o flag em condições muito restritas
// (original=true E current=true), o que fazia o usuário ficar preso no
// loop /update-password. Agora, sempre que a senha muda, garantimos
// force_password_change=false.
onRecordUpdate((e) => {
  var oldPass = e.record.original().getString('password')
  var newPass = e.record.getString('password')

  // A senha foi alterada de fato?
  var passwordChanged = !!newPass && (!oldPass || oldPass !== newPass)

  if (passwordChanged) {
    e.record.set('force_password_change', false)
  }

  e.next()
}, 'users')
