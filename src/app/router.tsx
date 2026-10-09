import { createBrowserRouter } from 'react-router'
import { HomePage } from '../features/home/HomePage'
import { ProductsPage } from '../features/products/ProductsPage'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main>
      <h1>{title}</h1>
    </main>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/products', element: <ProductsPage /> },
  { path: '/login', element: <PlaceholderPage title="Login" /> },
  { path: '/cart', element: <PlaceholderPage title="Cart" /> },
])
