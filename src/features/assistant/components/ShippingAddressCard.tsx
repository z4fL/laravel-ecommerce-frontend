import { LuMapPin, LuCheck } from 'react-icons/lu'
import type { ShippingAddress } from '../../../generated/models'

interface ShippingAddressCardProps {
  address: ShippingAddress
}

export function ShippingAddressCard({ address }: ShippingAddressCardProps) {
  return (
    <article className="border border-rule bg-paper p-3 text-left text-ink">
      <div className="flex items-center justify-between gap-2 border-b border-rule pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <LuMapPin className="size-3.5 text-ink" aria-hidden="true" />
          <span>{address.label ? address.label.toUpperCase() : 'ADDRESS'}</span>
        </div>
        {address.is_default && (
          <span className="inline-flex items-center gap-1 border border-marker-olive bg-[#eef5e7] px-1.5 py-0.5 text-[10px] font-semibold text-marker-olive">
            <LuCheck className="size-2.5" aria-hidden="true" />
            <span>DEFAULT</span>
          </span>
        )}
      </div>

      <div className="pt-2 text-[12px] leading-relaxed">
        <p className="font-semibold text-ink">{address.recipient_name}</p>
        <p className="text-muted tabular-nums">{address.phone}</p>
        <p className="mt-1 text-ink-soft">
          {address.address}, {address.district}, {address.city}, {address.province}{' '}
          <span className="tabular-nums font-medium text-ink">{address.postal_code}</span>
        </p>
      </div>
    </article>
  )
}
