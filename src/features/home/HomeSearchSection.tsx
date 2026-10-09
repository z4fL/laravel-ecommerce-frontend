import { LuSearch } from 'react-icons/lu'
import type { SubmitEvent } from 'react'

interface HomeSearchSectionProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
}

export function HomeSearchSection({
  searchInput,
  onSearchInputChange,
  onSubmit,
}: HomeSearchSectionProps) {
  return (
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

      <form className="w-full md:max-w-[490px] md:justify-self-end" onSubmit={onSubmit} role="search">
        <label className="mb-[9px] block text-[13px] font-semibold" htmlFor="home-search-input">
          Search products
        </label>
        <div className="flex min-h-[58px] border border-rule-strong bg-paper focus-within:border-marker-olive">
          <input
            className="min-w-0 w-full border-0 bg-transparent px-[18px] text-[15px] text-ink outline-0 placeholder:text-muted focus:outline-0"
            id="home-search-input"
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Product name or keyword"
          />
          <button
            className="grid flex-[0_0_58px] place-items-center border-0 bg-charcoal text-spectral-citron hover:bg-charcoal-hover"
            type="submit"
            aria-label="Search products"
          >
            <LuSearch aria-hidden="true" className="size-[21px]" />
          </button>
        </div>
      </form>
    </section>
  )
}
