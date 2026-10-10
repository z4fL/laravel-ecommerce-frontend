import { useState } from 'react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { LuMinus, LuPlus, LuTrash2 } from 'react-icons/lu'
import { ApiError } from '../../api'
import { storefrontContainerClass } from '../../components/storefront/storefrontStyles'
import { formatPrice } from '../../components/storefront/StorefrontProductTile'
import {
  getGetMyCartQueryKey,
  useClearMyCart,
  useDeleteCartItem,
  useGetMyCart,
  useUpdateCartItem,
} from '../../generated/cart/cart'
import { usePreviewCheckout } from '../../generated/checkout/checkout'
import { useListShippingAddresses } from '../../generated/shipping-addresses/shipping-addresses'
import type { CartItem, CheckoutPreview, ShippingAddress } from '../../generated/models'

function getErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.'
}

type CartSummaryProps = {
  itemCount: number
  subtotal: number
  addresses: ShippingAddress[]
  addressesLoading: boolean
  addressesError?: unknown
  selectedAddressId?: number
  onAddressChange: (id: number) => void
  onCheckout: () => void
  checkoutPending: boolean
  checkoutError?: unknown
  checkoutPreview?: CheckoutPreview
  onClear: () => void
  clearPending: boolean
}

function CartSummary({
  itemCount,
  subtotal,
  addresses,
  addressesLoading,
  addressesError,
  selectedAddressId,
  onAddressChange,
  onCheckout,
  checkoutPending,
  checkoutError,
  checkoutPreview,
  onClear,
  clearPending,
}: CartSummaryProps) {
  return (
    <aside className="grid content-start gap-5 border-y border-rule py-5" aria-labelledby="cart-summary-title">
      <h2 className="m-0 text-[20px] font-[560] leading-tight" id="cart-summary-title">Order summary</h2>
      <dl className="m-0 grid gap-3 border-b border-rule pb-4 text-[14px]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Items ({itemCount})</dt>
          <dd className="m-0 font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-[17px] font-semibold">
          <dt>Subtotal</dt>
          <dd className="m-0 tabular-nums">{formatPrice(checkoutPreview?.summary.subtotal ?? subtotal)}</dd>
        </div>
      </dl>

      {addressesLoading ? (
        <p className="m-0 text-[13px] text-muted" role="status">Loading saved addresses...</p>
      ) : addressesError ? (
        <p className="m-0 text-[13px] text-red-800" role="alert">{errorMessage(addressesError)}</p>
      ) : addresses.length > 0 ? (
        <div className="grid gap-1.5">
          <label className="text-[12px] font-semibold" htmlFor="cart-shipping-address">Deliver to</label>
          <select
            className="min-h-11 w-full border border-rule-strong bg-paper px-3 text-[14px] text-ink"
            id="cart-shipping-address"
            value={selectedAddressId ?? ''}
            onChange={(event) => onAddressChange(Number(event.currentTarget.value))}
          >
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.label ?? address.recipient_name} · {address.city}{address.is_default ? ' · Default' : ''}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="m-0 text-[13px] text-muted">Add a saved delivery address before checkout.</p>
      )}

      <button
        className="inline-flex min-h-12 items-center justify-center gap-2 border-0 bg-charcoal px-4 font-semibold text-spectral-citron hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-55"
        type="button"
        disabled={!selectedAddressId || addresses.length === 0 || Boolean(addressesError) || checkoutPending}
        onClick={onCheckout}
        aria-busy={checkoutPending}
      >
        {checkoutPending ? 'Preparing checkout...' : 'Continue to checkout'}
      </button>

      {Boolean(checkoutError) && <p className="m-0 text-[13px] text-red-800" role="alert">{errorMessage(checkoutError)}</p>}
      {checkoutPreview && <p className="m-0 text-[13px] text-marker-olive" role="status">Checkout preview ready for {checkoutPreview.summary.items_count} items.</p>}

      <button
        className="min-h-10 justify-self-start border-0 bg-transparent p-0 text-[13px] font-semibold text-muted underline-offset-4 hover:text-ink hover:underline disabled:opacity-55"
        type="button"
        disabled={clearPending}
        onClick={onClear}
      >
        {clearPending ? 'Removing items...' : 'Remove all items'}
      </button>
    </aside>
  )
}

type CartLayoutProps = {
  items: CartItem[]
  summary: React.ReactNode
  onQuantityChange: (item: CartItem, quantity: number) => void
  onRemove: (item: CartItem) => void
  updatingItemId?: number
  removingItemId?: number
  mutationError?: unknown
}

