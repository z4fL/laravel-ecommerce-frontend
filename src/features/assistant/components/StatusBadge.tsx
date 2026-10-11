import type { OrderStatus } from '../../../generated/models'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../orderStatusHelpers'

interface StatusBadgeProps {
  status: OrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = ORDER_STATUS_LABELS[status] || status
  const style = ORDER_STATUS_STYLES[status] || {
    bg: 'bg-bone',
    text: 'text-ink',
    border: 'border-rule',
  }

  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase ${style.bg} ${style.text} ${style.border}`}
    >
      {label}
    </span>
  )
}
