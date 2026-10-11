import { LuCircleAlert, LuRefreshCw } from 'react-icons/lu'

interface ErrorStateViewProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorStateView({
  title = 'Service Notice',
  message,
  onRetry,
}: ErrorStateViewProps) {
  return (
    <div className="border border-rule bg-paper p-3 text-left">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
        <LuCircleAlert className="size-3.5 text-charcoal" aria-hidden="true" />
        <span>{title}</span>
      </div>
      <p className="mt-1 text-[13px] text-ink">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 border border-charcoal bg-transparent px-2.5 py-1 text-[11px] font-semibold text-charcoal hover:bg-bone transition-colors"
        >
          <LuRefreshCw className="size-3" aria-hidden="true" />
          <span>Retry request</span>
        </button>
      )}
    </div>
  )
}
