import type { Category } from '../../generated/models'

interface HomeCategoriesProps {
  categories: Category[]
  isLoading: boolean
  hasError: boolean
  activeCategory: string | undefined
  onSelectCategory: (category: string | undefined) => void
  onRetry: () => void
}

export function HomeCategories({
  categories,
  isLoading,
  hasError,
  activeCategory,
  onSelectCategory,
  onRetry,
}: HomeCategoriesProps) {
  return (
    <section className="border-y border-rule pb-[18px] pt-4 md:pb-[25px] md:pt-[19px]" aria-labelledby="home-categories-title">
      <div className="mb-3 flex items-center gap-[18px]">
        <h2 className="m-0 shrink-0 text-[12px] font-semibold text-muted" id="home-categories-title">Browse categories</h2>
        <span className="h-px w-full bg-rule-soft" aria-hidden="true" />
      </div>

      {isLoading ? (
        <div className="flex min-h-[42px] items-center gap-[23px] md:gap-[29px]" role="status">
          <span className="sr-only">Loading categories</span>
          <i className="block h-[9px] w-[76px] bg-skeleton" />
          <i className="block h-[9px] w-[108px] bg-skeleton" />
          <i className="block h-[9px] w-[84px] bg-skeleton" />
          <i className="block h-[9px] w-[124px] bg-skeleton" />
        </div>
      ) : hasError && categories.length === 0 ? (
        <div className="flex min-h-[42px] items-center gap-4 text-[13px] text-muted" role="alert">
          <span>Categories couldn’t load.</span>
          <button className="border-0 border-b border-current bg-transparent p-1 px-0 text-ink" type="button" onClick={onRetry}>
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
          <CategoryButton
            active={activeCategory === undefined}
            label="All products"
            onClick={() => onSelectCategory(undefined)}
          />
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              active={activeCategory === category.slug}
              label={category.name}
              onClick={() => onSelectCategory(category.slug)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CategoryButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="group/category relative inline-flex min-h-[42px] shrink-0 items-center gap-[9px] whitespace-nowrap border-0 bg-transparent pb-0.5 text-[14px] text-ink-soft hover:text-ink aria-pressed:font-semibold aria-pressed:text-ink"
      type="button"
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="hidden items-center gap-0.5 group-aria-pressed/category:inline-flex" aria-hidden="true">
        <span className="h-[13px] w-0.5 bg-marker-olive" />
        <span className="h-[9px] w-0.5 bg-marker-olive" />
      </span>
      {label}
    </button>
  )
}
