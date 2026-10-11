import { Outlet } from 'react-router'
import { StorefrontFooter } from '../components/storefront/StorefrontFooter'
import { StorefrontHeader } from '../components/storefront/StorefrontHeader'
import { CustomerServiceAssistant } from '../features/assistant/CustomerServiceAssistant'

export function StorefrontLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-bone text-[15px] leading-normal text-ink">
      <StorefrontHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <StorefrontFooter />
      <CustomerServiceAssistant />
    </div>
  )
}
