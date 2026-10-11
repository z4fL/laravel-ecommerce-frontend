import { LuBot } from 'react-icons/lu'

interface AssistantTriggerProps {
  onClick: () => void
  isOpen: boolean
}

export function AssistantTrigger({ onClick, isOpen }: AssistantTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close Customer Service Assistant' : 'Open Customer Service Assistant'}
      aria-expanded={isOpen}
      className="fixed bottom-5 right-5 z-40 flex size-12 cursor-pointer items-center justify-center border border-charcoal bg-charcoal text-spectral-citron transition-colors hover:bg-charcoal-hover focus:outline-none focus:ring-2 focus:ring-marker-olive focus:ring-offset-2 md:bottom-7 md:right-7 md:size-[52px]"
    >
      <LuBot className="size-6" aria-hidden="true" />
      <span className="sr-only">Customer Service Assistant</span>
    </button>
  )
}