function QuantityControl({
  item,
  disabled,
  onChange,
}: {
  item: CartItem
  disabled: boolean
  onChange: (quantity: number) => void
}) {
  const name = item.product?.name ?? 'Unavailable product'

  return (
    <div className="inline-flex min-h-10 items-center border border-rule-strong" aria-label={`Quantity for ${name}`}>
      <button
        className="grid size-10 shrink-0 place-items-center border-0 bg-transparent text-ink hover:bg-tile disabled:cursor-not-allowed disabled:opacity-45"
        type="button"
        aria-label={`Decrease ${name} quantity`}
        disabled={disabled || item.quantity <= 1}
        onClick={() => onChange(item.quantity - 1)}
      >
        <LuMinus aria-hidden="true" className="size-4" />
      </button>
      <span className="min-w-8 text-center text-[14px] font-semibold tabular-nums" aria-live="polite">{item.quantity}</span>
      <button
        className="grid size-10 shrink-0 place-items-center border-0 bg-transparent text-ink hover:bg-tile disabled:cursor-not-allowed disabled:opacity-45"
        type="button"
        aria-label={`Increase ${name} quantity`}
        disabled={disabled}
        onClick={() => onChange(item.quantity + 1)}
      >
        <LuPlus aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

function ProductName({ item }: { item: CartItem }) {
  const name = item.product?.name ?? 'Unavailable product'
  const slug = item.product?.slug

  return slug ? (
    <Link className="font-semibold text-ink underline-offset-4 hover:underline" to={`/products/${slug}`}>
      {name}
    </Link>
  ) : (
    <span className="font-semibold text-ink">{name}</span>
  )
}

function CartMutationNotice({ error }: { error?: unknown }) {
  if (!error) return null
  const needsLogin = getErrorStatus(error) === 401

  return (
    <p className="m-0 text-[13px] text-red-800" role="alert">
      {errorMessage(error)}{' '}
      {needsLogin && <Link className="font-semibold text-ink underline" to="/login">Sign in again</Link>}
    </p>
  )
}

function ConversionCart({ items, summary, onQuantityChange, onRemove, updatingItemId, removingItemId, mutationError }: CartLayoutProps) {
  return (
    <main className={`${storefrontContainerClass} pb-20 pt-9 md:pb-28 md:pt-14`}>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-3 md:mb-9">
        <h1 className="m-0 text-[30px] font-[560] leading-[1.1]">Ready when you are</h1>
        <p className="m-0 text-[13px] text-muted">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
      </header>
      <CartMutationNotice error={mutationError} />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,344px)] lg:gap-12">
        <section aria-label="Cart items">
          <ul className="cart-density m-0 grid list-none gap-0 border-y border-rule p-0">
            {items.map((item) => (
              <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 border-b border-rule py-5 last:border-b-0" key={item.id}>
                <div className="min-w-0">
                  <ProductName item={item} />
                  <p className="mb-0 mt-1 text-[12px] text-muted">{formatPrice(item.price_snapshot)} per item</p>
                </div>
                <p className="m-0 text-right text-[15px] font-semibold tabular-nums">{formatPrice(item.price_snapshot * item.quantity)}</p>
                <div className="col-span-2 flex items-center justify-between gap-4">
                  <QuantityControl item={item} disabled={updatingItemId === item.id} onChange={(quantity) => onQuantityChange(item, quantity)} />
                  <button
                    className="inline-flex min-h-10 items-center gap-1.5 border-0 bg-transparent p-0 text-[12px] font-semibold text-muted hover:text-ink"
                    type="button"
                    disabled={removingItemId === item.id}
                    onClick={() => onRemove(item)}
                    aria-label={`Remove ${item.product?.name ?? 'item'} from cart`}
                  >
                    <LuTrash2 aria-hidden="true" className="size-3.5" />
                    {removingItemId === item.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Link className="mt-5 min-h-10 inline-flex items-center text-[13px] font-semibold text-ink underline-offset-4 hover:underline" to="/products">Continue shopping</Link>
        </section>
        <div className="lg:sticky lg:top-6">{summary}</div>
      </div>
    </main>
  )
}

function LoadingCart() {
  return (
    <main className={`${storefrontContainerClass} max-w-4xl pb-20 pt-12 md:pb-28`} role="status" aria-label="Loading cart">
      <h1 className="m-0 text-[30px] font-[560]">Your cart</h1>
      <div className="mt-8 grid gap-5" aria-hidden="true">
        <div className="h-20 bg-skeleton" />
        <div className="h-20 bg-skeleton" />
      </div>
    </main>
  )
}

function CartLoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const needsLogin = getErrorStatus(error) === 401

  return (
    <main className={`${storefrontContainerClass} flex min-h-[52vh] flex-col items-start justify-center pb-20 pt-12`}>
      <h1 className="m-0 text-[30px] font-[560]">{needsLogin ? 'Sign in to see your cart' : 'Your cart could not load'}</h1>
      <p className="mb-5 mt-3 max-w-[65ch] text-muted">{needsLogin ? 'Your cart is tied to your account. Sign in to continue.' : errorMessage(error)}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {needsLogin ? (
          <Link className="inline-flex min-h-10 items-center font-semibold text-ink underline-offset-4 hover:underline" to="/login">Sign in</Link>
        ) : (
          <button className="inline-flex min-h-10 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline" type="button" onClick={onRetry}>Try again</button>
        )}
        <Link className="inline-flex min-h-10 items-center font-semibold text-ink underline-offset-4 hover:underline" to="/products">Browse products</Link>
      </div>
    </main>
  )
}

function EmptyCart() {
  return (
    <main className={`${storefrontContainerClass} flex min-h-[52vh] flex-col items-start justify-center pb-20 pt-12`}>
      <h1 className="m-0 text-[30px] font-[560]">Your cart is empty</h1>
      <p className="mb-5 mt-3 max-w-[55ch] text-muted">Find something useful and it will be waiting here.</p>
      <Link className="inline-flex min-h-11 items-center bg-charcoal px-4 font-semibold text-spectral-citron no-underline hover:bg-charcoal-hover" to="/products">Browse products</Link>
    </main>
  )
}

export function CartPage() {
  const queryClient = useQueryClient()
  const cartQuery = useGetMyCart({ query: { retry: false, staleTime: 30_000 } })
  const cart = cartQuery.data?.status === 200 ? cartQuery.data.data.data : undefined
  const updateMutation = useUpdateCartItem({
    mutation: { onSuccess: () => void queryClient.invalidateQueries({ queryKey: getGetMyCartQueryKey() }) },
  })
  const deleteMutation = useDeleteCartItem({
    mutation: { onSuccess: () => void queryClient.invalidateQueries({ queryKey: getGetMyCartQueryKey() }) },
  })
  const clearMutation = useClearMyCart({
    mutation: { onSuccess: () => void queryClient.invalidateQueries({ queryKey: getGetMyCartQueryKey() }) },
  })
  const addressesQuery = useListShippingAddresses({
    query: { enabled: Boolean(cart?.items.length), retry: false, staleTime: 60_000 },
  })
  const checkoutMutation = usePreviewCheckout()
  const [selectedAddressId, setSelectedAddressId] = useState<number>()

  const addresses = addressesQuery.data?.status === 200 ? addressesQuery.data.data.data ?? [] : []
  const checkoutPreview = checkoutMutation.data?.status === 200 ? checkoutMutation.data.data.data : undefined
  const activeAddress = addresses.find((address) => address.id === selectedAddressId)
    ?? addresses.find((address) => address.is_default)
    ?? addresses[0]

  function changeQuantity(item: CartItem, quantity: number) {
    updateMutation.mutate({ item: item.id, data: { quantity } })
  }

  function removeItem(item: CartItem) {
    deleteMutation.mutate({ item: item.id })
  }

  function clearCart() {
    if (!window.confirm('Remove all items from your cart?')) return
    clearMutation.mutate()
  }

  function continueToCheckout() {
    if (activeAddress) checkoutMutation.mutate({ data: { shipping_address_id: activeAddress.id } })
  }

  const items = cart?.items ?? []
  const subtotal = items.reduce((total, item) => total + item.price_snapshot * item.quantity, 0)
  const mutationError = updateMutation.error ?? deleteMutation.error ?? clearMutation.error
  const summary = (
    <CartSummary
      itemCount={items.reduce((count, item) => count + item.quantity, 0)}
      subtotal={subtotal}
      addresses={addresses}
      addressesLoading={addressesQuery.isLoading}
      addressesError={addressesQuery.error}
      selectedAddressId={activeAddress?.id}
      onAddressChange={setSelectedAddressId}
      onCheckout={continueToCheckout}
      checkoutPending={checkoutMutation.isPending}
      checkoutError={checkoutMutation.error}
      checkoutPreview={checkoutPreview}
      onClear={clearCart}
      clearPending={clearMutation.isPending}
    />
  )
  const layoutProps = {
    items,
    onQuantityChange: changeQuantity,
    onRemove: removeItem,
    updatingItemId: updateMutation.variables?.item,
    removingItemId: deleteMutation.variables?.item,
    mutationError,
  }

  if (cartQuery.isLoading) return <LoadingCart />
  if (cartQuery.isError) return <CartLoadError error={cartQuery.error} onRetry={() => void cartQuery.refetch()} />
  if (!cart || cart.items.length === 0) return <EmptyCart />

  return <ConversionCart {...layoutProps} summary={summary} />
}
