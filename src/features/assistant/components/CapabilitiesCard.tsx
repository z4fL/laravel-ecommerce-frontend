import { LuCheck, LuX } from 'react-icons/lu'

export function CapabilitiesCard() {
  const supported = [
    'Check order status (e.g. pending, paid, shipped)',
    'Review line items, item quantities, and order subtotals',
    'Look up orders by ID number',
    'View saved shipping addresses and default destination',
  ]

  const unsupported = [
    'Modifying or redirecting active orders via chat',
    'Processing direct credit card payments inside chat',
    'Creating returns or refund disputes (contact support)',
  ]

  return (
    <article className="border border-rule bg-paper p-3.5 text-left text-ink text-[12px]">
      <p className="font-semibold text-ink text-[13px] border-b border-rule pb-2">
        Customer Service Scope
      </p>

      <div className="mt-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Supported in this MVP
        </p>
        <ul className="mt-1 space-y-1.5 p-0 list-none">
          {supported.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-ink-soft">
              <LuCheck className="size-3.5 shrink-0 text-marker-olive mt-0.5" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 pt-2.5 border-t border-rule">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Out of scope / Read-only
        </p>
        <ul className="mt-1 space-y-1.5 p-0 list-none">
          {unsupported.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-muted">
              <LuX className="size-3.5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
