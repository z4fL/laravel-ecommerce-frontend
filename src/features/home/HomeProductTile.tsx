import { useState } from 'react'
import { Link } from 'react-router'
import { LuImage } from 'react-icons/lu'
import { API_ORIGIN } from '../../api'
import type { Product } from '../../generated/models'

function getProductImageUrl(path: string) {
  return new URL(`/storage/${path.replace(/^\/+/, '')}`, API_ORIGIN).toString()
}

function formatPrice(price: number) {
  return `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(price)}`
}

function ProductImage({ product }: { product: Product }) {
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
        <LuImage aria-hidden="true" className="size-[42px]" />
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
      className="block size-full object-cover transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025] motion-reduce:transition-none"
    />
  )
}

export function HomeProductTile({ product }: { product: Product }) {
  const productPath = `/products/${encodeURIComponent(product.slug)}`

  return (
    <article className="min-w-0">
      <Link
        className="group block aspect-[4/4.65] overflow-hidden bg-tile text-inherit"
        to={productPath}
        aria-label={`View ${product.name}`}
      >
        <ProductImage product={product} />
      </Link>
      <div className="grid gap-1 pt-[13px]">
        {product.category && (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold text-muted">
            {product.category.name}
          </div>
        )}
        <Link
          className="line-clamp-2 min-h-11 overflow-hidden text-[15px] font-[550] leading-[1.45] text-ink no-underline hover:underline hover:underline-offset-4"
          to={productPath}
        >
          {product.name}
        </Link>
        <div className="mt-[3px] text-[15px] font-semibold tabular-nums">
          {formatPrice(product.price)}
        </div>
      </div>
    </article>
  )
}
