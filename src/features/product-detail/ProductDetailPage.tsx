import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { LuMinus, LuPlus, LuX } from 'react-icons/lu'
import { ApiError } from '../../api'
import { storefrontContainerClass } from '../../components/storefront/storefrontStyles'
import { formatPrice } from '../../components/storefront/StorefrontProductTile'
import { useAddCartItem, useGetMyCart, getGetMyCartQueryKey } from '../../generated/cart/cart'
import { useGetPublicProduct } from '../../generated/products/products'
import { ProductDetailGallery } from './ProductDetailGallery'


function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.status
  }

  if (typeof error !== 'object' || error === null) {
    return undefined
  }

  const candidate = error as {
    status?: unknown
    response?: { status?: unknown }
  }

  if (typeof candidate.status === 'number') {
    return candidate.status
  }

  if (typeof candidate.response?.status === 'number') {
    return candidate.response.status
  }

  return undefined
}


function LoadingProduct() {
  return (
    <main className={`${storefrontContainerClass} pb-19 pt-8 md:pb-28 md:pt-10`}>
      <div className="mb-6 h-4 w-40 bg-skeleton" aria-hidden="true" />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
        <div className="aspect-[4/4.65] bg-tile" aria-hidden="true" />
        <div className="py-2" role="status" aria-label="Loading product details">
          <span className="sr-only">Loading product details</span>
          <div className="h-3 w-28 bg-skeleton" />
          <div className="mt-5 h-9 w-4/5 bg-skeleton" />
          <div className="mt-7 h-6 w-36 bg-skeleton" />
          <div className="mt-8 border-y border-rule py-5">
            <div className="h-3 w-40 bg-skeleton" />
          </div>
          <div className="mt-7 h-12 w-full bg-skeleton" />
          <div className="mt-4 h-14 w-full bg-skeleton" />
        </div>
      </div>
    </main>
  )
}

function ProductLoadMessage({
  title,
  detail,
  onRetry,
}: {
  title: string
  detail: string
  onRetry?: () => void
}) {
  return (
    <main className={`${storefrontContainerClass} flex min-h-[52vh] flex-col items-start justify-center pb-20 pt-12`}>
      <h1 className="m-0 text-[30px] font-[560] leading-[1.15]">{title}</h1>
      <p className="mb-5 mt-3 max-w-[65ch] text-muted">{detail}</p>
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
        <Link className="inline-flex min-h-10 items-center font-semibold text-ink underline-offset-4 hover:underline" to="/products">
          Back to products
        </Link>
      </div>
    </main>
  )
}

