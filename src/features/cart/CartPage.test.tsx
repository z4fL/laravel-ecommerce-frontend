import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from '../../api'
import { server } from '../../test/setup'
import { CartPage } from './CartPage'

const cartUrl = `${API_BASE_URL}/cart`
const cartItemUrl = `${API_BASE_URL}/cart/items/:item`
const initialItems = [
  { id: 8, product: { id: 3, name: 'Gaming Laptop', slug: 'gaming-laptop' }, quantity: 2, price_snapshot: 100_000 },
  { id: 9, product: { id: 4, name: 'Coffee Grinder', slug: 'coffee-grinder' }, quantity: 1, price_snapshot: 35_000 },
]

function cartResponse(items: typeof initialItems) {
  return { success: true, message: 'Cart loaded.', data: { id: 11, items } }
}

function renderCart() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<p>Checkout</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CartPage selection', () => {
  it('carries only selected items into checkout', async () => {
    const user = userEvent.setup()
    server.use(http.get(cartUrl, () => HttpResponse.json(cartResponse(initialItems))))

    renderCart()

    expect(await screen.findByRole('checkbox', { name: 'Select Gaming Laptop' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Select Coffee Grinder' })).toBeChecked()
    await user.click(screen.getByRole('checkbox', { name: 'Select Gaming Laptop' }))

    expect(screen.getByRole('link', { name: 'Continue to checkout' })).toHaveAttribute('href', '/checkout?items=9')
    expect(screen.getByText(/Selected units/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Remove selected (1)' })).toBeEnabled()
  })

  it('deletes all selected items and leaves the cart empty', async () => {
    const user = userEvent.setup()
    const deletedIds: number[] = []
    let remainingItems = [...initialItems]
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

    server.use(
      http.get(cartUrl, () => HttpResponse.json(cartResponse(remainingItems))),
      http.delete(cartItemUrl, ({ params }) => {
        const itemId = Number(params.item)
        deletedIds.push(itemId)
        remainingItems = remainingItems.filter((item) => item.id !== itemId)
        return HttpResponse.json({ success: true, message: 'Cart item deleted.' })
      }),
    )

    renderCart()

    await user.click(await screen.findByRole('button', { name: 'Remove selected (2)' }))

    expect(confirm).toHaveBeenCalledOnce()
    await waitFor(() => expect(deletedIds).toHaveLength(2))
    expect(new Set(deletedIds)).toEqual(new Set([8, 9]))
    expect(await screen.findByRole('heading', { name: 'Your cart is empty' })).toBeVisible()

    confirm.mockRestore()
  })
})