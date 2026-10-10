import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { API_BASE_URL, clearAccessToken, setAccessToken } from '../../api'
import type { Order } from '../../generated/models'
import { server } from '../../test/setup'
import { OrderPage } from './OrderPage'

const ordersUrl = `${API_BASE_URL}/orders`
const paymentUrl = `${API_BASE_URL}/orders/:order/payment`
const cancelUrl = `${API_BASE_URL}/orders/:order/cancel`

const pendingOrder = {
  id: 41,
  order_number: 'ORD-2026-041',
  status: 'pending_payment' as const,
  items_count: 1,
  items: [{ id: 9, order_id: 41, product_id: 8, product_sku: 'SKU-8', product_name: 'Coffee grinder', price: 120_000, quantity: 1, subtotal: 120_000 }],
  subtotal: 120_000,
  total: 120_000,
  created_at: '2026-10-09T09:00:00Z',
}

const shippedOrder = {
  ...pendingOrder,
  id: 42,
  order_number: 'ORD-2026-042',
  status: 'shipped' as const,
  created_at: '2026-10-10T09:00:00Z',
}

function listResponse(orders: Order[]) {
  return {
    success: true,
    message: 'Orders loaded.',
    data: orders,
    meta: { total: orders.length, per_page: 12, current_page: 1, last_page: 1, count: orders.length, from: orders.length ? 1 : null, to: orders.length || null },
    links: { first: null, last: null, prev: null, next: null },
  }
}

function renderOrders(initialEntry = '/orders') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/orders/:orderId" element={<p>Order details</p>} />
          <Route path="/login" element={<p>Sign-in page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => setAccessToken('Bearer', 'test-token'))
afterEach(() => clearAccessToken())

describe('OrderPage', () => {
  it('filters the loaded page by status and links each order to its details', async () => {
    const user = userEvent.setup()
    server.use(http.get(ordersUrl, () => HttpResponse.json(listResponse([pendingOrder, shippedOrder]))))

    renderOrders()

    expect(await screen.findByText(/ORD-2026-041/)).toBeVisible()
    expect(screen.getAllByRole('link', { name: 'View details' })[0]).toHaveAttribute('href', '/orders/42')
    await user.click(screen.getByRole('button', { name: 'In progress' }))

    expect(await screen.findByText(/ORD-2026-042/)).toBeVisible()
    expect(screen.queryByText(/ORD-2026-041/)).not.toBeInTheDocument()
    expect(screen.getByText('Shipped', { selector: 'p' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'In progress' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps pagination available when the selected bucket is empty on the current page', async () => {
    const user = userEvent.setup()
    server.use(http.get(ordersUrl, ({ request }) => {
      const page = new URL(request.url).searchParams.get('page')
      const currentPage = page === '2' ? 2 : 1
      const order = currentPage === 2 ? shippedOrder : pendingOrder
      return HttpResponse.json({
        ...listResponse([order]),
        meta: { total: 2, per_page: 1, current_page: currentPage, last_page: 2, count: 1, from: currentPage, to: currentPage },
      })
    }))

    renderOrders('/orders?status=in-progress')

    expect(await screen.findByRole('heading', { name: 'No in progress orders on this page' })).toBeVisible()
    expect(screen.getByText('Page 1 of 2')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText(/ORD-2026-042/)).toBeVisible()
    expect(screen.getByText('Page 2 of 2')).toBeVisible()
  })

  it('creates a payment and exposes the returned payment link', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(ordersUrl, () => HttpResponse.json(listResponse([pendingOrder]))),
      http.post(paymentUrl, () => HttpResponse.json({
        success: true,
        message: 'Payment ready.',
        data: {
          id: 3,
          order_id: pendingOrder.id,
          gateway: 'midtrans',
          gateway_transaction_id: null,
          payment_method: null,
          status: 'pending',
          amount: pendingOrder.total,
          payment_url: 'https://payments.example/continue',
          expired_at: null,
          paid_at: null,
          snap_token: null,
        },
      }, { status: 201 })),
    )

    renderOrders()
    await user.click(await screen.findByRole('button', { name: 'Pay' }))

    expect(await screen.findByRole('link', { name: 'Continue to payment' })).toHaveAttribute('href', 'https://payments.example/continue')
  })

  it('requires inline confirmation before cancelling and refreshes the order list', async () => {
    const user = userEvent.setup()
    let orderStatus: 'pending_payment' | 'cancelled' = 'pending_payment'
    server.use(
      http.get(ordersUrl, () => HttpResponse.json(listResponse([{ ...pendingOrder, status: orderStatus }]))),
      http.post(cancelUrl, () => {
        orderStatus = 'cancelled'
        return HttpResponse.json({ success: true, message: 'Order cancelled.', data: { ...pendingOrder, status: orderStatus } })
      }),
    )

    renderOrders()
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Cancel this order?')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Confirm cancel' }))

    expect(await screen.findByText('Cancelled', { selector: 'p' })).toBeVisible()
    await waitFor(() => expect(screen.queryByText('Cancel this order?')).not.toBeInTheDocument())
  })

  it('offers a retry after the order request fails', async () => {
    const user = userEvent.setup()
    let attempts = 0
    server.use(http.get(ordersUrl, () => {
      attempts += 1
      if (attempts === 1) return HttpResponse.json({ message: 'Temporary failure.' }, { status: 500 })
      return HttpResponse.json(listResponse([pendingOrder]))
    }))

    renderOrders()
    expect(await screen.findByRole('heading', { name: 'Orders could not load' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText(/ORD-2026-041/)).toBeVisible()
  })

  it('directs signed-out shoppers to sign in without requesting their orders', async () => {
    clearAccessToken()
    renderOrders()

    expect(await screen.findByRole('heading', { name: 'Sign in to see your orders' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
  })
})
