import pb from '@/lib/pocketbase/client'

export interface ForgotPasswordResult {
  success: boolean
  message: string
}

export const forgotPassword = async (email: string): Promise<ForgotPasswordResult> => {
  try {
    const result = await pb.send('/backend/v1/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    })
    return result as ForgotPasswordResult
  } catch (err: any) {
    const responseData = err?.response
    return {
      success: false,
      message: responseData?.message || 'Erro de conexão ao tentar redefinir a senha.',
    }
  }
}
