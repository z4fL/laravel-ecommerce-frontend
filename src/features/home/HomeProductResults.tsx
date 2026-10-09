import { Link } from 'react-router'
import { LuArrowRight } from 'react-icons/lu'
import type { Product } from '../../generated/models'
import { StorefrontProductTile } from '../../components/storefront/StorefrontProductTile'

interface HomeProductResultsProps {
  products: Product[]
  total?: number
  isLoading: boolean
  hasError: boolean
  submittedSearch: string
  activeCategoryName: string | undefined
  hasActiveFilters: boolean
  onRetry: () => void
  onClearFilters: () => void
}

export function HomeProductResults({
  products,
  total,
  isLoading,
  hasError,
  submittedSearch,
  activeCategoryName,
  hasActiveFilters,
  onRetry,
  onClearFilters,
}: HomeProductResultsProps) {
  const resultsTitle = submittedSearch ? 'Search results' : activeCategoryName ?? 'All products'

  return (
    <section className="pt-8 md:pt-[43px]" aria-labelledby="home-results-title" aria-busy={isLoading}>
      <div className="mb-[25px] flex items-start justify-between gap-5 sm:items-end">
        <div>
          <h2 className="m-0 text-[26px] font-[560] leading-[1.15] md:text-[30px]" id="home-results-title">{resultsTitle}</h2>
          {submittedSearch && <p className="mt-[5px] mb-0 text-[13px] text-muted">For “{submittedSearch}”</p>}
        </div>
        <div className="flex flex-col-reverse items-end gap-0.5 sm:flex-row sm:items-center sm:gap-[15px] md:gap-[25px]">
          {total !== undefined && (
            <span className="text-[11px] tabular-nums text-muted sm:text-[13px]">
              {total} {total === 1 ? 'product' : 'products'}
            </span>
          )}
          <Link
            className="inline-flex min-h-[30px] items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-xs font-semibold text-ink no-underline hover:underline hover:underline-offset-[5px] sm:min-h-10 sm:text-[14px]"
            to="/products"
          >
            View all <LuArrowRight aria-hidden="true" className="size-[17px]" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <ProductSkeletons />
      ) : hasError && products.length === 0 ? (
        <ProductError onRetry={onRetry} />
      ) : products.length === 0 ? (
        <EmptyProducts
          submittedSearch={submittedSearch}
          activeCategoryName={activeCategoryName}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      ) : (
        <>
          {hasError && (
            <div className="mb-5 flex items-center justify-between gap-4 border-y border-rule-strong py-3 text-[13px] text-muted" role="alert">
              Couldn’t refresh products. Showing the last loaded results.
              <button className="border-0 border-b border-current bg-transparent p-1 px-0 text-ink" type="button" onClick={onRetry}>
                Try again
              </button>
            </div>
          )}
          <div className="product-grid">
            {products.map((product) => (
              <StorefrontProductTile
                key={product.id}
                product={product}
                productHref={`/products/${encodeURIComponent(product.slug)}`}
              />
            ))}
          </div>
          <div className="mt-[43px] flex justify-center">
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-[14px] font-semibold text-ink no-underline hover:underline hover:underline-offset-[5px]"
              to="/products"
            >
              Browse the full catalog <LuArrowRight aria-hidden="true" className="size-[17px]" />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

function ProductSkeletons() {
  return (
    <div className="product-grid" role="status" aria-label="Loading products">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="min-w-0" key={index} aria-hidden="true">
          <div className="aspect-[4/4.65] bg-tile" />
          <div className="mt-[17px] h-2 w-[38%] bg-skeleton" />
          <div className="mt-[14px] h-[10px] bg-skeleton" />
          <div className="mt-3 h-[10px] w-[42%] bg-skeleton" />
        </div>
      ))}
      <span className="sr-only">Loading products</span>
    </div>
  )
}

function ProductError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[280px] flex-col items-start justify-center border-t border-rule py-[38px]" role="alert">
      <h3 className="m-0 text-[25px] font-[560]">Products couldn’t load.</h3>
      <p className="mb-[17px] mt-2 text-muted">Check your connection, then try again.</p>
      <button
        className="inline-flex min-h-10 items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-[14px] font-semibold text-ink no-underline hover:underline hover:underline-offset-[5px]"
        type="button"
        onClick={onRetry}
      >
        Try again <LuArrowRight aria-hidden="true" className="size-[17px]" />
      </button>
    </div>
  )
}

function EmptyProducts({
  submittedSearch,
  activeCategoryName,
  hasActiveFilters,
  onClearFilters,
}: Pick<HomeProductResultsProps, 'submittedSearch' | 'activeCategoryName' | 'hasActiveFilters' | 'onClearFilters'>) {
  return (
    <div className="flex min-h-[280px] flex-col items-start justify-center border-t border-rule py-[38px]">
      <h3 className="m-0 text-[25px] font-[560]">
        {submittedSearch
          ? 'No products found.'
          : activeCategoryName
            ? `No products in ${activeCategoryName}.`
            : 'Nothing here yet.'}
      </h3>
      <p className="mb-[17px] mt-2 text-muted">
        {submittedSearch
          ? 'Try a different search or clear your filters.'
          : activeCategoryName
            ? 'Choose another category or show all products.'
            : 'There are no published products to show right now.'}
      </p>
      {hasActiveFilters && (
        <button
          className="inline-flex min-h-10 items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-[14px] font-semibold text-ink no-underline hover:underline hover:underline-offset-[5px]"
          type="button"
          onClick={onClearFilters}
        >
          Show all products <LuArrowRight aria-hidden="true" className="size-[17px]" />
        </button>
      )}
    </div>
  )
}
