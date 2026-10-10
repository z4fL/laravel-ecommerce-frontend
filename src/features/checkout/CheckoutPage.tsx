import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { LuArrowLeft, LuArrowUpRight, LuX } from 'react-icons/lu'
import { ApiError } from '../../api'
import { storefrontContainerClass } from '../../components/storefront/storefrontStyles'
import { formatPrice } from '../../components/storefront/StorefrontProductTile'
import { getGetMyCartQueryKey, useGetMyCart } from '../../generated/cart/cart'
import { usePreviewCheckout } from '../../generated/checkout/checkout'
import { useCreateOrder } from '../../generated/orders/orders'
import { useCreatePayment } from '../../generated/payments/payments'
import { useListShippingAddresses } from '../../generated/shipping-addresses/shipping-addresses'
import type { CartItem, Order, Payment, ShippingAddress } from '../../generated/models'

function getErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.'
}

function LoadingCheckout() {
  return (
    <main className={`${storefrontContainerClass} max-w-5xl pb-20 pt-9 md:pb-28 md:pt-12`} role="status" aria-label="Loading checkout">
      <h1 className="m-0 text-[30px] font-[560] leading-tight">Checkout</h1>
      <div className="mt-7 grid gap-5" aria-hidden="true">
        <div className="h-24 bg-skeleton" />
        <div className="h-24 bg-skeleton" />
        <div className="h-36 bg-skeleton" />
      </div>
    </main>
  )
}

function CheckoutLoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const needsLogin = getErrorStatus(error) === 401

  return (
    <main className={`${storefrontContainerClass} flex min-h-[52vh] flex-col items-start justify-center pb-20 pt-12`}>
      <h1 className="m-0 text-[30px] font-[560] leading-tight">{needsLogin ? 'Sign in to check out' : 'Checkout could not load'}</h1>
      <p className="mb-5 mt-3 max-w-[65ch] text-muted">
        {needsLogin ? 'Your cart is tied to your account. Sign in to continue.' : errorMessage(error)}
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {needsLogin ? (
          <Link className="inline-flex min-h-10 items-center font-semibold text-ink underline-offset-4 hover:underline" to="/login">Sign in</Link>
        ) : (
          <button className="inline-flex min-h-10 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline" type="button" onClick={onRetry}>Try again</button>
        )}
        <Link className="inline-flex min-h-10 items-center font-semibold text-ink underline-offset-4 hover:underline" to="/cart">Back to cart</Link>
      </div>
    </main>
  )
}

function EmptyCheckout() {
  return (
    <main className={`${storefrontContainerClass} flex min-h-[52vh] flex-col items-start justify-center pb-20 pt-12`}>
      <h1 className="m-0 text-[30px] font-[560] leading-tight">Your cart is empty</h1>
      <p className="mb-5 mt-3 max-w-[55ch] text-muted">Add something to your cart before checking out.</p>
      <Link className="inline-flex min-h-11 items-center bg-charcoal px-4 font-semibold text-spectral-citron no-underline hover:bg-charcoal-hover" to="/products">Browse products</Link>
    </main>
  )
}

function EmptySelection() {
  return (
    <main className={`${storefrontContainerClass} flex min-h-[52vh] flex-col items-start justify-center pb-20 pt-12`}>
      <h1 className="m-0 text-[30px] font-[560] leading-tight">No items selected</h1>
      <p className="mb-5 mt-3 max-w-[55ch] text-muted">Return to your cart and select at least one item to check out.</p>
      <Link className="inline-flex min-h-11 items-center bg-charcoal px-4 font-semibold text-spectral-citron no-underline hover:bg-charcoal-hover" to="/cart?selected=">Back to cart</Link>
    </main>
  )
}

function AddressDetails({ address }: { address: ShippingAddress }) {
  return (
    <span className="block min-w-0">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-semibold">
        <span>{address.label ?? address.recipient_name}</span>
        {address.is_default && <span className="text-[11px] font-medium text-muted">Default</span>}
      </span>
      <span className="mt-1 block text-[13px] leading-[1.45] text-muted">
        {address.recipient_name} · {address.phone}<br />
        {address.address}, {address.district}<br />
        {address.city}, {address.province} {address.postal_code}
      </span>
    </span>
  )
}

