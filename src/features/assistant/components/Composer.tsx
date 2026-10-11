import { useState, useRef, useEffect } from 'react'
import { LuSend } from 'react-icons/lu'

interface ComposerProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function Composer({
  onSend,
  disabled = false,
  placeholder = 'Ask about an order (e.g. order #1), status, or address...',
}: ComposerProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center border-t border-rule bg-paper p-2"
      aria-label="Ask assistant"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="h-10 grow border border-rule bg-bone px-3 text-[13px] text-ink placeholder:text-muted focus:border-charcoal focus:bg-paper focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="ml-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border-0 bg-charcoal text-spectral-citron transition-colors hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Send inquiry"
      >
        <LuSend className="size-4" aria-hidden="true" />
      </button>
    </form>
  )
}
