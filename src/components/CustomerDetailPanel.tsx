import { useState } from 'react'
import type { Customer } from '../types/customer'
import { formatCurrency, formatDate } from '../utils/formatters'
import { CustomerOverviewTab } from './CustomerOverviewTab'
import { StatusBadge } from './StatusBadge'

interface CustomerDetailPanelProps {
  customer: Customer | null
  isLoading?: boolean
  errorMessage?: string | null
  onRetry?: () => void
}

type DetailTab = 'Overview' | 'Subscription' | 'Billing' | 'Activity' | 'Notes'

const TABS: readonly DetailTab[] = [
  'Overview',
  'Subscription',
  'Billing',
  'Activity',
  'Notes',
]

export function CustomerDetailPanel({
  customer,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: CustomerDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('Overview')

  if (isLoading && !customer) {
    return (
      <aside
        aria-label="Loading customer details"
        aria-busy="true"
        className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 space-y-4 min-h-[380px] animate-pulse transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-[#EAECF0] dark:bg-[#1E293B]" />
          <div className="space-y-2">
            <div className="h-3.5 w-32 rounded bg-[#EAECF0] dark:bg-[#1E293B]" />
            <div className="h-3 w-40 rounded bg-[#F2F4F7] dark:bg-[#161F33]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-xl bg-[#F2F4F7] dark:bg-[#161F33]" />
          <div className="h-16 rounded-xl bg-[#F2F4F7] dark:bg-[#161F33]" />
          <div className="h-16 rounded-xl bg-[#F2F4F7] dark:bg-[#161F33]" />
          <div className="h-16 rounded-xl bg-[#F2F4F7] dark:bg-[#161F33]" />
        </div>
        <div className="h-36 rounded-xl bg-[#F2F4F7] dark:bg-[#161F33]" />
      </aside>
    )
  }

  if (errorMessage && !customer) {
    return (
      <aside
        aria-label="Customer details error"
        className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 flex items-center justify-center min-h-[380px] text-center transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-[#B42318] dark:text-[#FCA5A5]">
            Unable to load customer details
          </p>
          <p className="mt-1 text-xs text-[#667085] dark:text-[#94A3B8]">
            {errorMessage}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#111827] px-3.5 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      </aside>
    )
  }

  if (!customer) {
    return (
      <aside
        aria-label="Customer details"
        className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 flex items-center justify-center min-h-[380px] text-center transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-[#101828] dark:text-[#F8FAFC]">
            No customer selected
          </p>
          <p className="mt-1 text-xs text-[#667085] dark:text-[#94A3B8]">
            Select a customer row from the table to inspect their account and subscription details.
          </p>
        </div>
      </aside>
    )
  }

  return (
    <aside
      aria-label={`Customer details for ${customer.name}`}
      className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 flex flex-col gap-4 min-w-0 transition-colors"
    >
      {/* Top Customer Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF0F6] dark:bg-[#1E293B] text-sm font-semibold text-[#101828] dark:text-[#F8FAFC]"
            aria-hidden="true"
          >
            {customer.initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[#101828] dark:text-[#F8FAFC] leading-5 truncate">
              {customer.name}
            </h2>
            <p className="text-xs text-[#667085] dark:text-[#94A3B8] truncate mt-0.5">
              {customer.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={customer.status} />
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Customer profile sections"
        className="flex items-center gap-4 border-b border-[#EAECF0] dark:border-[#1F2937] overflow-x-auto"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-[12.5px] font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#5B4DF0] dark:border-[#818CF8] text-[#4F46E5] dark:text-[#A5B4FC]'
                  : 'border-transparent text-[#667085] dark:text-[#94A3B8] hover:text-[#101828] dark:hover:text-[#F8FAFC]'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && <CustomerOverviewTab customer={customer} />}

      {activeTab === 'Subscription' && (
        <div className="rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-[#FCFCFD] dark:bg-[#161F33] p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#667085] dark:text-[#94A3B8]">Plan Tier</span>
            <span className="font-semibold text-[#101828] dark:text-[#F8FAFC]">
              {customer.plan}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085] dark:text-[#94A3B8]">
              Billing Cycle
            </span>
            <span className="font-medium text-[#101828] dark:text-[#F8FAFC]">
              {customer.billingCycle}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085] dark:text-[#94A3B8]">
              Active Seats
            </span>
            <span className="font-medium text-[#101828] dark:text-[#F8FAFC] font-tabular">
              {customer.seats} seats
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085] dark:text-[#94A3B8]">
              Normalized MRR
            </span>
            <span className="font-semibold text-[#101828] dark:text-[#F8FAFC] font-tabular">
              {formatCurrency(customer.mrr)}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'Billing' && (
        <div className="rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-[#FCFCFD] dark:bg-[#161F33] p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#667085] dark:text-[#94A3B8]">
              Payment Method
            </span>
            <span className="font-medium text-[#101828] dark:text-[#F8FAFC]">
              {customer.paymentMethod}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085] dark:text-[#94A3B8]">
              Next Renewal
            </span>
            <span className="font-medium text-[#101828] dark:text-[#F8FAFC] font-tabular">
              {customer.nextBillingDate
                ? formatDate(customer.nextBillingDate)
                : 'Not scheduled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085] dark:text-[#94A3B8]">
              Lifetime Value
            </span>
            <span className="font-semibold text-[#101828] dark:text-[#F8FAFC] font-tabular">
              {formatCurrency(customer.totalRevenue)}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'Activity' && (
        <ul className="divide-y divide-[#EAECF0] dark:divide-[#1F2937] rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-white dark:bg-[#161F33]">
          {customer.recentActivity.map((item) => (
            <li key={item.id} className="px-3.5 py-2.5">
              <p className="text-xs font-medium text-[#101828] dark:text-[#F8FAFC]">
                {item.title}
              </p>
              <p className="text-[11px] text-[#667085] dark:text-[#94A3B8] mt-0.5 font-tabular">
                {item.timestamp}
              </p>
            </li>
          ))}
        </ul>
      )}

      {activeTab === 'Notes' && (
        <div className="rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-[#FCFCFD] dark:bg-[#161F33] p-4">
          <p className="text-xs font-medium text-[#475467] dark:text-[#CBD5E1] mb-1.5">
            Account Notes
          </p>
          <p className="text-xs leading-relaxed text-[#344054] dark:text-[#CBD5E1]">
            {customer.notes}
          </p>
        </div>
      )}
    </aside>
  )
}
