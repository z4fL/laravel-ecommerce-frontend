import { Link, useParams } from 'react-router'
import { storefrontContainerClass } from '../../components/storefront/storefrontStyles'
import { formatPrice } from '../../components/storefront/StorefrontProductTile'
import { useGetMyOrder } from '../../generated/orders/orders'

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
      <main className={`${storefrontContainerClass} pb-20 pt-9 md:pb-28 md:pt-12`} role="status" aria-label="Loading order">
        <h1 className="m-0 text-[30px] font-[560] leading-tight">Loading order…</h1>
        <div className="mt-7 h-32 bg-skeleton" aria-hidden="true" />
      </main>
    )
  }

  if (orderQuery.isError || !order) {
    return <OrderMessage title="Order could not load" detail="Check your connection, then try again." onRetry={() => void orderQuery.refetch()} />
  }

  return (
    <main className={`${storefrontContainerClass} max-w-5xl pb-20 pt-9 md:pb-28 md:pt-12`}>
      <p className="mb-2 mt-0 text-[12px] font-semibold text-marker-olive">Order {order.order_number}</p>
      <h1 className="m-0 text-[30px] font-[560] leading-tight">Order details</h1>
      <p className="mb-0 mt-2 text-[14px] text-muted">Status: {order.status.replaceAll('_', ' ')}</p>

      <section className="mt-7" aria-labelledby="order-items-title">
        <h2 className="mb-3 mt-0 text-[18px] font-[560] leading-tight" id="order-items-title">Items</h2>
        <ul className="m-0 list-none border-y border-rule p-0" aria-label="Order items">
          {(order.items ?? []).map((item) => (
            <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 border-b border-rule py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_100px_140px] sm:items-center" key={item.id}>
              <div className="min-w-0">
                <p className="m-0 wrap-break-word text-[15px] font-semibold">{item.product_name}</p>
                <p className="mb-0 mt-1 text-[12px] text-muted">{item.product_sku}</p>
              </div>
              <div className="flex justify-between gap-4 text-[13px] sm:block sm:text-right">
                <span className="text-muted sm:hidden">Quantity</span>
                <span className="font-medium tabular-nums">{item.quantity}</span>
              </div>
              <div className="col-span-2 flex justify-between gap-4 text-[14px] font-semibold sm:col-span-1 sm:block sm:text-right">
                <span className="text-muted sm:hidden">Line subtotal</span>
                <span className="tabular-nums">{formatPrice(item.subtotal)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <dl className="mt-5 border-b border-rule pb-5">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[13px] font-semibold text-muted">Order total</dt>
          <dd className="m-0 text-[20px] font-semibold tabular-nums">{formatPrice(order.total)}</dd>
        </div>
      </dl>
      <Link className="mt-5 inline-flex min-h-11 items-center bg-charcoal px-5 font-semibold text-spectral-citron no-underline hover:bg-charcoal-hover" to="/products">Continue browsing</Link>
    </main>
  )
}

function OrderMessage({ title, detail, onRetry }: { title: string; detail: string; onRetry?: () => void }) {
  return (
    <main className={`${storefrontContainerClass} flex min-h-[52vh] flex-col items-start justify-center pb-20 pt-12`}>
      <h1 className="m-0 text-[30px] font-[560] leading-tight">{title}</h1>
      <p className="mb-5 mt-3 max-w-[65ch] text-muted">{detail}</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {onRetry && <button className="inline-flex min-h-10 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline" type="button" onClick={onRetry}>Try again</button>}
        <Link className="inline-flex min-h-10 items-center font-semibold text-ink underline-offset-4 hover:underline" to="/products">Continue browsing</Link>
      </div>
    </main>
  )
}
