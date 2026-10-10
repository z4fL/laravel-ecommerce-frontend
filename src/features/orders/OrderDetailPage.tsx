import { Link, useParams } from 'react-router'
import { storefrontContainerClass } from '../../components/storefront/storefrontStyles'
import { formatPrice } from '../../components/storefront/StorefrontProductTile'
import { useGetMyOrder } from '../../generated/orders/orders'
import type { OrderStatus } from '../../generated/models'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Needs payment',
  payment_failed: 'Payment failed',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function formatOrderDateShort(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatOrderDateLong(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

export function OrderDetailPage() {
  const { orderId } = useParams()
  const parsedOrderId = Number(orderId)
  const orderQuery = useGetMyOrder(parsedOrderId, {
    query: { enabled: Number.isInteger(parsedOrderId) && parsedOrderId > 0, retry: false },
  })
  const order = orderQuery.data?.status === 200 ? orderQuery.data.data.data : undefined

  if (!Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
    return <OrderMessage title="Order not found" detail="This order link is incomplete." />
  }

  if (orderQuery.isLoading) {
    return (
      <main
        className={`${storefrontContainerClass} pb-20 pt-9 md:pb-28 md:pt-12`}
        role="status"
        aria-label="Loading order"
      >
        <div className="mx-auto max-w-[600px]">
          <div className="h-3 w-24 bg-skeleton" />
          <div className="mt-3 h-5 w-44 bg-skeleton" />
          <div className="mt-8 h-px bg-rule" aria-hidden="true" />
          <div className="mt-4 grid gap-3" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between gap-8">
                <div className="h-3 grow bg-skeleton" />
                <div className="h-3 w-16 shrink-0 bg-skeleton" />
              </div>
            ))}
          </div>
          <div className="mt-6 h-px bg-rule" aria-hidden="true" />
        </div>
      </main>
    )
  }

  if (orderQuery.isError || !order) {
    return (
      <OrderMessage
        title="Order could not load"
        detail="Check your connection, then try again."
        onRetry={() => void orderQuery.refetch()}
      />
    )
  }

  const items = order.items ?? []
  const statusLabel = STATUS_LABELS[order.status]
  const dateShort = formatOrderDateShort(order.created_at)
  const dateLong = formatOrderDateLong(order.created_at)

  return (
    <main className={`${storefrontContainerClass} pb-20 pt-9 md:pb-28 md:pt-12`}>
      <article
        className="mx-auto max-w-[600px]"
        aria-label={`Order receipt ${order.order_number}`}
      >
        {/* ── Receipt cap ── */}
        <header className="border-b-2 border-charcoal pb-6">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            The Shop
          </p>
          <h1 className="mt-2 text-[22px] font-[560] leading-tight md:text-[26px]">
            Order Receipt
          </h1>
        </header>

        {/* ── Order metadata ── */}
        <section className="border-b border-rule py-5" aria-label="Order information">
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-[13px]">
            <dt className="text-muted">Order number</dt>
            <dd className="m-0 font-semibold tabular-nums">{order.order_number}</dd>

            <dt className="text-muted">Date</dt>
            <dd className="m-0 tabular-nums" title={dateLong}>{dateShort}</dd>

            <dt className="text-muted">Status</dt>
            <dd className="m-0 font-semibold">{statusLabel}</dd>
          </dl>
        </section>

        {/* ── Itemized line items ── */}
        <section className="border-b border-rule py-5" aria-labelledby="order-items-heading">
          <h2
            className="mb-4 mt-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted"
            id="order-items-heading"
          >
            Items purchased
          </h2>

          {/* Column headers */}
          <div
            className="mb-2 grid grid-cols-[minmax(0,1fr)_4.5rem_5.5rem] gap-x-4 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted"
            aria-hidden="true"
          >
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Amount</span>
          </div>

          <ul className="m-0 list-none p-0" aria-label="Order items">
            {items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_4.5rem_5.5rem] gap-x-4 border-t border-rule py-3"
              >
                <div className="min-w-0">
                  <p className="m-0 text-[14px] font-[520] leading-snug">{item.product_name}</p>
                  <p className="mb-0 mt-[2px] text-[11px] text-muted">SKU {item.product_sku}</p>
                  <p className="mb-0 mt-[2px] text-[11px] tabular-nums text-muted">
                    {formatPrice(item.price)} each
                  </p>
                </div>
                <p className="m-0 self-start text-right text-[14px] tabular-nums">
                  {item.quantity}
                </p>
                <p className="m-0 self-start text-right text-[14px] font-semibold tabular-nums">
                  {formatPrice(item.subtotal)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Cost breakdown ── */}
        <section className="border-b-2 border-charcoal py-5" aria-label="Cost breakdown">
          <dl className="m-0 text-[14px]">
            <div className="flex items-baseline justify-between gap-4 py-1">
              <dt className="text-muted">Subtotal</dt>
              <dd className="m-0 tabular-nums">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-rule pt-3">
              <dt className="text-[16px] font-semibold">Total charged</dt>
              <dd className="m-0 text-[20px] font-semibold tabular-nums">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </section>

        {/* ── Receipt footer ── */}
        <footer className="pt-7 text-[12px] text-muted">
          <p className="m-0">
            Questions about this order? Contact support with your order number.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              className="inline-flex min-h-10 items-center bg-charcoal px-4 text-[13px] font-semibold text-spectral-citron no-underline hover:bg-charcoal-hover"
              to="/orders"
            >
              All orders
            </Link>
            <Link
              className="inline-flex min-h-10 items-center text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
              to="/products"
            >
              Continue browsing
            </Link>
          </div>
        </footer>
      </article>
    </main>
  )
}

function OrderMessage({
  title,
  detail,
  onRetry,
}: {
  title: string
  detail: string
  onRetry?: () => void
}) {
  return (
    <main
      className={`${storefrontContainerClass} flex min-h-[52vh] flex-col items-start justify-center pb-20 pt-12`}
    >
      <h1 className="m-0 text-[28px] font-[560] leading-tight">{title}</h1>
      <p className="mb-5 mt-3 max-w-[60ch] text-muted">{detail}</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {onRetry && (
          <button
            className="inline-flex min-h-10 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline"
            type="button"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
        <Link
          className="inline-flex min-h-10 items-center font-semibold text-ink underline-offset-4 hover:underline"
          to="/products"
        >
          Continue browsing
        </Link>
      </div>
    </main>
  )
}
