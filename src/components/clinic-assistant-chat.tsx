import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { streamAgentChat, type AgentCitation } from '@/lib/skipAi'
import { streamAssistantChat } from '@/services/assistant'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: AgentCitation[]
  streaming?: boolean
}

const SUGGESTIONS = [
  'Quais consultas estão agendadas para amanhã?',
  'Quais são as especialidades dos médicos?',
  'Como funciona o modelo SOAP?',
]

export function ClinicAssistantChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(
    async (text?: string) => {
      const msg = (text ?? input).trim()
      if (!msg || isStreaming) return
      setInput('')
      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: msg }
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: '',
        streaming: true,
      }
      setMessages((p) => [...p, userMsg, aiMsg])
      setIsStreaming(true)
      const ctrl = new AbortController()
      abortRef.current = ctrl

      try {
        const res = await streamAssistantChat(msg, conversationId, ctrl.signal)
        const headerConvId = res.headers.get('X-Conversation-Id')
        if (headerConvId && !conversationId) setConversationId(headerConvId)

        const result = await streamAgentChat(res, {
          onChunk: (_d, full) =>
            setMessages((p) => p.map((m) => (m.id === aiMsg.id ? { ...m, content: full } : m))),
          signal: ctrl.signal,
        })

        setMessages((p) =>
          p.map((m) =>
            m.id === aiMsg.id
              ? { ...m, content: result.content, citations: result.citations, streaming: false }
              : m,
          ),
        )
        if (result.conversation_id && !conversationId) setConversationId(result.conversation_id)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setMessages((p) => p.map((m) => (m.id === aiMsg.id ? { ...m, streaming: false } : m)))
          return
        }
        setMessages((p) =>
          p.map((m) =>
            m.id === aiMsg.id
              ? { ...m, content: 'Desculpe, ocorreu um erro. Tente novamente.', streaming: false }
              : m,
          ),
        )
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [input, isStreaming, conversationId],
  )

  const handleClose = () => {
    abortRef.current?.abort()
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-brand-forest text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all animate-float flex items-center justify-center"
        aria-label="Abrir assistente"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[380px] h-[60vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in-up">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-forest to-brand-military text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-bold text-sm">Assistente da Clínica</span>
        </div>
        <button
          onClick={handleClose}
          className="hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 no-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-brand-military/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-brand-forest" />
            </div>
            <p className="text-sm text-slate-600 font-medium">
              Olá! Sou o Assistente da Clínica. Como posso ajudar?
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-brand-forest hover:text-brand-forest transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] px-3 py-2 rounded-xl text-sm',
                  m.role === 'user'
                    ? 'bg-brand-forest text-white rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm',
                )}
              >
                {m.content ||
                  (m.streaming ? (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </span>
                  ) : (
                    ''
                  ))}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {m.citations.map((c) => (
                      <span
                        key={c.n}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500"
                      >
                        [{c.n}]
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Digite sua pergunta..."
            disabled={isStreaming}
            className="text-sm"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={isStreaming || !input.trim()}
            className="shrink-0 bg-brand-forest hover:bg-brand-military"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
