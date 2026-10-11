import { useState, useEffect } from 'react'
import { AssistantTrigger } from './components/AssistantTrigger'
import { AssistantPanel } from './components/AssistantPanel'

export function CustomerServiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  // Allow closing via Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      <AssistantTrigger isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
      <AssistantPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
