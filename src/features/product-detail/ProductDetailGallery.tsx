import { useState } from 'react'
import { LuImage } from 'react-icons/lu'
import { getProductImageUrl } from '../../components/storefront/StorefrontProductTile'
import type { Product, ProductImage } from '../../generated/models'

function isPlaceholder(image: ProductImage) {
  return image.path.split('/').pop()?.toLowerCase().startsWith('placeholder.') ?? false
}

export function ProductDetailGallery({ product }: { product: Product }) {
  const [selectedImageId, setSelectedImageId] = useState<number>()
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(() => new Set())
  const images = (product.images ?? [])
    .filter((image) => image.path.trim().length > 0 && !isPlaceholder(image))
    .slice()
    .sort((first, second) => first.sort_order - second.sort_order || first.id - second.id)
  const activeImage = images.find((image) => image.id === selectedImageId) ?? images[0]
  const activeImageFailed = activeImage ? failedImageIds.has(activeImage.id) : false

  function markImageFailed(imageId: number) {
    setFailedImageIds((current) => {
      if (current.has(imageId)) return current
      const next = new Set(current)
      next.add(imageId)
      return next
    })
  }

  return (
    <div className="min-w-0">
      <div className="aspect-[4/4.65] overflow-hidden bg-tile">
        {activeImage && !activeImageFailed ? (
          <img
            className="block size-full object-contain"
            src={getProductImageUrl(activeImage.path)}
            alt={product.name}
            fetchPriority="high"
            onError={() => markImageFailed(activeImage.id)}
          />
        ) : (
          <div
            className="flex size-full flex-col items-center justify-center gap-3 text-[13px] text-muted"
            role="img"
            aria-label={`${product.name} image unavailable`}
          >
            <LuImage aria-hidden="true" className="size-10" />
            <span>Image unavailable</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Product images">
          {images.map((image, index) => {
            const isSelected = image.id === (activeImage?.id)
            const imageFailed = failedImageIds.has(image.id)

            return (
              <button
                className={`w-16 shrink-0 border bg-transparent p-1 text-left ${isSelected ? 'border-2 border-marker-olive' : 'border-rule'}`}
                key={image.id}
                type="button"
                aria-label={`Show product image ${index + 1}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedImageId(image.id)}
              >
                <span className="block aspect-[4/4.65] overflow-hidden bg-tile">
                  {imageFailed ? (
                    <span className="flex size-full items-center justify-center text-muted" aria-hidden="true">
                      <LuImage className="size-5" />
                    </span>
                  ) : (
                    <img
                      className="block size-full object-cover"
                      src={getProductImageUrl(image.path)}
                      alt=""
                      loading="lazy"
                      onError={() => markImageFailed(image.id)}
                    />
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
