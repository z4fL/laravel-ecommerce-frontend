import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { LuImage } from 'react-icons/lu'
import { API_ORIGIN } from '../../api'
import type { Product } from '../../generated/models'

interface StorefrontProductTileProps {
  product: Product
  productHref?: string
  showStockStatus?: boolean
  fallbackIcon?: ReactNode
}

const productImageFrameClass = 'aspect-[4/4.65] overflow-hidden bg-tile'
const productNameClass =
  'line-clamp-2 min-h-11 overflow-hidden text-[15px] font-[550] leading-[1.45] text-ink'

export function getProductImageUrl(path: string) {
  return new URL(`/storage/${path.replace(/^\/+/, '')}`, API_ORIGIN).toString()
}

export function formatPrice(price: number) {
  return `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(price)}`
}

function ProductImage({
  product,
  fallbackIcon,
  isInteractive,
}: {
  product: Product
  fallbackIcon?: ReactNode
  isInteractive: boolean
}) {
  const [failed, setFailed] = useState(false)
  const image = product.images?.slice().sort((first, second) => first.sort_order - second.sort_order)[0]
  const isPlaceholder = image?.path.split('/').pop()?.toLowerCase().startsWith('placeholder.') ?? false

  if (!image || failed || isPlaceholder) {
    return (
      <div
        className="flex size-full flex-col items-center justify-center gap-3 text-[12px] text-muted"
        role="img"
        aria-label={`${product.name} image unavailable`}
      >
        {fallbackIcon ?? <LuImage aria-hidden="true" className="size-[42px]" />}
        <span>Image unavailable</span>
      </div>
    )
  }

  return (
    <img
      src={getProductImageUrl(image.path)}
      alt={product.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={isInteractive
        ? 'block size-full object-cover transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025] motion-reduce:transition-none'
        : 'block size-full object-cover'}
    />
  )
}

export function StorefrontProductTile({
  product,
  productHref,
  showStockStatus = false,
  fallbackIcon,
}: StorefrontProductTileProps) {
  const image = (
    <ProductImage
      product={product}
      fallbackIcon={fallbackIcon}
      isInteractive={Boolean(productHref)}
    />
  )

  return (
    <article className="min-w-0">
      {productHref ? (
        <Link
          className={`group block ${productImageFrameClass} text-inherit`}
          to={productHref}
          aria-label={`View ${product.name}`}
        >
          {image}
        </Link>
      ) : (
        <div className={productImageFrameClass}>{image}</div>
      )}
      <div className="grid gap-1 pt-[13px]">
        {product.category && (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold text-muted">
            {product.category.name}
          </div>
        )}
        {productHref ? (
          <Link
            className={`${productNameClass} text-ink no-underline hover:underline hover:underline-offset-4`}
            to={productHref}
          >
            {product.name}
          </Link>
        ) : (
          <h2 className={`m-0 ${productNameClass}`}>
            {product.name}
          </h2>
        )}
        <div className="mt-[3px] text-[15px] font-semibold tabular-nums">
          {formatPrice(product.price)}
        </div>
        {showStockStatus && product.stock === 0 && (
          <div className="text-[12px] text-muted">Out of stock</div>
        )}
      </div>
    </article>
  )
}
