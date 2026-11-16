import { useState } from 'react'
import { CustomerDetailPanel } from '../components/CustomerDetailPanel'
import { CustomerTable } from '../components/CustomerTable'
import { MetricCard } from '../components/MetricCard'
import { CUSTOMERS } from '../data/customers'
import { formatCurrency } from '../utils/formatters'

const DATE_RANGES = [
  'Last 30 Days',
  'Last 90 Days',
  'Last 6 Months',
  'Last 12 Months',
] as const

type DateRangeOption = (typeof DATE_RANGES)[number]

export function Customer360Page() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    CUSTOMERS[0]?.id ?? '',
  )
  const [dateRange, setDateRange] = useState<DateRangeOption>('Last 6 Months')

  const selectedCustomer =
    CUSTOMERS.find((customer) => customer.id === selectedCustomerId) ?? null

  const activeCustomersCount = CUSTOMERS.filter(
    (customer) => customer.status === 'Active',
  ).length
  const pastDueCount = CUSTOMERS.filter(
    (customer) => customer.status === 'Past Due',
  ).length
  const canceledCount = CUSTOMERS.filter(
    (customer) => customer.status === 'Canceled',
  ).length
  const totalActiveMrr = CUSTOMERS.filter(
    (customer) => customer.status !== 'Canceled',
  ).reduce((sum, customer) => sum + customer.mrr, 0)
  const avgMrr =
    activeCustomersCount + pastDueCount > 0
      ? totalActiveMrr / (activeCustomersCount + pastDueCount)
      : 0

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12.5px] font-medium text-[#667085]">
            Customer Management
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#101828] mt-0.5">
            Customer 360
          </h1>
          <p className="text-[13px] text-[#667085] mt-1">
            Search, filter, and inspect individual customers and their subscription details.
          </p>
        </div>

        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475467]"
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
          <select
            aria-label="Reporting date range"
            value={dateRange}
            onChange={(event) =>
              setDateRange(event.target.value as DateRangeOption)
            }
            className="h-9 appearance-none rounded-lg border border-[#D0D5DD] bg-white pl-9 pr-9 text-[13px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-[#F9FAFB] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 cursor-pointer"
          >
            {DATE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085]"
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

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={String(CUSTOMERS.length)}
          change="+8.4%"
          trend="up"
          sparklinePoints={[18, 20, 21, 23, 25, 28]}
          icon={
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />

        <MetricCard
          title="Active Accounts"
          value={String(activeCustomersCount)}
          change="+18.5%"
          trend="up"
          sparklinePoints={[14, 16, 17, 18, 20, activeCustomersCount]}
          icon={
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
          }
        />

        <MetricCard
          title="Canceled Accounts"
          value={String(canceledCount)}
          change="-24.6%"
          trend="down"
          sparklinePoints={[7, 6, 5, 5, 4, canceledCount]}
          icon={
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
          }
        />

        <MetricCard
          title="Avg. Subscription Value"
          value={formatCurrency(avgMrr, true)}
          change="+3.4%"
          trend="up"
          sparklinePoints={[245, 252, 260, 271, 282, avgMrr]}
          icon={
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          }
        />
      </div>

      {/* Main Split: CustomerTable + CustomerDetailPanel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 min-w-0">
          <CustomerTable
            customers={CUSTOMERS}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
          />
        </div>

        <div className="xl:col-span-4 min-w-0">
          <CustomerDetailPanel customer={selectedCustomer} />
        </div>
      </div>
    </div>
  )
}
