import { Link } from 'react-router'
import { LuArrowRight, LuShoppingBag } from 'react-icons/lu'
import { containerClass } from './homeStyles'

const navLinkClass =
  'inline-flex min-h-11 items-center gap-2 text-xs text-inherit no-underline hover:underline hover:underline-offset-[5px] sm:text-[13px] md:text-[14px]'

export function HomeHeader() {
  return (
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
            <span className="hidden sm:inline"><LuShoppingBag aria-hidden="true" className="size-[18px]" /></span>
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

export function HomeFooter() {
  return (
    <footer className="bg-charcoal text-paper">
      <div className={`${containerClass} flex min-h-[76px] items-center justify-between gap-[18px] text-[13px]`}>
        <span className="font-semibold">The Shop</span>
        <Link className="inline-flex min-h-11 items-center gap-[9px] text-inherit no-underline hover:underline hover:underline-offset-1" to="/products">
          Continue browsing <LuArrowRight aria-hidden="true" className="size-[17px]" />
        </Link>
      </div>
    </footer>
  )
}
