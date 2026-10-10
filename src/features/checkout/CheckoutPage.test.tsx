import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '../../api'
import { server } from '../../test/setup'
import { CheckoutPage } from './CheckoutPage'
import { OrderDetailPage } from '../orders/OrderDetailPage'

const cartUrl = `${API_BASE_URL}/cart`
const addressesUrl = `${API_BASE_URL}/shipping-addresses`
const checkoutUrl = `${API_BASE_URL}/checkout`
const ordersUrl = `${API_BASE_URL}/orders`

const addresses = [
  {
    id: 21,
    user_id: 5,
    recipient_name: 'Sam Shopper',
    phone: '+62 812-0000-0000',
    label: 'rumah',
    province: 'Jawa Barat',
    city: 'Bandung',
    district: 'Sukajadi',
    postal_code: '40162',
    address: 'Jl. Melati No. 12',
    is_default: true,
  },
  {
    id: 22,
    user_id: 5,
    recipient_name: 'Sam Shopper',
    phone: '+62 812-0000-0000',
    label: 'kantor',
    province: 'Jawa Barat',
    city: 'Bandung',
    district: 'Coblong',
    postal_code: '40135',
    address: 'Jl. Dago No. 7',
    is_default: false,
  },
]

const cartItem = {
  id: 8,
  product: { id: 3, name: 'Gaming Laptop', slug: 'gaming-laptop' },
  quantity: 2,
  price_snapshot: 100_000,
}

function cartResponse(items: typeof cartItem[] | { id: number; product: null; quantity: number; price_snapshot: number }[]) {
  return {
    success: true,
    message: 'Cart loaded.',
    data: { id: 11, items },
  }
}

function addressResponse() {
  return { success: true, message: 'Addresses loaded.', data: addresses }
}

function previewResponse(addressId: number) {
  return {
    success: true,
    message: 'Checkout preview loaded.',
    data: {
      shipping_address: addresses.find((address) => address.id === addressId) ?? addresses[0],
      summary: { items_count: 1, subtotal: 200_000 },
      items: [{
        id: 8,
        product_id: 3,
        product_sku: 'SKU-003',
        product_name: 'Gaming Laptop',
        quantity: 2,
        unit_price: 100_000,
        subtotal: 200_000,
      }],
    },
  }
}

function renderCheckout() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CheckoutPage', () => {
  it('refreshes the preview for the selected address and creates an order before payment', async () => {
    const user = userEvent.setup()
    const previewBodies: unknown[] = []
    let orderBody: unknown
    let paymentRequests = 0

    server.use(
      http.get(cartUrl, () => HttpResponse.json(cartResponse([cartItem]))),
      http.get(addressesUrl, () => HttpResponse.json(addressResponse())),
      http.post(checkoutUrl, async ({ request }) => {
        const body = await request.json() as { shipping_address_id: number }
        previewBodies.push(body)
        return HttpResponse.json(previewResponse(body.shipping_address_id))
      }),
      http.post(ordersUrl, async ({ request }) => {
        orderBody = await request.json()
        return HttpResponse.json({
          success: true,
          message: 'Order created.',
          data: {
            id: 41,
            order_number: 'ORD-0041',
            status: 'pending_payment',
            items_count: 1,
            items: [{
              id: 51,
              order_id: 41,
              product_id: 3,
              product_sku: 'SKU-003',
              product_name: 'Gaming Laptop',
              price: 100_000,
              quantity: 2,
              subtotal: 200_000,
            }],
            subtotal: 200_000,
            total: 225_000,
            created_at: '2026-10-10T00:00:00Z',
          },
        }, { status: 201 })
      }),
      http.post(`${ordersUrl}/41/payment`, () => {
        paymentRequests += 1
        return HttpResponse.json({
          success: true,
          message: 'Payment created.',
          data: {
            id: 61,
            order_id: 41,
            gateway: 'midtrans',
            gateway_transaction_id: null,
            payment_method: null,
            status: 'pending',
            amount: 225_000,
            payment_url: 'https://payments.example/continue',
            expired_at: null,
            paid_at: null,
            snap_token: null,
          },
        }, { status: 201 })
      }),
      http.get(`${ordersUrl}/41`, () => HttpResponse.json({
        success: true,
        message: 'Order loaded.',
        data: {
          id: 41,
          order_number: 'ORD-0041',
          status: 'pending_payment',
          items_count: 1,
          items: [{
            id: 51,
            order_id: 41,
            product_id: 3,
            product_sku: 'SKU-003',
            product_name: 'Gaming Laptop',
            price: 100_000,
            quantity: 2,
            subtotal: 200_000,
          }],
          subtotal: 200_000,
          total: 225_000,
          created_at: '2026-10-10T00:00:00Z',
        },
      })),
    )

    renderCheckout()

    expect(await screen.findByRole('radio', { name: /rumah/ })).toBeChecked()
    await waitFor(() => expect(previewBodies).toEqual([{ shipping_address_id: 21 }]))
    await user.click(screen.getByRole('radio', { name: /kantor/ }))
    await waitFor(() => expect(previewBodies).toEqual([
      { shipping_address_id: 21 },
      { shipping_address_id: 22 },
    ]))
    expect(screen.getByText('Not provided')).toBeVisible()
    expect(screen.getByText('Not available before order')).toBeVisible()

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(await screen.findByRole('dialog', { name: 'Your order is ready for payment' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Pay with Midtrans' })).toHaveAttribute(
      'href',
      'https://payments.example/continue',
    )
    expect(orderBody).toEqual({ shipping_address_id: 22 })
    expect(paymentRequests).toBe(1)
    expect(screen.getByText(/Order ORD-0041 created/)).toBeVisible()
    expect(screen.getByText('Rp225.000')).toBeVisible()

    expect(screen.getByRole('button', { name: 'View order details' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Close payment dialog and view order' }))
    expect(await screen.findByRole('heading', { name: 'Order details' })).toBeVisible()
    expect(screen.getByText('Gaming Laptop')).toBeVisible()
  })

  it('shows an empty-cart state without requesting addresses', async () => {
    let addressRequests = 0
    server.use(
      http.get(cartUrl, () => HttpResponse.json(cartResponse([]))),
      http.get(addressesUrl, () => {
        addressRequests += 1
        return HttpResponse.json(addressResponse())
      }),
    )

    renderCheckout()

    expect(await screen.findByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute('href', '/products')
    expect(addressRequests).toBe(0)
  })

  it('blocks an unavailable cart item even after the shopper acknowledges the missing total', async () => {
    const user = userEvent.setup()
    const invalidItem = { id: 9, product: null, quantity: 1, price_snapshot: 12_000 }
    server.use(
      http.get(cartUrl, () => HttpResponse.json(cartResponse([invalidItem]))),
      http.get(addressesUrl, () => HttpResponse.json(addressResponse())),
      http.post(checkoutUrl, ({ request }) => {
        const addressId = Number(new URL(request.url).searchParams.get('shipping_address_id'))
        return HttpResponse.json(previewResponse(addressId || addresses[0].id))
      }),
    )

    renderCheckout()

    expect(await screen.findByRole('alert')).toHaveTextContent('One or more cart items are unavailable.')
    await user.click(await screen.findByRole('checkbox'))
    expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled()
  })
})
