import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, X, Send, Sparkles, Stethoscope } from 'lucide-react'
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
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-brand-green/30 animate-pulse-ring" />
          <button
            onClick={() => setIsOpen(true)}
            className="relative h-14 w-14 rounded-full bg-gradient-to-br from-[hsl(160_55%_42%)] to-[hsl(160_55%_32%)] text-white shadow-floating hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center ring-4 ring-white/60"
            aria-label="Abrir assistente"
          >
            <Stethoscope className="h-6 w-6" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[380px] h-[60vh] max-h-[560px] glass-panel rounded-2xl shadow-floating border border-white/40 overflow-hidden animate-fade-in-up">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[hsl(160_55%_32%)] to-[hsl(200_60%_42%)] text-white">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-white/20 backdrop-blur-sm p-1.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight">Assistente da Clínica</span>
            <span className="text-[10px] text-white/70 font-medium">Online agora</span>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-green-light to-sky-50 flex items-center justify-center shadow-card">
              <Bot className="h-7 w-7 text-brand-green" />
            </div>
            <div>
              <p className="text-sm text-foreground font-semibold">
                Olá! Sou o Assistente da Clínica
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Como posso ajudar você hoje?</p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl bg-white/80 border border-border/60 hover:border-brand-green/40 hover:bg-brand-green-light/40 hover:text-brand-green-dark transition-all"
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
                  'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm',
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-[hsl(160_55%_42%)] to-[hsl(160_55%_36%)] text-white rounded-br-md shadow-card'
                    : 'glass-panel border border-border/40 text-foreground rounded-bl-md shadow-card',
                )}
              >
                {m.content ||
                  (m.streaming ? (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
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
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/5 text-muted-foreground"
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

      <div className="p-3 border-t border-border/40 glass-panel">
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
            className="text-sm rounded-xl border-border/60 bg-white/80"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={isStreaming || !input.trim()}
            className="shrink-0 rounded-xl bg-gradient-to-br from-[hsl(160_55%_42%)] to-[hsl(160_55%_36%)] hover:from-[hsl(160_55%_38%)] hover:to-[hsl(160_55%_32%)] shadow-card"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
