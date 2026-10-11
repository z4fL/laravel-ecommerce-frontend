import type { OrderStatus } from '../../generated/models'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Needs payment',
  payment_failed: 'Payment failed',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  pending_payment: { bg: 'bg-[#fef8e7]', text: 'text-[#8a6100]', border: 'border-[#e4c982]' },
  payment_failed: { bg: 'bg-[#fdeeed]', text: 'text-[#a12017]', border: 'border-[#ea9d97]' },
  paid: { bg: 'bg-[#eef5e7]', text: 'text-[#356116]', border: 'border-[#a7cc8b]' },
  processing: { bg: 'bg-[#eaf3f8]', text: 'text-[#1e577d]', border: 'border-[#9dc3dd]' },
  shipped: { bg: 'bg-[#f2effb]', text: 'text-[#4e378c]', border: 'border-[#b7a8df]' },
  completed: { bg: 'bg-[#eef5e7]', text: 'text-[#356116]', border: 'border-[#a7cc8b]' },
  cancelled: { bg: 'bg-[#f4f4f0]', text: 'text-[#66675f]', border: 'border-[#cecec4]' },
}

export function formatAssistantDate(value?: string): string {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
