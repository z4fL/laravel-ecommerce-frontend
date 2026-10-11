import { LuReceipt, LuExternalLink } from 'react-icons/lu'
import { Link } from 'react-router'
import type { Order } from '../../../generated/models'
import { formatPrice } from '../../../components/storefront/StorefrontProductTile'
import { StatusBadge } from './StatusBadge'
import { formatAssistantDate } from '../orderStatusHelpers'

interface OrderReceiptCardProps {
  order: Order
  onSelectOrder?: (orderId: number) => void
  showFullDetails?: boolean
}

export function OrderReceiptCard({
  order,
  onSelectOrder,
  showFullDetails = false,
}: OrderReceiptCardProps) {
  const items = order.items ?? []

  return (
    <article className="border border-rule bg-paper p-3.5 text-left text-ink">
      <div className="flex items-start justify-between gap-2 border-b border-rule pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <LuReceipt className="size-3.5 text-ink" aria-hidden="true" />
            <span>Order Receipt</span>
          </div>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink">
            {order.order_number}
          </p>
          <p className="text-[11px] tabular-nums text-muted">
            {formatAssistantDate(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {showFullDetails && items.length > 0 && (
        <div className="py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Line Items ({items.length})
          </p>
          <ul className="mt-1.5 divide-y divide-rule border-y border-rule p-0 text-[12px]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-1.5">
                <div className="min-w-0 pr-2">
                  <p className="truncate font-medium text-ink">{item.product_name}</p>
                  <p className="text-[11px] tabular-nums text-muted">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="shrink-0 font-semibold tabular-nums text-ink">
                  {formatPrice(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-rule pt-2 text-[13px]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Total Amount
        </span>
        <span className="text-[15px] font-bold tabular-nums text-ink">
          {formatPrice(order.total)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pt-1 border-t border-rule/50">
        {!showFullDetails && onSelectOrder ? (
          <button
            type="button"
            onClick={() => onSelectOrder(order.id)}
            className="cursor-pointer border border-charcoal bg-transparent px-2.5 py-1 text-[11px] font-semibold text-charcoal hover:bg-bone transition-colors"
          >
            Inspect items
          </button>
        ) : (
          <span className="text-[11px] text-muted">Read-only view</span>
        )}

        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-charcoal underline underline-offset-4 hover:text-ink-soft"
        >
          <span>Store receipt</span>
          <LuExternalLink className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
