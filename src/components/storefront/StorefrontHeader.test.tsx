import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { clearAccessToken, setAccessToken } from '../../api'
import { StorefrontHeader } from './StorefrontHeader'

describe('StorefrontHeader', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('shows sign in when logged out', () => {
    render(
      <MemoryRouter>
        <StorefrontHeader />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows logout when logged in', () => {
    setAccessToken('Bearer', 'demo-token')

    render(
      <MemoryRouter>
        <StorefrontHeader />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
  })

  it.each(['/products', '/products/demo-product'])(
    'marks Products active at %s',
    (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <StorefrontHeader />
        </MemoryRouter>,
      )

      expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute(
        'aria-current',
        'page',
      )
    },
  )

  it('marks Cart active at /cart', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <StorefrontHeader />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})
