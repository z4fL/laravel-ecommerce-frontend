import { Link } from 'react-router'
import { LuShoppingBag } from 'react-icons/lu'
import { storefrontContainerClass } from './storefrontStyles'

const navLinkClass =
  'inline-flex min-h-11 items-center gap-2 text-xs text-inherit no-underline hover:underline hover:underline-offset-[5px] sm:text-[13px] md:text-[14px]'

export function StorefrontHeader({
  activePage,
}: {
  activePage: 'home' | 'products'
}) {
  return (
    <header className="bg-charcoal text-paper">
      <div className={`${storefrontContainerClass} flex min-h-[68px] items-center justify-between gap-7 md:min-h-[76px]`}>
        <Link
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-base font-semibold text-inherit no-underline sm:gap-3 sm:text-[18px]"
          to="/"
          aria-label="The Shop home"
        >
          <span className="flex h-[22px] items-center gap-[3px]" aria-hidden="true">
            <span className="block h-4 w-0.5 bg-spectral-citron" />
          </span>
          <span>The Shop</span>
        </Link>

        <nav className="flex items-center gap-[13px] sm:gap-[18px] md:gap-8" aria-label="Main navigation">
          <Link
            className={`${navLinkClass} ${activePage === 'products' ? 'underline underline-offset-[5px]' : ''}`}
            to="/products"
            aria-current={activePage === 'products' ? 'page' : undefined}
          >
            Products
          </Link>

          <Link className={navLinkClass} to="/cart">
            <LuShoppingBag aria-hidden="true" className="size-[18px]" />
            <span>Cart</span>
          </Link>

          <Link className={navLinkClass} to="/login">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  )
}
