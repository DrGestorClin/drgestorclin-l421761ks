import pb from '@/lib/pocketbase/client'
import { displayableMessages, type DisplayMessage } from '@/lib/skipAi'

export interface AssistantConversation {
  id: string
  title?: string
  created: string
  updated: string
}

export const getConversations = async (): Promise<AssistantConversation[]> =>
  pb.send('/backend/v1/assistant/conversations', { method: 'GET' })

export const getConversationMessages = async (
  conversationId: string,
): Promise<DisplayMessage[]> => {
  const data = await pb.send(`/backend/v1/assistant/conversations/${conversationId}/messages`, {
    method: 'GET',
  })
  return displayableMessages(data.messages || [])
}

export const streamAssistantChat = async (
  message: string,
  conversationId: string | null,
  signal: AbortSignal,
): Promise<Response> =>
  fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/assistant/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token,
    },
    body: JSON.stringify({ message, conversation_id: conversationId }),
    signal,
  })
