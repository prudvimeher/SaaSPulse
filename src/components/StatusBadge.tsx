import type { AccountStatus } from '../types/customer'

interface StatusBadgeProps {
  status: AccountStatus
}

const STATUS_STYLES: Record<
  AccountStatus,
  { container: string; dot: string }
> = {
  Active: {
    container:
      'bg-[#ECFDF3] dark:bg-[#064E3B]/50 text-[#067647] dark:text-[#6EE7B7]',
    dot: 'bg-[#17B26A] dark:bg-[#34D399]',
  },
  'Past Due': {
    container:
      'bg-[#FFFAEB] dark:bg-[#78350F]/45 text-[#B54708] dark:text-[#FCD34D]',
    dot: 'bg-[#F79009] dark:bg-[#FBBF24]',
  },
  Canceled: {
    container: 'bg-[#F2F4F7] dark:bg-[#1E293B] text-[#475467] dark:text-[#CBD5E1]',
    dot: 'bg-[#98A2B3] dark:bg-[#94A3B8]',
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
