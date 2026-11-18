import type { Customer } from '../types/customer'
import { formatCurrency, formatDate } from '../utils/formatters'
import { CustomerMrrMiniChart } from './CustomerMrrMiniChart'

interface CustomerOverviewTabProps {
  customer: Customer
}

export function CustomerOverviewTab({ customer }: CustomerOverviewTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-[#FCFCFD] dark:bg-[#161F33] p-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#111827] border border-[#EAECF0] dark:border-[#334155] text-[#475467] dark:text-[#CBD5E1]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#667085] dark:text-[#94A3B8]">
              Current Plan
            </p>
            <p className="text-[13.5px] font-semibold text-[#101828] dark:text-[#F8FAFC] truncate">
              {customer.plan}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-[#FCFCFD] dark:bg-[#161F33] p-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#111827] border border-[#EAECF0] dark:border-[#334155] text-[#475467] dark:text-[#CBD5E1]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M14.5 9.5a2.5 2.5 0 0 0-2.5-1.5h-.5a2 2 0 0 0 0 4h1a2 2 0 0 1 0 4H12a2.5 2.5 0 0 1-2.5-1.5" />
              <path d="M12 6.5v11" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#667085] dark:text-[#94A3B8]">
              MRR
            </p>
            <p className="text-[13.5px] font-semibold text-[#101828] dark:text-[#F8FAFC] font-tabular">
              {formatCurrency(customer.mrr)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-[#FCFCFD] dark:bg-[#161F33] p-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#111827] border border-[#EAECF0] dark:border-[#334155] text-[#475467] dark:text-[#CBD5E1]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#667085] dark:text-[#94A3B8]">
              Customer Since
            </p>
            <p className="text-[13px] font-semibold text-[#101828] dark:text-[#F8FAFC] font-tabular truncate">
              {formatDate(customer.signupDate)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-[#FCFCFD] dark:bg-[#161F33] p-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#111827] border border-[#EAECF0] dark:border-[#334155] text-[#475467] dark:text-[#CBD5E1]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#667085] dark:text-[#94A3B8]">
              Total Revenue
            </p>
            <p className="text-[13.5px] font-semibold text-[#101828] dark:text-[#F8FAFC] font-tabular">
              {formatCurrency(customer.totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      <CustomerMrrMiniChart
        customerName={customer.name}
        history={customer.mrrHistory}
      />
    </div>
  )
}
