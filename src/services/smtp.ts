import pb from '@/lib/pocketbase/client'

export interface TestEmailResult {
  success: boolean
  error?: string
  message: string
}

export const sendTestEmail = async (email: string): Promise<TestEmailResult> => {
  try {
    const result = await pb.send('/backend/v1/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    })
    return result as TestEmailResult
  } catch (err: any) {
    const responseData = err?.response
    return {
      success: false,
      error: responseData?.error || 'NETWORK_ERROR',
      message: responseData?.message || 'Erro de conexão ao tentar enviar e-mail de teste.',
    }
  }
}
