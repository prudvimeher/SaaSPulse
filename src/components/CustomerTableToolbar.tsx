import type {
  AccountStatus,
  SortDirection,
  SortField,
  SubscriptionPlan,
} from '../types/customer'

interface CustomerTableToolbarProps {
  searchQuery: string
  planFilter: 'All' | SubscriptionPlan
  statusFilter: 'All' | AccountStatus
  sortField: SortField
  sortDirection: SortDirection
  onSearchChange: (value: string) => void
  onPlanChange: (value: 'All' | SubscriptionPlan) => void
  onStatusChange: (value: 'All' | AccountStatus) => void
  onSortChange: (field: SortField, direction: SortDirection) => void
}

const PLAN_OPTIONS: readonly ('All' | SubscriptionPlan)[] = [
  'All',
  'Starter',
  'Pro',
  'Business',
  'Enterprise',
]

const STATUS_OPTIONS: readonly ('All' | AccountStatus)[] = [
  'All',
  'Active',
  'Past Due',
  'Canceled',
]

type SortOptionValue = `${SortField}:${SortDirection}`

export function CustomerTableToolbar({
  searchQuery,
  planFilter,
  statusFilter,
  sortField,
  sortDirection,
  onSearchChange,
  onPlanChange,
  onStatusChange,
  onSortChange,
}: CustomerTableToolbarProps) {
  const handleSortSelectChange = (value: SortOptionValue) => {
    const [field, direction] = value.split(':') as [SortField, SortDirection]
    onSortChange(field, direction)
  }

  return (
    <div className="px-5 pb-4 flex flex-wrap items-center gap-2.5">
      <div className="relative flex-1 min-w-[200px]">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085] dark:text-[#94A3B8]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search customers by name or email"
          className="w-full h-9 rounded-lg border border-[#E4E7EC] dark:border-[#334155] bg-[#F9FAFB] dark:bg-[#0F172A] pl-9 pr-8 text-[13px] text-[#101828] dark:text-[#F1F5F9] placeholder:text-[#667085] dark:placeholder:text-[#64748B] focus:bg-white dark:focus:bg-[#111827] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear customer search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#667085] dark:text-[#94A3B8] hover:text-[#101828] dark:hover:text-[#F8FAFC] hover:bg-[#EAECF0] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Plan Filter */}
        <div className="relative">
          <select
            aria-label="Filter by subscription plan"
            value={planFilter}
            onChange={(event) =>
              onPlanChange(event.target.value as 'All' | SubscriptionPlan)
            }
            className="h-9 appearance-none rounded-lg border border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#0F172A] dark:[color-scheme:dark] pl-3 pr-8 text-[13px] font-medium text-[#344054] dark:text-[#E2E8F0] hover:border-[#D0D5DD] dark:hover:border-[#475569] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors cursor-pointer"
          >
            {PLAN_OPTIONS.map((plan) => (
              <option key={plan} value={plan}>
                {plan === 'All' ? 'All Plans' : plan}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085] dark:text-[#94A3B8]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            aria-label="Filter by account status"
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as 'All' | AccountStatus)
            }
            className="h-9 appearance-none rounded-lg border border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#0F172A] dark:[color-scheme:dark] pl-3 pr-8 text-[13px] font-medium text-[#344054] dark:text-[#E2E8F0] hover:border-[#D0D5DD] dark:hover:border-[#475569] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors cursor-pointer"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085] dark:text-[#94A3B8]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {/* Sort Select */}
        <div className="relative">
          <select
            aria-label="Sort customers"
            value={`${sortField}:${sortDirection}`}
            onChange={(event) =>
              handleSortSelectChange(event.target.value as SortOptionValue)
            }
            className="h-9 appearance-none rounded-lg border border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#0F172A] dark:[color-scheme:dark] pl-3 pr-8 text-[13px] font-medium text-[#344054] dark:text-[#E2E8F0] hover:border-[#D0D5DD] dark:hover:border-[#475569] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors cursor-pointer"
          >
            <option value="signupDate:desc">Sort: Signup Date</option>
            <option value="signupDate:asc">Sort: Oldest Signup</option>
            <option value="mrr:desc">Sort: Highest MRR</option>
            <option value="mrr:asc">Sort: Lowest MRR</option>
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085] dark:text-[#94A3B8]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  )
}
