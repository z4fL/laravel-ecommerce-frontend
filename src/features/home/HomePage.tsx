import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router'
import { API_ORIGIN } from '../../api'
import { useListCategories } from '../../generated/categories/categories'
import { useListPublicProducts } from '../../generated/products/products'
import type { Product } from '../../generated/models'

const PAGE_SIZE = 8

const containerClass =
  'mx-auto w-[calc(100%-40px)] md:w-[min(calc(100%-64px),1400px)] lg:w-[min(calc(100%-96px),1400px)]'

const navLinkClass =
  'inline-flex min-h-11 items-center gap-2 text-xs text-inherit no-underline hover:underline hover:underline-offset-[5px] sm:text-[13px] md:text-[14px]'

const productGridClass =
  'grid grid-cols-2 gap-x-[13px] gap-y-[31px] md:grid-cols-3 md:gap-x-[21px] md:gap-y-[42px] lg:grid-cols-4'

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-[21px] stroke-current stroke-[1.7] [stroke-linecap:round]">
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.4 15.4 4.2 4.2" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-[17px] stroke-current stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]">
      <path d="M5 12h13M12 6l6 6-6 6" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-[18px] stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]">
      <path d="M5.5 8.5h13l1 12h-15l1-12Z" />
      <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" />
    </svg>
  )
}

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
        <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" className="size-[42px] stroke-current stroke-[1.15] [stroke-linecap:round] [stroke-linejoin:round]">
          <rect x="7.5" y="9.5" width="33" height="29" rx="1" />
          <circle cx="18" cy="19" r="3" />
          <path d="m10 34 9-9 6 6 4-4 9 8" />
        </svg>
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

