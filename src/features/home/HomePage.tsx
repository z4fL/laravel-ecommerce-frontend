import { useState, type SubmitEvent } from 'react'
import { useListCategories } from '../../generated/categories/categories'
import { useListPublicProducts } from '../../generated/products/products'
import { storefrontMainClass } from '../../components/storefront/storefrontStyles'
import { HomeCategories } from './HomeCategories'
import { HomeProductResults } from './HomeProductResults'
import { HomeSearchSection } from './HomeSearchSection'

const PAGE_SIZE = 8

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
  const hasActiveFilters = Boolean(submittedSearch || activeCategory)

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedSearch(searchInput.trim())
  }

  function clearFilters() {
    setSearchInput('')
    setSubmittedSearch('')
    setActiveCategory(undefined)
  }

  return (
    <main className={storefrontMainClass}>
        <HomeSearchSection
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSubmit={handleSearch}
        />
        <HomeCategories
          categories={categories}
          isLoading={categoriesQuery.isLoading}
          hasError={categoriesQuery.isError}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onRetry={() => void categoriesQuery.refetch()}
        />
        <HomeProductResults
          products={products}
          total={productResponse?.meta.total}
          isLoading={productsQuery.isLoading}
          hasError={productsQuery.isError}
          submittedSearch={submittedSearch}
          activeCategoryName={activeCategoryName}
          hasActiveFilters={hasActiveFilters}
          onRetry={() => void productsQuery.refetch()}
          onClearFilters={clearFilters}
        />
    </main>
  )
}
