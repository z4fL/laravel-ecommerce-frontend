import { useState, useCallback } from 'react'
import type { AssistantMessage } from './types'
import { hasAccessToken } from '../../api'
import { listMyOrders, getMyOrder } from '../../generated/orders/orders'
import { listShippingAddresses } from '../../generated/shipping-addresses/shipping-addresses'
import type { Order, ShippingAddress } from '../../generated/models'

export function useAssistantService() {
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((msg: Omit<AssistantMessage, 'id' | 'timestamp'>) => {
    const newMessage: AssistantMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage
  }, [])

  const handleInquiry = useCallback(
    async (queryText: string) => {
      const query = queryText.trim()
      if (!query) return

      // Add user message
      addMessage({
        role: 'user',
        type: 'text',
        content: query,
      })

      setIsLoading(true)

      const lower = query.toLowerCase()

      // Handle Capabilities Inquiry
      if (
        lower.includes('help') ||
        lower.includes('capability') ||
        lower.includes('capabilities') ||
        lower.includes('what can') ||
        lower.includes('assistant do') ||
        lower.includes('support')
      ) {
        setIsLoading(false)
        addMessage({
          role: 'assistant',
          type: 'capabilities',
          content: 'Here is what I can assist you with based on current store capabilities:',
        })
        return
      }

      // Handle Authentication check for data fetching
      const isAuth = hasAccessToken()

      // 1. Direct Order Number or Order ID lookup: e.g. "order 1", "order #12", "status of order 3"
      const orderMatch = lower.match(/order\s*(?:#|no\.?|id)?\s*(\d+)/i) || lower.match(/^#?(\d+)$/)
      if (orderMatch && orderMatch[1]) {
        const orderId = Number(orderMatch[1])

        if (!isAuth) {
          setIsLoading(false)
          addMessage({
            role: 'assistant',
            type: 'text',
            content: `Please sign in to your customer account to view details and status for order #${orderId}.`,
          })
          return
        }

        try {
          const res = await getMyOrder(orderId)
          setIsLoading(false)

          if (res.status === 200 && res.data.data) {
            const order: Order = res.data.data
            addMessage({
              role: 'assistant',
              type: 'order-detail',
              content: `Here are the verified details for order #${orderId}:`,
              data: { order },
            })
          } else if (res.status === 404) {
            addMessage({
              role: 'assistant',
              type: 'error',
              content: `Order #${orderId} was not found in your account. Please verify the order number.`,
            })
          } else {
            addMessage({
              role: 'assistant',
              type: 'error',
              content: `Unable to retrieve order #${orderId} (Status ${res.status}).`,
              data: { retryAction: () => void handleInquiry(queryText) },
            })
          }
        } catch {
          setIsLoading(false)
          addMessage({
            role: 'assistant',
            type: 'error',
            content: `A network or service error occurred while fetching order #${orderId}.`,
            data: { retryAction: () => void handleInquiry(queryText) },
          })
        }
        return
      }

      // 2. Shipping Address Inquiry: e.g. "address", "shipping", "where is it delivered"
      if (lower.includes('address') || lower.includes('shipping') || lower.includes('delivery')) {
        if (!isAuth) {
          setIsLoading(false)
          addMessage({
            role: 'assistant',
            type: 'text',
            content: 'Please sign in to access your saved delivery and shipping addresses.',
          })
          return
        }

        try {
          const res = await listShippingAddresses()
          setIsLoading(false)

          if (res.status === 200 && res.data.data) {
            const addresses: ShippingAddress[] = res.data.data
            if (addresses.length === 0) {
              addMessage({
                role: 'assistant',
                type: 'text',
                content: 'You do not have any saved shipping addresses on file yet.',
              })
            } else {
              addMessage({
                role: 'assistant',
                type: 'shipping-addresses',
                content: `Found ${addresses.length} saved shipping address${addresses.length > 1 ? 'es' : ''}:`,
                data: { addresses },
              })
            }
          } else {
            addMessage({
              role: 'assistant',
              type: 'error',
              content: 'Failed to retrieve your shipping addresses.',
              data: { retryAction: () => void handleInquiry(queryText) },
            })
          }
        } catch {
          setIsLoading(false)
          addMessage({
            role: 'assistant',
            type: 'error',
            content: 'A network error occurred while fetching shipping addresses.',
            data: { retryAction: () => void handleInquiry(queryText) },
          })
        }
        return
      }

      // 3. Orders List Inquiry: e.g. "orders", "purchases", "tracking", "history"
      if (lower.includes('order') || lower.includes('purchase') || lower.includes('track') || lower.includes('history')) {
        if (!isAuth) {
          setIsLoading(false)
          addMessage({
            role: 'assistant',
            type: 'text',
            content: 'Please sign in to inspect your order history and live fulfillment status.',
          })
          return
        }

        try {
          const res = await listMyOrders({ per_page: 5 })
          setIsLoading(false)

          if (res.status === 200 && res.data.data) {
            const orders: Order[] = res.data.data
            if (orders.length === 0) {
              addMessage({
                role: 'assistant',
                type: 'text',
                content: 'No orders were found for your account yet.',
              })
            } else {
              addMessage({
                role: 'assistant',
                type: 'order-list',
                content: `Here are your recent orders from your account:`,
                data: { orders },
              })
            }
          } else {
            addMessage({
              role: 'assistant',
              type: 'error',
              content: 'Failed to retrieve your order list.',
              data: { retryAction: () => void handleInquiry(queryText) },
            })
          }
        } catch {
          setIsLoading(false)
          addMessage({
            role: 'assistant',
            type: 'error',
            content: 'Network connection issue while retrieving orders.',
            data: { retryAction: () => void handleInquiry(queryText) },
          })
        }
        return
      }

      // Fallback response for unhandled questions
      setIsLoading(false)
      addMessage({
        role: 'assistant',
        type: 'text',
        content: `I couldn't match "${query}" to an order or address inquiry. Try asking "Show my recent orders", lookup an order like "Order #1", or ask "What can you do?" for a list of capabilities.`,
      })
    },
    [addMessage]
  )

  const inspectOrder = useCallback(
    async (orderId: number) => {
      await handleInquiry(`Order #${orderId}`)
    },
    [handleInquiry]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    handleInquiry,
    inspectOrder,
    clearMessages,
  }
}