type DisplayItem = {
  id: number
  name: string
  sku?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

function cartDisplayItem(item: CartItem): DisplayItem {
  return {
    id: item.id,
    name: item.product?.name ?? 'Unavailable product',
    quantity: item.quantity,
    unitPrice: item.price_snapshot,
    subtotal: item.price_snapshot * item.quantity,
  }
}

function orderDisplayItem(item: NonNullable<Order['items']>[number]): DisplayItem {
  return {
    id: item.id,
    name: item.product_name,
    sku: item.product_sku,
    quantity: item.quantity,
    unitPrice: item.price,
    subtotal: item.subtotal,
  }
}

function ItemRows({ items }: { items: DisplayItem[] }) {
  return (
    <ul className="m-0 list-none border-y border-rule p-0" aria-label="Order items">
      {items.map((item) => (
        <li className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 border-b border-rule py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_100px_120px_140px] sm:items-center" key={item.id}>
          <div className="min-w-0">
            <p className="m-0 wrap-break-word text-[15px] font-semibold">{item.name}</p>
            {item.sku && <p className="mb-0 mt-1 text-[12px] text-muted">{item.sku}</p>}
          </div>
          <div className="col-span-2 flex justify-between gap-4 text-[13px] sm:col-span-1 sm:block sm:text-right">
            <span className="text-muted sm:hidden">Quantity</span>
            <span className="font-medium tabular-nums">{item.quantity}</span>
          </div>
          <div className="col-span-2 flex justify-between gap-4 text-[13px] sm:col-span-1 sm:block sm:text-right">
            <span className="text-muted sm:hidden">Unit price</span>
            <span className="tabular-nums">{formatPrice(item.unitPrice)}</span>
          </div>
          <div className="col-span-2 flex justify-between gap-4 text-[14px] font-semibold sm:col-span-1 sm:block sm:text-right">
            <span className="text-muted sm:hidden">Line subtotal</span>
            <span className="tabular-nums">{formatPrice(item.subtotal)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const cartQuery = useGetMyCart({ query: { retry: false, staleTime: 30_000 } })
  const cart = cartQuery.data?.status === 200 ? cartQuery.data.data.data : undefined
  const cartItems = cart?.items ?? []
  const requestedIds = searchParams.get('items')
  const requestedIdSet = requestedIds === null
    ? undefined
    : new Set(requestedIds.split(',').map(Number).filter(Number.isSafeInteger))
  const selectedCartItems = requestedIdSet
    ? cartItems.filter((item) => requestedIdSet.has(item.id))
    : cartItems
  const addressesQuery = useListShippingAddresses({
    query: { enabled: selectedCartItems.length > 0, retry: false, staleTime: 60_000 },
  })
  const previewMutation = usePreviewCheckout()
  const orderMutation = useCreateOrder()
  const paymentMutation = useCreatePayment()
  const [selectedAddressId, setSelectedAddressId] = useState<number>()
  const [previewAddressId, setPreviewAddressId] = useState<number>()
  const [acknowledgedMissingTotal, setAcknowledgedMissingTotal] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order>()
  const [payment, setPayment] = useState<Payment>()
  const [flowError, setFlowError] = useState<string>()
  const paymentDialogRef = useRef<HTMLDialogElement>(null)

  const addresses = addressesQuery.data?.status === 200 ? addressesQuery.data.data.data ?? [] : []
  const activeAddress = addresses.find((address) => address.id === selectedAddressId)
  const checkoutPreview = previewMutation.data?.status === 200
    && previewAddressId === selectedAddressId
    ? previewMutation.data.data.data
    : undefined

  useEffect(() => {
    if (selectedAddressId !== undefined || addresses.length === 0) return
    const initialAddress = addresses.find((address) => address.is_default) ?? addresses[0]
    setSelectedAddressId(initialAddress.id)
    setPreviewAddressId(undefined)
    previewMutation.mutate(
      { data: { shipping_address_id: initialAddress.id } },
      { onSuccess: (response) => {
        if (response.status === 200) setPreviewAddressId(initialAddress.id)
      } },
    )
  }, [addresses, previewMutation.mutate, selectedAddressId])

  const cartSubtotal = selectedCartItems.reduce((total, item) => total + item.price_snapshot * item.quantity, 0)
  const invalidCart = selectedCartItems.some((item) => !item.product)
  const orderedItems = createdOrder?.items?.map(orderDisplayItem)
  const displayItems = orderedItems?.length ? orderedItems : selectedCartItems.map(cartDisplayItem)
  const unitCount = displayItems.reduce((count, item) => count + item.quantity, 0)
  const subtotal = createdOrder?.subtotal ?? cartSubtotal
  const isSubmitting = orderMutation.isPending || paymentMutation.isPending
  const canPlaceOrder = Boolean(
    selectedAddressId
    && activeAddress
    && checkoutPreview
    && (createdOrder || selectedCartItems.length > 0)
    && !invalidCart
    && acknowledgedMissingTotal
    && !isSubmitting
    && !payment,
  )

  useEffect(() => {
    const dialog = paymentDialogRef.current
    if (payment && dialog && !dialog.open) dialog.showModal()
  }, [payment])

  function openOrderDetails() {
    if (createdOrder) navigate(`/orders/${createdOrder.id}`)
  }

  function selectAddress(addressId: number) {
    setSelectedAddressId(addressId)
    setPreviewAddressId(undefined)
    setAcknowledgedMissingTotal(false)
    setFlowError(undefined)
    previewMutation.mutate(
      { data: { shipping_address_id: addressId } },
      { onSuccess: (response) => {
        if (response.status === 200) setPreviewAddressId(addressId)
      } },
    )
  }

  function retryPreview() {
    if (!selectedAddressId) return
    setPreviewAddressId(undefined)
    previewMutation.mutate(
      { data: { shipping_address_id: selectedAddressId } },
      { onSuccess: (response) => {
        if (response.status === 200) setPreviewAddressId(selectedAddressId)
      } },
    )
  }

  async function placeOrder() {
    if (!canPlaceOrder) return
    setFlowError(undefined)

    try {
      let order = createdOrder
      if (!order) {
        const orderResponse = await orderMutation.mutateAsync({
          data: {
            shipping_address_id: selectedAddressId!,
            cart_item_ids: selectedCartItems.map((item) => item.id),
          },
        })
        if (orderResponse.status !== 201) {
          setFlowError('The order could not be created. Review your cart and try again.')
          return
        }
        order = orderResponse.data.data
        setCreatedOrder(order)
        void queryClient.invalidateQueries({ queryKey: getGetMyCartQueryKey() })
      }

      const paymentResponse = await paymentMutation.mutateAsync({ order: order.id })
      if (paymentResponse.status === 201) setPayment(paymentResponse.data.data)
    } catch {
      // The generated mutations expose their errors for the inline recovery state.
    }
  }

  if (cartQuery.isLoading) return <LoadingCheckout />
  if (cartQuery.isError && !createdOrder) {
    return <CheckoutLoadError error={cartQuery.error} onRetry={() => void cartQuery.refetch()} />
  }
  if ((!cart || cart.items.length === 0) && !createdOrder) return <EmptyCheckout />
  if (selectedCartItems.length === 0 && !createdOrder) return <EmptySelection />

  const previewError = previewMutation.error
  const addressError = addressesQuery.error
  const orderError = orderMutation.error ?? paymentMutation.error

  return (
    <main className={`${storefrontContainerClass} pb-20 pt-9 md:pb-28 md:pt-12`}>
      <Link className="mb-5 inline-flex min-h-10 items-center gap-2 text-[13px] font-semibold text-ink underline-offset-4 hover:underline" to={`/cart?selected=${selectedCartItems.map((item) => item.id).join(',')}`}>
        <LuArrowLeft aria-hidden="true" className="size-4" />
        Back to cart
      </Link>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-7">
        <div>
          <h1 className="m-0 text-[30px] font-[560] leading-[1.1]">Check the basket before delivery</h1>
          <p className="mb-0 mt-2 max-w-[70ch] text-[13px] text-muted">Selected items and subtotal are shown from your cart. Shipping cost and order total are not included before you place the order.</p>
        </div>
        <p className="m-0 text-[12px] text-muted"><strong className="text-ink">Items</strong> &nbsp; / &nbsp; Delivery &nbsp; / &nbsp; Payment</p>
      </header>

      {invalidCart && !createdOrder && (
        <p className="mb-5 mt-0 text-[13px] text-red-800" role="alert">
          One or more cart items are unavailable. <Link className="font-semibold text-ink underline" to="/cart">Return to your cart</Link> to remove them.
        </p>
      )}

      <section aria-labelledby="checkout-items-title">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 text-[18px] font-[560] leading-tight" id="checkout-items-title">Your items</h2>
          <p className="m-0 text-[12px] text-muted">{displayItems.length} {displayItems.length === 1 ? 'product' : 'products'} · {unitCount} {unitCount === 1 ? 'unit' : 'units'}</p>
        </div>
        {displayItems.length > 0 ? (
          <ItemRows items={displayItems} />
        ) : (
          <p className="m-0 border-y border-rule py-5 text-[14px] text-muted">No order items are available.</p>
        )}
      </section>

      <section className="mt-5 border-b border-rule pb-5" aria-label="Price breakdown" aria-busy={previewMutation.isPending}>
        <dl className="m-0 grid gap-4 sm:grid-cols-3 sm:gap-0">
          <div className="sm:pr-5">
            <dt className="text-[12px] font-semibold text-muted">Subtotal</dt>
            <dd className="m-0 mt-1 text-[18px] font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
            <p className="mb-0 mt-1 text-[11px] text-muted">{createdOrder ? 'Confirmed by the order response' : 'From selected cart price snapshots'}</p>
          </div>
          <div className="border-t border-rule pt-3 sm:border-l sm:border-t-0 sm:px-5 sm:pt-0">
            <dt className="text-[12px] font-semibold text-muted">Shipping cost</dt>
            <dd className="m-0 mt-1 text-[16px] font-semibold">Not provided</dd>
            <p className="mb-0 mt-1 text-[11px] text-muted">Not included in checkout preview</p>
          </div>
          <div className="border-t border-rule pt-3 sm:border-l sm:border-t-0 sm:px-5 sm:pt-0">
            <dt className="text-[12px] font-semibold text-muted">Order total</dt>
            <dd className="m-0 mt-1 text-[16px] font-semibold tabular-nums">
              {createdOrder ? formatPrice(createdOrder.total) : 'Not available before order'}
            </dd>
            <p className="mb-0 mt-1 text-[11px] text-muted">
              {createdOrder ? 'Returned by the order response' : 'The preview returns subtotal only'}
            </p>
          </div>
        </dl>
        {previewMutation.isPending && <p className="mb-0 mt-3 text-[12px] text-muted" role="status">Updating order preview…</p>}
        {previewError && !previewMutation.isPending && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-red-800" role="alert">
            <span>{errorMessage(previewError)}</span>
            {getErrorStatus(previewError) === 401 ? (
              <Link className="font-semibold text-ink underline" to="/login">Sign in again</Link>
            ) : (
              <button className="min-h-9 border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline" type="button" onClick={retryPreview}>Retry preview</button>
            )}
          </div>
        )}
      </section>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="checkout-address-title">
          <h2 className="m-0 text-[18px] font-[560] leading-tight" id="checkout-address-title">Delivery address</h2>
          {addressesQuery.isLoading ? (
            <p className="mb-0 mt-3 text-[13px] text-muted" role="status">Loading saved addresses…</p>
          ) : addressError ? (
            <div className="mt-3 text-[13px] text-red-800" role="alert">
              <p className="m-0">{errorMessage(addressError)}</p>
              {getErrorStatus(addressError) === 401 ? (
                <Link className="mt-1 inline-flex min-h-9 items-center font-semibold text-ink underline" to="/login">Sign in again</Link>
              ) : (
                <button className="mt-1 inline-flex min-h-9 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline" type="button" onClick={() => void addressesQuery.refetch()}>Try again</button>
              )}
            </div>
          ) : addresses.length === 0 ? (
            <p className="mb-0 mt-3 max-w-[55ch] text-[13px] text-muted">No saved delivery addresses are available. Add an address to your account before checking out.</p>
          ) : (
            <fieldset className="m-0 mt-3 grid gap-0 border-0 border-y border-rule p-0" aria-describedby="address-hint">
              <legend className="sr-only">Choose a delivery address</legend>
              <p className="mb-2 mt-3 text-[12px] text-muted" id="address-hint">Choose where this order should be sent.</p>
              {addresses.map((address) => (
                <label className={`grid min-h-16 cursor-pointer grid-cols-[20px_minmax(0,1fr)] items-start gap-3 border-t border-rule py-3 ${selectedAddressId === address.id ? 'bg-paper' : ''}`} key={address.id}>
                  <input
                    className="mt-1 size-4 accent-marker-olive"
                    type="radio"
                    name="shipping-address"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => selectAddress(address.id)}
                  />
                  <AddressDetails address={address} />
                </label>
              ))}
            </fieldset>
          )}
        </section>

        <section aria-labelledby="checkout-payment-title">
          <h2 className="m-0 text-[18px] font-[560] leading-tight" id="checkout-payment-title">Payment method</h2>
          <p className="mb-0 mt-2 text-[12px] text-muted">Pay through Midtrans after your order is created.</p>
          <label className="mt-3 grid min-h-16 cursor-default grid-cols-[20px_minmax(0,1fr)] items-start gap-3 border border-rule-strong bg-paper p-3">
            <input className="mt-1 size-4 accent-marker-olive" type="radio" name="payment-method" checked readOnly />
            <span>
              <span className="block text-[14px] font-semibold">Midtrans <span className="font-normal text-muted">(Sandbox)</span></span>
              <span className="mt-1 block text-[12px] text-muted">You’ll open Midtrans to complete this test payment.</span>
            </span>
          </label>

          {!createdOrder && (
            <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 text-[12px] leading-[1.45] text-ink-soft">
              <input
                className="mt-0.5 size-4 shrink-0 accent-marker-olive"
                type="checkbox"
                checked={acknowledgedMissingTotal}
                onChange={(event) => setAcknowledgedMissingTotal(event.currentTarget.checked)}
              />
              <span>I understand the shipping cost and order total are not shown before I place this order.</span>
            </label>
          )}

          {orderError && (
            <div className="mt-3 text-[13px] text-red-800" role="alert">
              <p className="m-0">{errorMessage(orderError)}</p>
              {getErrorStatus(orderError) === 401 && <Link className="mt-1 inline-flex min-h-9 items-center font-semibold text-ink underline" to="/login">Sign in again</Link>}
            </div>
          )}
          {flowError && <p className="mb-0 mt-3 text-[13px] text-red-800" role="alert">{flowError}</p>}

          <button
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center border-0 bg-charcoal px-5 font-semibold text-spectral-citron hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-55"
            type="button"
            disabled={!canPlaceOrder}
            onClick={() => void placeOrder()}
            aria-busy={isSubmitting}
          >
            {orderMutation.isPending ? 'Creating order…'
              : paymentMutation.isPending ? 'Preparing payment…'
                : payment ? 'Payment ready'
                  : createdOrder ? 'Retry payment setup'
                    : 'Place order'}
          </button>

          {createdOrder && (
            <p className="mb-0 mt-3 text-[13px] text-marker-olive" role="status">
              Order {createdOrder.order_number} created. Total: {formatPrice(createdOrder.total)}.
            </p>
          )}
          {payment?.payment_url ? (
            <p className="mb-0 mt-2 text-[13px] text-muted" role="status">Midtrans payment is ready. Use the link above to continue.</p>
          ) : payment ? (
            <p className="mb-0 mt-2 text-[13px] text-muted" role="status">The payment response did not include a redirect URL.</p>
          ) : null}
        </section>
      </div>

      <dialog
        ref={paymentDialogRef}
        className="m-auto w-[calc(100%-32px)] max-w-lg border border-rule bg-paper p-0 text-ink backdrop:bg-charcoal/60"
        aria-labelledby="payment-ready-title"
        onClose={openOrderDetails}
        onClick={(event) => {
          if (event.target === event.currentTarget) paymentDialogRef.current?.close()
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-end">
            <button
              className="grid size-10 place-items-center border-0 bg-transparent text-ink hover:bg-bone focus-visible:outline-2 focus-visible:outline-marker-olive"
              type="button"
              aria-label="Close payment dialog and view order"
              onClick={() => paymentDialogRef.current?.close()}
            >
              <LuX aria-hidden="true" className="size-5" />
            </button>
          </div>
          <h2 className="mb-0 mt-1 text-[24px] font-[560] leading-[1.2]" id="payment-ready-title">Your order is ready for payment</h2>
          <p className="mb-0 mt-3 text-[14px] leading-normal text-muted">
            {createdOrder && <>Order {createdOrder.order_number} · {formatPrice(createdOrder.total)}<br /></>}
            Complete payment on the Midtrans Sandbox page to confirm your order.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {payment?.payment_url ? (
              <a
                className="inline-flex min-h-12 items-center gap-2 bg-charcoal px-5 font-semibold text-spectral-citron no-underline hover:bg-charcoal-hover focus-visible:outline-2 focus-visible:outline-marker-olive"
                href={payment.payment_url}
                target="_blank"
                rel="noreferrer"
              >
                Pay with Midtrans <LuArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            ) : (
              <p className="mb-0 text-[13px] text-muted" role="status">A payment link isn’t available. You can still view your order.</p>
            )}
            <button
              className="inline-flex min-h-11 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline"
              type="button"
              onClick={openOrderDetails}
            >
              View order details
            </button>
          </div>
        </div>
      </dialog>
    </main>
  )
}
