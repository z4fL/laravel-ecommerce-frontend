import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import type { Product } from "../../generated/models";
import { StorefrontProductTile } from "../../components/storefront/StorefrontProductTile";

interface ProductMeta {
  total: number;
  current_page: number;
  last_page: number;
}

interface ProductCatalogProps {
  products: Product[];
  meta?: ProductMeta;
  isLoading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onChangePage: (page: number) => void;
}

function ProductSkeletons() {
  return (
    <div className="product-grid" role="status" aria-label="Loading products">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="min-w-0" key={index} aria-hidden="true">
          <div className="aspect-[4/4.65] bg-skeleton" />
          <div className="mt-[17px] h-2 w-[38%] bg-skeleton" />
          <div className="mt-[14px] h-[10px] bg-skeleton" />
          <div className="mt-3 h-[10px] w-[42%] bg-skeleton" />
        </div>
      ))}
      <span className="sr-only">Loading products</span>
    </div>
  );
}

export function ProductCatalog({
  products,
  meta,
  isLoading,
  isError,
  hasActiveFilters,
  onRetry,
  onClearFilters,
  onChangePage,
}: ProductCatalogProps) {
  return (
    <section
      className="pt-7 md:pt-9"
      aria-labelledby="catalog-results-title"
      aria-busy={isLoading}
    >
      <div className="mb-[25px] flex min-h-[36px] items-end justify-between gap-5 border-b border-rule pb-3">
        <h2
          className="m-0 text-[20px] font-[560] leading-[1.2] md:text-[22px]"
          id="catalog-results-title"
        >
          Catalog
        </h2>
        {meta ? (
          <span className="text-[12px] tabular-nums text-muted sm:text-[13px]">
            {meta.total} {meta.total === 1 ? "product" : "products"}
          </span>
        ) : (
          <span className="h-3 w-20 bg-skeleton" aria-hidden="true" />
        )}
      </div>

      {isLoading ? (
        <ProductSkeletons />
      ) : isError ? (
        <div className="flex min-h-[280px] flex-col items-start justify-center border-t border-rule py-[38px]" role="alert">
          <h3 className="m-0 text-[25px] font-[560]">
            Products couldn’t load.
          </h3>
          <p className="mb-[17px] mt-2 text-muted">
            Check your connection, then try again.
          </p>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-[14px] font-semibold text-ink hover:underline hover:underline-offset-[5px]"
            type="button"
            onClick={onRetry}
          >
            Try again <LuArrowRight aria-hidden="true" />
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-start justify-center border-t border-rule py-[38px]">
          <h3 className="m-0 text-[25px] font-[560]">
            {hasActiveFilters
              ? "No products match these filters."
              : "No products are available yet."}
          </h3>
          <p className="mb-[17px] mt-2 text-muted">
            {hasActiveFilters
              ? "Try changing your search or filters."
              : "There are no published products to show right now."}
          </p>
          {hasActiveFilters && (
            <button
              className="inline-flex min-h-10 items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-[14px] font-semibold text-ink hover:underline hover:underline-offset-[5px]"
              type="button"
              onClick={onClearFilters}
            >
              Clear filters <LuArrowRight aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <StorefrontProductTile
                key={product.id}
                product={product}
                productHref={`/products/${encodeURIComponent(product.slug)}`}
                showStockStatus
              />
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <nav
              className="mt-[43px] flex items-center justify-between border-t border-rule pt-4"
              aria-label="Product pagination"
            >
              <button
                className="inline-flex min-h-10 items-center gap-2 border-0 bg-transparent p-0 text-[14px] font-semibold text-ink disabled:cursor-not-allowed disabled:text-muted"
                type="button"
                disabled={meta.current_page <= 1}
                onClick={() => onChangePage(meta.current_page - 1)}
              >
                <LuArrowLeft aria-hidden="true" /> Previous
              </button>
              <span className="text-[12px] tabular-nums text-muted sm:text-[13px]">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                className="inline-flex min-h-10 items-center gap-2 border-0 bg-transparent p-0 text-[14px] font-semibold text-ink disabled:cursor-not-allowed disabled:text-muted"
                type="button"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => onChangePage(meta.current_page + 1)}
              >
                Next <LuArrowRight aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
