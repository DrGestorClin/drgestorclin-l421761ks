import pb from '@/lib/pocketbase/client'

export interface ForgotPasswordResult {
  success: boolean
  error?: string
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
      error: responseData?.error || 'NETWORK_ERROR',
      message: responseData?.message || 'Erro de conexão ao tentar redefinir a senha.',
    }
  }
}