function ProductTile({ product }: { product: Product }) {
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

function ProductSkeletons() {
  return (
    <div className={productGridClass} role="status" aria-label="Loading products">
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

function HomeError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[280px] flex-col items-start justify-center border-t border-rule py-[38px]" role="alert">
      <h3 className="m-0 text-[25px] font-[560]">Products couldn’t load.</h3>
      <p className="mb-[17px] mt-2 text-muted">Check your connection, then try again.</p>
      <button
        className="inline-flex min-h-10 items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-[14px] font-semibold text-ink no-underline hover:underline hover:underline-offset-[5px]"
        type="button"
        onClick={onRetry}
      >
        Try again <ArrowIcon />
      </button>
    </div>
  )
}

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>()
  const [searchInput, setSearchInput] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')

  const categoriesQuery = useListCategories({ query: { staleTime: 5 * 60 * 1000 } })
  const productsQuery = useListPublicProducts(
    {
      page: 1,
      per_page: PAGE_SIZE,
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(submittedSearch ? { search: submittedSearch } : {}),
    },
    { query: { staleTime: 60 * 1000 } },
  )

  const categories = categoriesQuery.data?.status === 200 ? categoriesQuery.data.data.data : []
  const productResponse = productsQuery.data?.status === 200 ? productsQuery.data.data : undefined
  const products = productResponse?.data ?? []
  const activeCategoryName = categories.find((category) => category.slug === activeCategory)?.name

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedSearch(searchInput.trim())
  }

  function clearFilters() {
    setSearchInput('')
    setSubmittedSearch('')
    setActiveCategory(undefined)
  }

  const resultsTitle = submittedSearch ? 'Search results' : activeCategoryName ?? 'All products'

  return (
    <div className="min-h-dvh bg-bone text-[15px] leading-normal text-ink">
      <header className="bg-charcoal text-paper">
        <div className={`${containerClass} flex min-h-[68px] items-center justify-between gap-7 md:min-h-[76px]`}>
          <Link className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-base font-semibold text-inherit no-underline sm:gap-3 sm:text-[18px]" to="/" aria-label="The Shop home">
            <span className="flex h-[22px] items-center gap-[3px]" aria-hidden="true">
              <span className="block h-4 w-0.5 bg-spectral-citron" />
            </span>
            <span>The Shop</span>
          </Link>
          <nav className="flex items-center gap-[13px] sm:gap-[18px] md:gap-8" aria-label="Main navigation">
            <Link className={navLinkClass} to="/products">
              Products
            </Link>
            <Link className={navLinkClass} to="/cart">
              <span className="hidden sm:inline"><BagIcon /></span>
              <span>Cart</span>
            </Link>
            <Link className={navLinkClass} to="/login">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className={`${containerClass} pb-[76px] pt-12 md:pb-28 md:pt-[68px]`}>
        <section className="grid grid-cols-1 gap-[30px] pb-[38px] md:grid-cols-[minmax(0,1fr)_minmax(270px,0.76fr)] md:items-end md:gap-[42px] md:pb-[55px] lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] lg:gap-[72px]" aria-labelledby="home-title">
          <div>
            <h1 className="m-0 max-w-[390px] text-[46px] font-[520] leading-[0.99] tracking-normal sm:max-w-[590px] sm:text-[52px] md:max-w-[760px] md:text-[58px] lg:text-[68px]" id="home-title">
              <span className="bg-spectral-citron box-decoration-clone">
                What are you looking for?
              </span>
            </h1>
            <p className="mt-[14px] max-w-[42ch] text-[15px] text-muted md:mt-[22px] md:text-base">
              Search published products, or start with a category.
            </p>
          </div>

          <form className="w-full md:max-w-[490px] md:justify-self-end" onSubmit={handleSearch} role="search">
            <label className="mb-[9px] block text-[13px] font-semibold" htmlFor="home-search-input">
              Search products
            </label>
            <div className="flex min-h-[58px] border border-rule-strong bg-paper focus-within:border-marker-olive">
              <input
                className="min-w-0 w-full border-0 bg-transparent px-[18px] text-[15px] text-ink outline-0 placeholder:text-muted focus:outline-0"
                id="home-search-input"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Product name or keyword"
              />
              <button
                className="grid flex-[0_0_58px] place-items-center border-0 bg-charcoal text-spectral-citron hover:bg-charcoal-hover"
                type="submit"
                aria-label="Search products"
              >
                <SearchIcon />
              </button>
            </div>
          </form>
        </section>

        <section className="border-y border-rule pb-[18px] pt-4 md:pb-[25px] md:pt-[19px]" aria-labelledby="home-categories-title">
          <div className="mb-3 flex items-center gap-[18px]">
            <h2 className="m-0 shrink-0 text-[12px] font-semibold text-muted" id="home-categories-title">Browse categories</h2>
            <span className="h-px w-full bg-rule-soft" aria-hidden="true" />
          </div>

          {categoriesQuery.isLoading ? (
            <div className="flex min-h-[42px] items-center gap-[23px] md:gap-[29px]" role="status">
              <span className="sr-only">Loading categories</span>
              <i className="block h-[9px] w-[76px] bg-skeleton" />
              <i className="block h-[9px] w-[108px] bg-skeleton" />
              <i className="block h-[9px] w-[84px] bg-skeleton" />
              <i className="block h-[9px] w-[124px] bg-skeleton" />
            </div>
          ) : categoriesQuery.isError && categories.length === 0 ? (
            <div className="flex min-h-[42px] items-center gap-4 text-[13px] text-muted" role="alert">
              <span>Categories couldn’t load.</span>
              <button className="border-0 border-b border-current bg-transparent p-1 px-0 text-ink" type="button" onClick={() => void categoriesQuery.refetch()}>
                Try again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <p className="m-0 flex min-h-[42px] items-center text-[13px] text-muted">No categories are available right now.</p>
          ) : (
            <div
              className="flex items-center gap-[23px] overflow-x-auto [scrollbar-color:#999a8d_transparent] [scrollbar-width:thin] md:gap-[29px]"
              role="group"
              aria-label="Filter products by category"
            >
              <button
                className="group/category relative inline-flex min-h-[42px] shrink-0 items-center gap-[9px] whitespace-nowrap border-0 bg-transparent pb-0.5 text-[14px] text-ink-soft hover:text-ink aria-pressed:font-semibold aria-pressed:text-ink"
                type="button"
                aria-pressed={activeCategory === undefined}
                onClick={() => setActiveCategory(undefined)}
              >
                <span className="hidden items-center gap-0.5 group-aria-pressed/category:inline-flex" aria-hidden="true">
                  <span className="h-[13px] w-0.5 bg-marker-olive" />
                  <span className="h-[9px] w-0.5 bg-marker-olive" />
                </span>
                All products
              </button>
              {categories.map((category) => (
                <button
                  className="group/category relative inline-flex min-h-[42px] shrink-0 items-center gap-[9px] whitespace-nowrap border-0 bg-transparent pb-0.5 text-[14px] text-ink-soft hover:text-ink aria-pressed:font-semibold aria-pressed:text-ink"
                  type="button"
                  key={category.id}
                  aria-pressed={activeCategory === category.slug}
                  onClick={() => setActiveCategory(category.slug)}
                >
                  <span className="hidden items-center gap-0.5 group-aria-pressed/category:inline-flex" aria-hidden="true">
                    <span className="h-[13px] w-0.5 bg-marker-olive" />
                    <span className="h-[9px] w-0.5 bg-marker-olive" />
                  </span>
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="pt-8 md:pt-[43px]" aria-labelledby="home-results-title" aria-busy={productsQuery.isLoading}>
          <div className="mb-[25px] flex items-start justify-between gap-5 sm:items-end">
            <div>
              <h2 className="m-0 text-[26px] font-[560] leading-[1.15] md:text-[30px]" id="home-results-title">{resultsTitle}</h2>
              {submittedSearch && <p className="mt-[5px] mb-0 text-[13px] text-muted">For “{submittedSearch}”</p>}
            </div>
            <div className="flex flex-col-reverse items-end gap-0.5 sm:flex-row sm:items-center sm:gap-[15px] md:gap-[25px]">
              {productResponse && (
                <span className="text-[11px] tabular-nums text-muted sm:text-[13px]">
                  {productResponse.meta.total} {productResponse.meta.total === 1 ? 'product' : 'products'}
                </span>
              )}
              <Link
                className="inline-flex min-h-[30px] items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-xs font-semibold text-ink no-underline hover:underline hover:underline-offset-[5px] sm:min-h-10 sm:text-[14px]"
                to="/products"
              >
                View all <ArrowIcon />
              </Link>
            </div>
          </div>

          {productsQuery.isLoading ? (
            <ProductSkeletons />
          ) : productsQuery.isError && products.length === 0 ? (
            <HomeError onRetry={() => void productsQuery.refetch()} />
          ) : products.length === 0 ? (
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
              {(submittedSearch || activeCategory) && (
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-[14px] font-semibold text-ink no-underline hover:underline hover:underline-offset-[5px]"
                  type="button"
                  onClick={clearFilters}
                >
                  Show all products <ArrowIcon />
                </button>
              )}
            </div>
          ) : (
            <>
              {productsQuery.isError && (
                <div className="mb-5 flex items-center justify-between gap-4 border-y border-rule-strong py-3 text-[13px] text-muted" role="alert">
                  Couldn’t refresh products. Showing the last loaded results.
                  <button className="border-0 border-b border-current bg-transparent p-1 px-0 text-ink" type="button" onClick={() => void productsQuery.refetch()}>
                    Try again
                  </button>
                </div>
              )}
              <div className={productGridClass}>
                {products.map((product) => <ProductTile key={product.id} product={product} />)}
              </div>
              <div className="mt-[43px] flex justify-center">
                <Link
                  className="inline-flex min-h-10 items-center justify-center gap-[11px] border-0 bg-transparent p-0 text-[14px] font-semibold text-ink no-underline hover:underline hover:underline-offset-[5px]"
                  to="/products"
                >
                  Browse the full catalog <ArrowIcon />
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="bg-charcoal text-paper">
        <div className={`${containerClass} flex min-h-[76px] items-center justify-between gap-[18px] text-[13px]`}>
          <span className="font-semibold">The Shop</span>
          <Link className="inline-flex min-h-11 items-center gap-[9px] text-inherit no-underline hover:underline hover:underline-offset-1" to="/products">
            Continue browsing <ArrowIcon />
          </Link>
        </div>
      </footer>
    </div>
  )
}
