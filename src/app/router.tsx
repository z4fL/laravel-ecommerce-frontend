import { createBrowserRouter } from 'react-router'
import { StorefrontLayout } from './StorefrontLayout'
import { HomePage } from '../features/home/HomePage'
import { ProductsPage } from '../features/products/ProductsPage'
import { ProductDetailPage } from '../features/product-detail/ProductDetailPage'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main>
      <h1>{title}</h1>
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
  { path: '/login', element: <PlaceholderPage title="Login" /> },
  { path: '/cart', element: <PlaceholderPage title="Cart" /> },
])
