import { createBrowserRouter } from 'react-router'
import { HomePage } from '../features/home/HomePage'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main>
      <h1>{title}</h1>
    </main>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/products', element: <PlaceholderPage title="Products" /> },
  { path: '/login', element: <PlaceholderPage title="Login" /> },
  { path: '/cart', element: <PlaceholderPage title="Cart" /> },
])
