import { useRef, useEffect } from 'react'
import { LuBot, LuUser, LuX, LuRotateCcw } from 'react-icons/lu'
import { hasAccessToken } from '../../../api'
import { DEFAULT_SUGGESTIONS } from '../suggestions'
import { useAssistantService } from '../useAssistantService'
import { WelcomeView } from './WelcomeView'
import { Composer } from './Composer'
import { OrderReceiptCard } from './OrderReceiptCard'
import { ShippingAddressCard } from './ShippingAddressCard'
import { CapabilitiesCard } from './CapabilitiesCard'
import { ErrorStateView } from './ErrorStateView'
import type { SuggestedQuestion } from '../types'
import type { Order, ShippingAddress } from '../../../generated/models'

interface AssistantPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  const { messages, isLoading, handleInquiry, inspectOrder, clearMessages } = useAssistantService()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isAuth = hasAccessToken()

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isOpen])

  if (!isOpen) return null

  return (
    <section
      aria-label="Customer service assistant panel"
      className="fixed inset-x-0 bottom-0 top-auto z-50 flex h-[85dvh] max-h-[640px] flex-col border border-charcoal bg-bone text-ink sm:bottom-20 sm:left-auto sm:right-6 sm:h-[580px] sm:w-[400px] sm:max-h-none"
    >
      {/* ── Panel Header ── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-rule bg-charcoal px-4 text-paper">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center bg-paper text-charcoal">
            <LuBot className="size-3.5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold tracking-wide text-paper">
              The Shop Assistant
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-paper/70">
              <span
                className="inline-block size-1.5 bg-spectral-citron"
                aria-hidden="true"
              />
              <span className="uppercase tracking-wider">Active Concierge</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="flex size-8 cursor-pointer items-center justify-center text-paper/80 hover:text-paper hover:bg-charcoal-hover"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <LuRotateCcw className="size-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center text-paper/80 hover:text-paper hover:bg-charcoal-hover"
            title="Close assistant"
            aria-label="Close assistant"
          >
            <LuX className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── Message Area / Stream ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <WelcomeView
            suggestions={DEFAULT_SUGGESTIONS}
            onSelectSuggestion={(s: SuggestedQuestion) => void handleInquiry(s.query)}
            isAuthenticated={isAuth}
          />
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex size-6 shrink-0 items-center justify-center bg-charcoal text-spectral-citron mt-0.5">
                    <LuBot className="size-3.5" aria-hidden="true" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] text-left ${
                    msg.role === 'user'
                      ? 'border border-charcoal bg-charcoal p-2.5 text-paper text-[13px]'
                      : 'space-y-2'
                  }`}
                >
                  {msg.content && (
                    <p
                      className={`m-0 text-[13px] leading-relaxed ${
                        msg.role === 'user' ? 'text-paper' : 'text-ink font-medium'
                      }`}
                    >
                      {msg.content}
                    </p>
                  )}

                  {msg.type === 'order-list' && msg.data?.orders && (
                    <div className="space-y-2.5 pt-1">
                      {msg.data.orders.map((order: Order) => (
                        <OrderReceiptCard
                          key={order.id}
                          order={order}
                          onSelectOrder={inspectOrder}
                        />
                      ))}
                    </div>
                  )}

                  {msg.type === 'order-detail' && msg.data?.order && (
                    <div className="pt-1">
                      <OrderReceiptCard
                        order={msg.data.order}
                        showFullDetails={true}
                      />
                    </div>
                  )}

                  {msg.type === 'shipping-addresses' && msg.data?.addresses && (
                    <div className="space-y-2 pt-1">
                      {msg.data.addresses.map((address: ShippingAddress) => (
                        <ShippingAddressCard key={address.id} address={address} />
                      ))}
                    </div>
                  )}

                  {msg.type === 'capabilities' && (
                    <div className="pt-1">
                      <CapabilitiesCard />
                    </div>
                  )}

                  {msg.type === 'error' && (
                    <div className="pt-1">
                      <ErrorStateView
                        message={msg.content || 'An unexpected error occurred.'}
                        onRetry={msg.data?.retryAction}
                      />
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex size-6 shrink-0 items-center justify-center bg-bone border border-charcoal text-charcoal mt-0.5">
                    <LuUser className="size-3.5" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-left" role="status">
                <div className="flex size-6 shrink-0 items-center justify-center bg-charcoal text-spectral-citron">
                  <LuBot className="size-3.5" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-1.5 border border-rule bg-paper px-3 py-2 text-[12px] text-muted">
                  <span className="size-1.5 bg-charcoal animate-pulse" />
                  <span className="size-1.5 bg-charcoal animate-pulse delay-75" />
                  <span className="size-1.5 bg-charcoal animate-pulse delay-150" />
                  <span className="ml-1 text-[11px] uppercase tracking-wider">
                    Querying store contract...
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Questions Quick Bar ── */}
      {messages.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-rule bg-bone px-3 py-1.5 text-[11px]">
          <span className="shrink-0 font-semibold uppercase tracking-wider text-muted text-[10px]">
            Suggestions:
          </span>
          {DEFAULT_SUGGESTIONS.map((item: SuggestedQuestion) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void handleInquiry(item.query)}
              className="shrink-0 cursor-pointer border border-rule bg-paper px-2 py-0.5 text-ink hover:border-charcoal hover:bg-bone transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Composer ── */}
      <Composer onSend={(msg: string) => void handleInquiry(msg)} disabled={isLoading} />
    </section>
  )
}
