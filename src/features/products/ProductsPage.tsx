import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { useListPublicProducts } from "../../generated/products/products";
import { storefrontMainClass } from "../../components/storefront/storefrontStyles";
import { StorefrontProductTile } from "../../components/storefront/StorefrontProductTile";
import { ProductSearchFilters } from "./ProductSearchFilters";
import { ProductCatalog } from "./ProductCatalog";

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

function getPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getPrice(value: string | null) {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
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
    <main className={storefrontMainClass}>
        <h1 className="m-0 text-[46px] font-[520] leading-[0.99] tracking-normal sm:text-[52px] md:text-[58px] lg:text-[68px]">
          <span className="bg-spectral-citron box-decoration-clone">
            Products
          </span>
        </h1>

        <ProductSearchFilters
          searchDraft={searchDraft}
          onSearchChange={setSearchDraft}
          category={category}
          observedCategories={observedCategories}
          minPriceValue={minPriceValue}
          maxPriceValue={maxPriceValue}
          inStock={inStock}
          sort={sort}
          sortOptions={SORT_OPTIONS}
          perPage={perPage}
          pageSizeOptions={pageSizeOptions}
          mobileControlsOpen={mobileControlsOpen}
          onMobileControlsToggle={() =>
            setMobileControlsOpen((open) => !open)
          }
          onFilterChange={updateFilters}
        />

        <ProductCatalog
          products={products}
          meta={productResponse?.meta}
          isLoading={productsQuery.isLoading}
          isError={productsQuery.isError}
          hasActiveFilters={hasActiveFilters}
          onRetry={() => void productsQuery.refetch()}
          onClearFilters={clearFilters}
          onChangePage={changePage}
        />

    </main>
  );
}
