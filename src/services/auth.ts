import pb from '@/lib/pocketbase/client'

export interface ForgotPasswordResult {
  success: boolean
  error?: string
  message: string
}

export const forgotPassword = async (email: string): Promise<ForgotPasswordResult> => {
  try {
    await pb.collection('users').requestPasswordReset(email)
    return {
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá o link de redefinição.',
    }
  } catch (err: any) {
    const status = err?.status || 0
    let message = 'Não foi possível enviar o e-mail de recuperação. Tente novamente.'
    if (status === 0) {
      message = 'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
    } else if (status === 429) {
      message = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
    } else if (status >= 500) {
      message = 'O servidor está indisponível no momento. Tente novamente em instantes.'
    } else if (status === 400) {
      message = 'O e-mail informado é inválido. Verifique o endereço e tente novamente.'
    }
    return {
      success: false,
      error: err?.code || 'ERROR',
      message,
    }
  }
}
