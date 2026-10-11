import type { Order, ShippingAddress } from '../../generated/models'

export type AssistantRole = 'user' | 'assistant'

export type MessageContentType =
  | 'text'
  | 'order-list'
  | 'order-detail'
  | 'shipping-addresses'
  | 'capabilities'
  | 'error'

export interface AssistantMessage {
  id: string
  role: AssistantRole
  type: MessageContentType
  content?: string
  timestamp: Date
  data?: {
    orders?: Order[]
    order?: Order
    addresses?: ShippingAddress[]
    retryAction?: () => void
  }
}

export interface SuggestedQuestion {
  id: string
  label: string
  query: string
  category: 'orders' | 'shipping' | 'help'
}
