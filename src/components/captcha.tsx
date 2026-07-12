import { useState, useCallback, useEffect } from 'react'
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CaptchaProps {
  onVerify: (verified: boolean) => void
  className?: string
}

function generateChallenge() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  const operators = ['+', '-']
  const op = operators[Math.floor(Math.random() * operators.length)]
  const answer = op === '+' ? a + b : a - b
  return { a, b, op, answer }
}

export function Captcha({ onVerify, className }: CaptchaProps) {
  const [challenge, setChallenge] = useState(() => generateChallenge())
  const [input, setInput] = useState('')
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(false)

  const refresh = useCallback(() => {
    setChallenge(generateChallenge())
    setInput('')
    setVerified(false)
    setError(false)
    onVerify(false)
  }, [onVerify])

  const handleCheck = useCallback(() => {
    const parsed = parseInt(input, 10)
    if (parsed === challenge.answer) {
      setVerified(true)
      setError(false)
      onVerify(true)
    } else {
      setVerified(false)
      setError(true)
      onVerify(false)
    }
  }, [input, challenge.answer, onVerify])

  useEffect(() => {
    if (error && input) {
      setError(false)
    }
  }, [input, error])

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">Verificação de Segurança</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-2.5 select-none">
          <span className="text-lg font-bold tracking-wider text-foreground/80 line-through decoration-2 decoration-primary/30">
            {challenge.a} {challenge.op} {challenge.b}
          </span>
          <span className="text-lg font-bold text-foreground/80"> = ?</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={refresh}
          className="shrink-0"
          aria-label="Atualizar captcha"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^0-9-]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (input && !verified) handleCheck()
            }
          }}
          placeholder="Digite o resultado"
          disabled={verified}
          className={cn(
            verified && 'border-green-500 text-green-700',
            error && 'border-destructive',
          )}
        />
        {!verified ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleCheck}
            disabled={!input}
            className="shrink-0"
          >
            Verificar
          </Button>
        ) : (
          <div className="flex items-center gap-1 text-green-600 shrink-0 px-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Verificado</span>
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Resposta incorreta. Tente novamente.
        </p>
      )}
    </div>
  )
}
