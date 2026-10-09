type CategoryOption = [slug: string, name: string];
type SortOption = {
    value: string;
    label: string;
}

interface ProductSearchFiltersProps {
  searchDraft: string;
  onSearchChange: (value: string) => void;
  category: string;
  observedCategories: CategoryOption[];
  minPriceValue: string;
  maxPriceValue: string;
  inStock: boolean;
  sort: string | undefined;
  sortOptions: readonly SortOption[];
  perPage: number;
  pageSizeOptions: number[];
  mobileControlsOpen: boolean;
  onMobileControlsToggle: () => void;
  onFilterChange: (updates: Record<string, string>) => void;
}

export function ProductSearchFilters({
  searchDraft,
  onSearchChange,
  category,
  observedCategories,
  minPriceValue,
  maxPriceValue,
  inStock,
  sort,
  sortOptions,
  perPage,
  pageSizeOptions,
  mobileControlsOpen,
  onMobileControlsToggle,
  onFilterChange,
}: ProductSearchFiltersProps) {
  return (
    <section
      className="mt-8 border-y border-rule py-4 md:mt-[43px] md:py-[19px]"
      aria-label="Search and filter products"
    >
      <button
        className="mb-3 inline-flex min-h-10 items-center border-0 bg-transparent p-0 text-[14px] font-semibold text-ink underline-offset-4 hover:underline sm:hidden"
        type="button"
        aria-expanded={mobileControlsOpen}
        aria-controls="catalog-controls"
        onClick={onMobileControlsToggle}
      >
        {mobileControlsOpen
          ? "Hide search and filters"
          : "Search and filters"}
      </button>

      <div
        className={`${mobileControlsOpen ? "grid" : "hidden"} grid-cols-1 gap-x-4 gap-y-4 sm:grid sm:grid-cols-6 sm:gap-x-5 sm:gap-y-4`}
        id="catalog-controls"
      >
        <label
          className="grid content-start gap-2 text-[12px] font-semibold sm:col-span-2"
          htmlFor="catalog-search"
        >
          Search products
          <input
            className="h-11 min-w-0 border border-rule-strong bg-paper px-3 text-[14px] font-normal text-ink outline-0 placeholder:text-muted focus:border-marker-olive"
            id="catalog-search"
            type="search"
            value={searchDraft}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Name or keyword"
          />
        </label>

        <label
          className="grid content-start gap-2 text-[12px] font-semibold sm:col-span-2"
          htmlFor="catalog-category"
        >
          Category
          <select
            className="h-11 min-w-0 border border-rule-strong bg-paper px-3 text-[14px] font-normal text-ink outline-0 focus:border-marker-olive"
            id="catalog-category"
            value={category}
            onChange={(event) =>
              onFilterChange({ category: event.target.value })
            }
          >
            <option value="">All categories</option>
            {observedCategories.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label
          className="grid content-start gap-2 text-[12px] font-semibold"
          htmlFor="catalog-min-price"
        >
          Minimum price
          <input
            className="h-11 min-w-0 border border-rule-strong bg-paper px-3 text-[14px] font-normal text-ink outline-0 focus:border-marker-olive"
            id="catalog-min-price"
            type="number"
            min="0"
            step="any"
            value={minPriceValue}
            onChange={(event) =>
              onFilterChange({ min_price: event.target.value })
            }
          />
        </label>

        <label
          className="grid content-start gap-2 text-[12px] font-semibold"
          htmlFor="catalog-max-price"
        >
          Maximum price
          <input
            className="h-11 min-w-0 border border-rule-strong bg-paper px-3 text-[14px] font-normal text-ink outline-0 focus:border-marker-olive"
            id="catalog-max-price"
            type="number"
            min="0"
            step="any"
            value={maxPriceValue}
            onChange={(event) =>
              onFilterChange({ max_price: event.target.value })
            }
          />
        </label>

        <div className="flex min-h-11 text-[13px] font-medium sm:col-span-2">
          <label
            className="flex items-center gap-3"
            htmlFor="catalog-in-stock"
          >
            <input
              className="size-4 accent-marker-olive"
              id="catalog-in-stock"
              type="checkbox"
              checked={inStock}
              onChange={(event) =>
                onFilterChange({
                  in_stock: event.target.checked ? "true" : "",
                })
              }
            />
            Only show in-stock products
          </label>
        </div>

        <label
          className="grid content-start gap-2 text-[12px] font-semibold sm:col-span-2"
          htmlFor="catalog-sort"
        >
          Sort by
          <select
            className="h-11 min-w-0 border border-rule-strong bg-paper px-3 text-[14px] font-normal text-ink outline-0 focus:border-marker-olive"
            id="catalog-sort"
            value={sort ?? ""}
            onChange={(event) =>
              onFilterChange({ sort: event.target.value })
            }
          >
            <option value="">Default order</option>
            {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
          </select>
        </label>

        <label
          className="grid content-start gap-2 text-[12px] font-semibold sm:col-span-2"
          htmlFor="catalog-per-page"
        >
          Products per page
          <select
            className="h-11 min-w-0 border border-rule-strong bg-paper px-3 text-[14px] font-normal text-ink outline-0 focus:border-marker-olive"
            id="catalog-per-page"
            value={perPage}
            onChange={(event) =>
              onFilterChange({ per_page: event.target.value })
            }
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} products
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
