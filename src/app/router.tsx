import { createBrowserRouter } from 'react-router'
import { StorefrontLayout } from './StorefrontLayout'
import { HomePage } from '../features/home/HomePage'
import { ProductsPage } from '../features/products/ProductsPage'
import { ProductDetailPage } from '../features/product-detail/ProductDetailPage'
import { AuthPage } from '../features/auth/AuthPage'
import { CartPage } from '../features/cart/CartPage'
import { CheckoutPage } from '../features/checkout/CheckoutPage'
import { OrderDetailPage } from '../features/orders/OrderDetailPage'
import { OrderPage } from '../features/orders/OrderPage'

export const router = createBrowserRouter([
  {
    element: <StorefrontLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/orders/', element: <OrderPage /> },
      { path: '/orders/:orderId', element: <OrderDetailPage /> },
    ],
  },
  { path: '/login', element: <AuthPage mode="login" /> },
  { path: '/register', element: <AuthPage mode="register" /> },
])
