import type { AccountStatus } from '../types/customer'

interface StatusBadgeProps {
  status: AccountStatus
}

const STATUS_STYLES: Record<
  AccountStatus,
  { container: string; dot: string }
> = {
  Active: {
    container: 'bg-[#ECFDF3] text-[#067647]',
    dot: 'bg-[#17B26A]',
  },
  'Past Due': {
    container: 'bg-[#FFFAEB] text-[#B54708]',
    dot: 'bg-[#F79009]',
  },
  Canceled: {
    container: 'bg-[#F2F4F7] text-[#475467]',
    dot: 'bg-[#98A2B3]',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${styles.container}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full shrink-0 ${styles.dot}`}
        aria-hidden="true"
      />
      <span>{status}</span>
    </span>
  )
}
