import type { SuggestedQuestion } from './types'

export const DEFAULT_SUGGESTIONS: SuggestedQuestion[] = [
  {
    id: 'my-orders',
    label: 'Track recent orders',
    query: 'Show my recent orders',
    category: 'orders',
  },
  {
    id: 'shipping-addresses',
    label: 'Saved shipping addresses',
    query: 'What are my saved shipping addresses?',
    category: 'shipping',
  },
  {
    id: 'capabilities',
    label: 'What can you help with?',
    query: 'What can this assistant do?',
    category: 'help',
  },
]
