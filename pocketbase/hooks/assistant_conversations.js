routerAdd(
  'GET',
  '/backend/v1/assistant/conversations',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')
    const limit = parseInt(e.requestInfo().query?.limit || '20', 10) || 20
    return e.json(200, $ai.agent('clinic-assistant').listConversations({ user_id: userId, limit }))
  },
  $apis.requireAuth(),
)
