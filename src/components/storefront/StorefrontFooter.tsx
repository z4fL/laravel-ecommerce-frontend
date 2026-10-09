import { Link } from 'react-router'
import { LuArrowRight } from 'react-icons/lu'
import { storefrontContainerClass } from './storefrontStyles'

export function StorefrontFooter() {
  return (
    <footer className="bg-charcoal text-paper">
      <div className={`${storefrontContainerClass} flex min-h-[76px] items-center justify-between gap-[18px] text-[13px]`}>
        <span className="font-semibold">The Shop</span>
        <Link className="inline-flex min-h-11 items-center gap-[9px] text-inherit no-underline hover:underline hover:underline-offset-1" to="/products">
          Continue browsing <LuArrowRight aria-hidden="true" className="size-[17px]" />
        </Link>
      </div>
    </footer>
  )
}