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
    // requestPasswordReset não retorna erro se o email não existe (segurança)
    // mas pode falhar por outros motivos (rede, etc)
    return {
      success: false,
      error: err?.code || 'NETWORK_ERROR',
      message: 'Erro de conexão ao tentar redefinir a senha. Tente novamente.',
    }
  }
}