export function ProductDetailPage() {
  const { slug } = useParams()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(1)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const loginDialogRef = useRef<HTMLDialogElement>(null)
  const productQuery = useGetPublicProduct(slug ?? '', {
    query: { enabled: Boolean(slug), retry: false, staleTime: 60_000 },
  })
  const product = productQuery.data?.status === 200 ? productQuery.data.data.data : undefined
  const canCheckCart = Boolean(product && product.status === 'published' && product.stock > 0)
  const cartQuery = useGetMyCart({
    query: { enabled: canCheckCart, retry: false, staleTime: 30_000 },
  })
  const cart = cartQuery.data?.status === 200 ? cartQuery.data.data.data : undefined
  const existingQuantity = cart?.items.find((item) => item.product?.slug === product?.slug)?.quantity ?? 0
  const remainingStock = product ? Math.max(0, product.stock - existingQuantity) : 0
  const quantityLimit = cart ? remainingStock : product?.stock ?? 1
  const addMutation = useAddCartItem({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetMyCartQueryKey() })
      },
      onError: (error) => {
        if (getErrorStatus(error) === 401) setLoginDialogOpen(true)
      },
    },
  })

  useEffect(() => {
    const dialog = loginDialogRef.current
    if (!dialog) return
    if (loginDialogOpen && !dialog.open) dialog.showModal()
    else if (!loginDialogOpen && dialog.open) dialog.close()
  }, [loginDialogOpen])

  if (!slug) {
    return <ProductLoadMessage title="Product not found." detail="The product link is incomplete." />
  }

  if (productQuery.isLoading) return <LoadingProduct />

  if (productQuery.isError) {
    if (getErrorStatus(productQuery.error) === 404) {
      return <ProductLoadMessage title="Product not found." detail="This product may no longer be available." />
    }

    return (
      <ProductLoadMessage
        title="Product details couldn’t load."
        detail="Check your connection, then try again."
        onRetry={() => void productQuery.refetch()}
      />
    )
  }

  if (!product || product.status !== 'published') {
    return <ProductLoadMessage title="Product unavailable." detail="This product is not currently available to view." />
  }

  const isOutOfStock = product.stock <= 0
  const noRemainingStock = !isOutOfStock && Boolean(cart) && remainingStock <= 0
  const cartAuthError = getErrorStatus(cartQuery.error) === 401
  const cartUnavailable = cartQuery.isError && !cartAuthError
  const canSubmit = !isOutOfStock && !noRemainingStock && !addMutation.isPending

  function changeQuantity(next: number) {
    if (!Number.isFinite(next)) return
    const upperBound = Math.max(1, quantityLimit)
    setQuantity(Math.min(Math.max(1, Math.trunc(next)), upperBound))
    addMutation.reset()
  }

  function addToCart() {
    if (!canSubmit || !product) return
    if (cartAuthError) {
      setLoginDialogOpen(true)
      return
    }
    addMutation.mutate({ publicProduct: product.slug, data: { quantity } })
  }

  const mutationErrorStatus = getErrorStatus(addMutation.error)

  return (
    <main className={`${storefrontContainerClass} pb-19 pt-8 md:pb-28 md:pt-10`}>
      <nav className="mb-6 text-[13px] text-muted" aria-label="Breadcrumb">
        <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0">
          <li><Link className="text-ink underline-offset-4 hover:underline" to="/products">Products</Link></li>
          {product.category && (
            <>
              <li aria-hidden="true">/</li>
              <li>{product.category.name}</li>
            </>
          )}
        </ol>
      </nav>

      <div className="pdp-layout-rail">
        <ProductDetailGallery key={product.id} product={product} />
        <section className="min-w-0 lg:py-1" aria-labelledby="product-title">
          {product.category && <p className="mb-2 mt-0 text-[13px] font-semibold text-muted">{product.category.name}</p>}
          <h1 className="m-0 text-[30px] font-[560] leading-[1.12] md:text-[38px]" id="product-title">{product.name}</h1>
          <p className="mb-0 mt-5 text-[23px] font-semibold tabular-nums">{formatPrice(product.price)}</p>
          <div className="mt-7 border-y border-rule py-4">
            <p className="m-0 text-[13px] font-semibold">Availability</p>
            <p className="mb-0 mt-1 text-[14px] text-muted" aria-live="polite">{isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}</p>
          </div>
          <div className="flex justify-between items-end md:justify-start md:gap-5">
            {!isOutOfStock && !noRemainingStock && (
              <div className="mt-6">
                <label className="mb-2 block text-[13px] font-semibold" htmlFor="product-quantity">Quantity</label>
                <div className="flex w-fit items-center border border-rule-strong bg-paper">
                  <button className="grid size-11 place-items-center border-0 bg-transparent text-ink hover:bg-bone disabled:cursor-not-allowed disabled:text-muted" type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => changeQuantity(quantity - 1)}>
                    <LuMinus aria-hidden="true" className="size-4" />
                  </button>
                  <input className="h-11 w-14 border-x border-rule-strong bg-paper text-center tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-marker-olive focus-visible:ring-inset" id="product-quantity" type="number" min={1} max={Math.max(1, quantityLimit)} step={1} inputMode="numeric" value={quantity} onChange={(event: ChangeEvent<HTMLInputElement>) => changeQuantity(event.currentTarget.valueAsNumber)} />
                  <button className="grid size-11 place-items-center border-0 bg-transparent text-ink hover:bg-bone disabled:cursor-not-allowed disabled:text-muted" type="button" aria-label="Increase quantity" disabled={quantity >= quantityLimit} onClick={() => changeQuantity(quantity + 1)}>
                    <LuPlus aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>
            )}
            <div className="mt-5">
              {cartUnavailable && <p className="mb-3 mt-0 text-[13px] text-muted" role="status">Cart status could not be checked. The server will verify availability when you add this product.</p>}
              <button className="min-h-14 w-fit border-0 bg-charcoal px-5 text-left font-semibold text-spectral-citron hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-70" type="button" disabled={!canSubmit} onClick={addToCart}>
                {addMutation.isPending ? 'Adding to cart…' : isOutOfStock ? 'Out of stock' : noRemainingStock ? 'Available quantity in cart' : 'Add to cart'}
              </button>
              {addMutation.isSuccess && <p className="mb-0 mt-3 text-[14px]" role="status">Added to cart. <Link className="font-semibold text-ink underline-offset-4 hover:underline" to="/cart">View cart</Link></p>}
              {addMutation.isError && (
                <div className="mt-3 text-[14px]" role="alert">
                  {mutationErrorStatus === 401 ? <p className="m-0">Sign in is required to add this product.</p> : mutationErrorStatus === 404 ? <p className="m-0">This product is no longer available.</p> : mutationErrorStatus === 422 ? <p className="m-0">That quantity is no longer available. Check the current stock and try again.</p> : <p className="m-0">The product couldn’t be added. Try again.</p>}
                  <button className="mt-1 inline-flex min-h-9 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline" type="button" onClick={addToCart}>Retry</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {(product.description?.trim() || product.store?.name || product.tags?.length) && (
        <section className="mt-12 border-t border-rule pt-7 md:mt-16 md:pt-9" aria-labelledby="product-information-title">
          <h2 className="m-0 text-[22px] font-[560] leading-[1.2]" id="product-information-title">Product information</h2>
          {product.description?.trim() && (
            <p className="mb-0 mt-4 max-w-[72ch] whitespace-pre-line text-[15px] leading-[1.65] text-ink-soft">{product.description}</p>
          )}
          {(product.store?.name || product.tags?.length) && (
            <dl className="mb-0 mt-6 grid gap-4 border-t border-rule pt-4 sm:grid-cols-2">
              {product.store?.name && (
                <div>
                  <dt className="text-[12px] font-semibold text-muted">Store</dt>
                  <dd className="mb-0 mt-1">{product.store.name}</dd>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <dt className="text-[12px] font-semibold text-muted">Tags</dt>
                  <dd className="mb-0 mt-1">{product.tags.map((tag) => tag.name).join(', ')}</dd>
                </div>
              )}
            </dl>
          )}
        </section>
      )}

      <dialog
        ref={loginDialogRef}
        className="m-auto w-[calc(100%-32px)] max-w-110 border border-rule bg-paper p-0 text-ink backdrop:bg-charcoal/60"
        aria-labelledby="sign-in-dialog-title"
        onClose={() => setLoginDialogOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setLoginDialogOpen(false)
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-end">
            <button
              className="grid size-10 place-items-center border-0 bg-transparent text-ink hover:bg-bone focus-visible:outline-2 focus-visible:outline-marker-olive"
              type="button"
              aria-label="Close sign-in dialog"
              onClick={() => setLoginDialogOpen(false)}
            >
              <LuX aria-hidden="true" className="size-5" />
            </button>
          </div>
          <h2 className="mb-0 mt-1 text-[24px] font-[560] leading-[1.2]" id="sign-in-dialog-title">Sign in to add to cart</h2>
          <p className="mb-0 mt-3 text-[15px] leading-normal text-muted">Sign in to add this product to your cart. Your selected quantity will remain here if you close this dialog.</p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Link
              className="inline-flex min-h-12 items-center bg-charcoal px-5 font-semibold text-spectral-citron no-underline hover:bg-charcoal-hover"
              to="/login"
              onClick={() => setLoginDialogOpen(false)}
            >
              Sign in
            </Link>
            <button
              className="inline-flex min-h-10 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline"
              type="button"
              onClick={() => setLoginDialogOpen(false)}
            >
              Continue shopping
            </button>
          </div>
        </div>
      </dialog>
    </main>
  )
}
