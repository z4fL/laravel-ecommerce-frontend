import { createBrowserRouter } from 'react-router'
import { StorefrontLayout } from './StorefrontLayout'
import { HomePage } from '../features/home/HomePage'
import { ProductsPage } from '../features/products/ProductsPage'
import { ProductDetailPage } from '../features/product-detail/ProductDetailPage'
import { AuthPage } from '../features/auth/AuthPage'

function CartPlaceholder() {
  return (
    <main>
      <h1>Cart</h1>
    </main>
  )
}

export const router = createBrowserRouter([
  {
    element: <StorefrontLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
    ],
  },
  { path: '/login', element: <AuthPage mode="login" /> },
  { path: '/register', element: <AuthPage mode="register" /> },
  { path: '/cart', element: <CartPlaceholder /> },
])
