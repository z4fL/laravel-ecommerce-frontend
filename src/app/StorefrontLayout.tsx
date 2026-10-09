import { Outlet, useLocation } from 'react-router'
import { StorefrontFooter } from '../components/storefront/StorefrontFooter'
import { StorefrontHeader } from '../components/storefront/StorefrontHeader'

export function StorefrontLayout() {
  const { pathname } = useLocation()
  const activePage = pathname === '/products' ? 'products' : 'home'

  return (
    <div className="min-h-dvh bg-bone text-[15px] leading-normal text-ink">
      <StorefrontHeader activePage={activePage} />
      <Outlet />
      <StorefrontFooter />
    </div>
  )
}
