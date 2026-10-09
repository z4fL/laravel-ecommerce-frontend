import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { API_ORIGIN } from "../../api";
import { useListPublicProducts } from "../../generated/products/products";
import type { Product } from "../../generated/models";

const PAGE_SIZE_OPTIONS = [12, 24, 48, 100];
const SORT_OPTIONS = [
  { value: "name", label: "Name: A to Z" },
  { value: "-name", label: "Name: Z to A" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "created_at", label: "Oldest first" },
  { value: "-created_at", label: "Newest first" },
  { value: "updated_at", label: "Least recently updated" },
  { value: "-updated_at", label: "Recently updated" },
] as const;

type ProductQueryParams = NonNullable<
  Parameters<typeof useListPublicProducts>[0]
>;
type ProductSort = ProductQueryParams["sort"];

const containerClass =
  "mx-auto w-[calc(100%-40px)] md:w-[min(calc(100%-64px),1400px)] lg:w-[min(calc(100%-96px),1400px)]";

const navLinkClass =
  "inline-flex min-h-11 items-center gap-2 text-xs text-inherit no-underline hover:underline hover:underline-offset-[5px] sm:text-[13px] md:text-[14px]";

const productGridClass =
  "grid grid-cols-2 gap-x-[13px] gap-y-[31px] md:grid-cols-3 md:gap-x-[21px] md:gap-y-[42px] lg:grid-cols-4";

function getProductImageUrl(path: string) {
  return new URL(`/storage/${path.replace(/^\/+/, "")}`, API_ORIGIN).toString();
}

function formatPrice(price: number) {
  return `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(price)}`;
}

function getPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getPrice(value: string | null) {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const image = product.images
    ?.slice()
    .sort((first, second) => first.sort_order - second.sort_order)[0];
  const isPlaceholder =
    image?.path.split("/").pop()?.toLowerCase().startsWith("placeholder.") ??
    false;

  if (!image || failed || isPlaceholder) {
    return (
      <div
        className="flex size-full flex-col items-center justify-center gap-3 text-[12px] text-muted"
        role="img"
        aria-label={`${product.name} image unavailable`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          fill="none"
          className="size-[42px] stroke-current stroke-[1.15] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <rect x="7.5" y="9.5" width="33" height="29" rx="1" />
          <circle cx="18" cy="19" r="3" />
          <path d="m10 34 9-9 6 6 4-4 9 8" />
        </svg>
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={getProductImageUrl(image.path)}
      alt={product.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="block size-full object-cover"
    />
  );
}

function ProductTile({ product }: { product: Product }) {
  return (
    <article className="min-w-0">
      <div className="aspect-[4/4.65] overflow-hidden bg-tile">
        <ProductImage product={product} />
      </div>
      <div className="grid gap-1 pt-[13px]">
        {product.category && (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold text-muted">
            {product.category.name}
          </div>
        )}
        <h2 className="m-0 line-clamp-2 min-h-11 overflow-hidden text-[15px] font-[550] leading-[1.45] text-ink">
          {product.name}
        </h2>
        <div className="mt-[3px] text-[15px] font-semibold tabular-nums">
          {formatPrice(product.price)}
        </div>
        {product.stock === 0 && (
          <div className="text-[12px] text-muted">Out of stock</div>
        )}
      </div>
    </article>
  );
}

function ProductSkeletons() {
  return (
    <div
      className={productGridClass}
      role="status"
      aria-label="Loading products"
    >
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

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-[17px] stroke-current stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]"
    >
      {direction === "next" ? (
        <path d="M5 12h13M12 6l6 6-6 6" />
      ) : (
        <path d="M19 12H6m6 6-6-6 6-6" />
      )}
    </svg>
  );
}

function ProductError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex min-h-[280px] flex-col items-start justify-center border-t border-rule py-[38px]"
      role="alert"
    >
      <h2 className="m-0 text-[25px] font-[560]">Products couldn’t load.</h2>
      <p className="mb-[17px] mt-2 text-muted">
        Check your connection, then try again.
      </p>
      <button
        className="inline-flex min-h-10 items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-[14px] font-semibold text-ink hover:underline hover:underline-offset-[5px]"
        type="button"
        onClick={onRetry}
      >
        Try again <ArrowIcon direction="next" />
      </button>
    </div>
  );
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(
    searchParams.get("search") ?? "",
  );
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<
    Record<string, string>
  >({});

  const page = getPositiveInteger(searchParams.get("page"), 1);
  const perPage = Math.min(
    getPositiveInteger(searchParams.get("per_page"), PAGE_SIZE_OPTIONS[0]),
    100,
  );
  const category = searchParams.get("category") ?? "";
  const minPriceValue = searchParams.get("min_price") ?? "";
  const maxPriceValue = searchParams.get("max_price") ?? "";
  const minPrice = getPrice(searchParams.get("min_price"));
  const maxPrice = getPrice(searchParams.get("max_price"));
  const inStock = searchParams.get("in_stock") === "true";
  const requestedSort = searchParams.get("sort");
  const sort = SORT_OPTIONS.find((option) => option.value === requestedSort)
    ?.value as ProductSort | undefined;

  const productsQuery = useListPublicProducts(
    {
      page,
      per_page: perPage,
      ...(searchParams.get("search")
        ? { search: searchParams.get("search")! }
        : {}),
      ...(category ? { category } : {}),
      ...(minPrice !== undefined ? { min_price: minPrice } : {}),
      ...(maxPrice !== undefined ? { max_price: maxPrice } : {}),
      ...(inStock ? { in_stock: true } : {}),
      ...(sort ? { sort } : {}),
    },
    { query: { staleTime: 60 * 1000 } },
  );

  const productResponse =
    productsQuery.data?.status === 200 ? productsQuery.data.data : undefined;
  const products = productResponse?.data ?? [];
  const hasActiveFilters = Boolean(
    searchParams.get("search") ||
    category ||
    minPriceValue ||
    maxPriceValue ||
    inStock,
  );
  const pageSizeOptions = PAGE_SIZE_OPTIONS.includes(perPage)
    ? PAGE_SIZE_OPTIONS
    : [...PAGE_SIZE_OPTIONS, perPage].sort((first, second) => first - second);

  useEffect(() => {
    setSearchDraft(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchDraft.trim();
      const currentSearch = searchParams.get("search") ?? "";
      if (nextSearch === currentSearch) return;

      const next = new URLSearchParams(searchParams);
      if (nextSearch) next.set("search", nextSearch);
      else next.delete("search");
      next.set("page", "1");
      setSearchParams(next, { replace: true });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchDraft, searchParams, setSearchParams]);

  useEffect(() => {
    if (!productResponse) return;
    setCategoryOptions((current) => {
      const next = { ...current };
      let changed = false;
      for (const product of productResponse.data) {
        if (
          product.category &&
          next[product.category.slug] !== product.category.name
        ) {
          next[product.category.slug] = product.category.name;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [productResponse]);

  function updateFilters(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("search" in updates)) {
      const committedSearch = searchDraft.trim();
      if (committedSearch) next.set("search", committedSearch);
      else next.delete("search");
    }
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    setSearchDraft("");
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  function changePage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    const committedSearch = searchDraft.trim();
    const currentSearch = searchParams.get("search") ?? "";
    if (committedSearch !== currentSearch) {
      if (committedSearch) next.set("search", committedSearch);
      else next.delete("search");
      next.set("page", "1");
    } else {
      next.set("page", String(nextPage));
    }
    setSearchParams(next, { replace: true });
  }

  const observedCategories = Object.entries(categoryOptions).sort(
    (first, second) => first[1].localeCompare(second[1]),
  );
  if (category && !categoryOptions[category])
    observedCategories.push([category, category]);

  return (
    <div className="min-h-dvh bg-bone text-[15px] leading-normal text-ink">
      <header className="bg-charcoal text-paper">
        <div
          className={`${containerClass} flex min-h-[68px] items-center justify-between gap-7 md:min-h-[76px]`}
        >
          <Link
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-base font-semibold text-inherit no-underline sm:gap-3 sm:text-[18px]"
            to="/"
            aria-label="The Shop home"
          >
            <span
              className="flex h-[22px] items-center gap-[3px]"
              aria-hidden="true"
            >
              <span className="block h-4 w-0.5 bg-spectral-citron" />
            </span>
            <span>The Shop</span>
          </Link>
          <nav
            className="flex items-center gap-[13px] sm:gap-[18px] md:gap-8"
            aria-label="Main navigation"
          >
            <Link className={navLinkClass} to="/products" aria-current="page">
              Products
            </Link>
            <Link className={navLinkClass} to="/cart">
              Cart
            </Link>
            <Link className={navLinkClass} to="/login">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main
        className={`${containerClass} pb-[76px] pt-12 md:pb-28 md:pt-[68px]`}
      >
        <h1 className="m-0 text-[46px] font-[520] leading-[0.99] tracking-normal sm:text-[52px] md:text-[58px] lg:text-[68px]">
          <span className="bg-spectral-citron box-decoration-clone">
            Products
          </span>
        </h1>

        <section
          className="mt-8 border-y border-rule py-4 md:mt-[43px] md:py-[19px]"
          aria-label="Search and filter products"
        >
          <button
            className="mb-3 inline-flex min-h-10 items-center border-0 bg-transparent p-0 text-[14px] font-semibold text-ink underline-offset-4 hover:underline sm:hidden"
            type="button"
            aria-expanded={mobileControlsOpen}
            aria-controls="catalog-controls"
            onClick={() => setMobileControlsOpen((open) => !open)}
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
                onChange={(event) => setSearchDraft(event.target.value)}
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
                  updateFilters({ category: event.target.value })
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
                  updateFilters({ min_price: event.target.value })
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
                  updateFilters({ max_price: event.target.value })
                }
              />
            </label>
            <label
              className="flex min-h-11 items-center gap-3 text-[13px] font-medium sm:col-span-2"
              htmlFor="catalog-in-stock"
            >
              <input
                className="size-4 accent-marker-olive"
                id="catalog-in-stock"
                type="checkbox"
                checked={inStock}
                onChange={(event) =>
                  updateFilters({
                    in_stock: event.target.checked ? "true" : "",
                  })
                }
              />
              Only show in-stock products
            </label>
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
                  updateFilters({ sort: event.target.value })
                }
              >
                <option value="">Default order</option>
                {SORT_OPTIONS.map((option) => (
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
                  updateFilters({ per_page: event.target.value })
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

        <section
          className="pt-7 md:pt-9"
          aria-labelledby="catalog-results-title"
          aria-busy={productsQuery.isLoading}
        >
          <div className="mb-[25px] flex min-h-[36px] items-end justify-between gap-5 border-b border-rule pb-3">
            <h2
              className="m-0 text-[20px] font-[560] leading-[1.2] md:text-[22px]"
              id="catalog-results-title"
            >
              Catalog
            </h2>
            {productResponse ? (
              <span className="text-[12px] tabular-nums text-muted sm:text-[13px]">
                {productResponse.meta.total}{" "}
                {productResponse.meta.total === 1 ? "product" : "products"}
              </span>
            ) : (
              <span className="h-3 w-20 bg-skeleton" aria-hidden="true" />
            )}
          </div>

          {productsQuery.isLoading ? (
            <ProductSkeletons />
          ) : productsQuery.isError ? (
            <ProductError onRetry={() => void productsQuery.refetch()} />
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
                  onClick={clearFilters}
                >
                  Clear filters <ArrowIcon direction="next" />
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={productGridClass}>
                {products.map((product) => (
                  <ProductTile key={product.id} product={product} />
                ))}
              </div>
              {productResponse && productResponse.meta.last_page > 1 && (
                <nav
                  className="mt-[43px] flex items-center justify-between border-t border-rule pt-4"
                  aria-label="Product pagination"
                >
                  <button
                    className="inline-flex min-h-10 items-center gap-2 border-0 bg-transparent p-0 text-[14px] font-semibold text-ink disabled:cursor-not-allowed disabled:text-muted"
                    type="button"
                    disabled={productResponse.meta.current_page <= 1}
                    onClick={() =>
                      changePage(productResponse.meta.current_page - 1)
                    }
                  >
                    <ArrowIcon direction="previous" /> Previous
                  </button>
                  <span className="text-[12px] tabular-nums text-muted sm:text-[13px]">
                    Page {productResponse.meta.current_page} of{" "}
                    {productResponse.meta.last_page}
                  </span>
                  <button
                    className="inline-flex min-h-10 items-center gap-2 border-0 bg-transparent p-0 text-[14px] font-semibold text-ink disabled:cursor-not-allowed disabled:text-muted"
                    type="button"
                    disabled={
                      productResponse.meta.current_page >=
                      productResponse.meta.last_page
                    }
                    onClick={() =>
                      changePage(productResponse.meta.current_page + 1)
                    }
                  >
                    Next <ArrowIcon direction="next" />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="bg-charcoal text-paper">
        <div
          className={`${containerClass} flex min-h-[76px] items-center justify-between gap-[18px] text-[13px]`}
        >
          <span className="font-semibold">The Shop</span>
          <Link
            className="inline-flex min-h-11 items-center gap-[9px] text-inherit no-underline hover:underline hover:underline-offset-1"
            to="/products"
          >
            Continue browsing <ArrowIcon direction="next" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
