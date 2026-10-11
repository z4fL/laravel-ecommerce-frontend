import { LuBot } from 'react-icons/lu'
import type { SuggestedQuestion } from '../types'

interface WelcomeViewProps {
  onSelectSuggestion: (suggestion: SuggestedQuestion) => void
  suggestions: SuggestedQuestion[]
  isAuthenticated: boolean
}

export function WelcomeView({
  onSelectSuggestion,
  suggestions,
  isAuthenticated,
}: WelcomeViewProps) {
  return (
    <div className="p-4 text-left">
      <div className="flex items-center gap-2 border-b border-rule pb-3">
        <div className="flex size-7 items-center justify-center bg-charcoal text-spectral-citron">
          <LuBot className="size-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-ink">Customer Service Assistant</h2>
          <p className="text-[11px] text-muted uppercase tracking-wider">
            Automated Storefront Concierge
          </p>
        </div>
      </div>

      <div className="mt-3 text-[13px] leading-relaxed text-ink-soft">
        <p>
          Welcome to The Shop support. I can retrieve verified details regarding your orders,
          check real-time fulfillment and payment status, or review saved delivery addresses.
        </p>
        {!isAuthenticated && (
          <p className="mt-2 border-l-2 border-marker-olive bg-bone/60 p-2 text-[12px] text-ink">
            You are currently browsing as a guest. Sign in to link your session and view
            authenticated orders and personal delivery addresses.
          </p>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Suggested Inquiries
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSuggestion(item)}
              className="flex w-full cursor-pointer items-center justify-between border border-rule bg-paper px-3 py-2 text-left text-[12px] font-medium text-ink transition-colors hover:border-charcoal hover:bg-bone"
            >
              <span>{item.label}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                Select →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
