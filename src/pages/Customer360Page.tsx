import { useState } from 'react'
import { CustomerDetailPanel } from '../components/CustomerDetailPanel'
import { CustomerTable } from '../components/CustomerTable'
import { MetricCard } from '../components/MetricCard'
import { MetricGrid } from '../components/MetricGrid'
import { PageHeader } from '../components/PageHeader'
import { CUSTOMERS } from '../data/customers'
import type { DateRangeKey } from '../data/dashboardData'
import { formatCurrency } from '../utils/formatters'

interface Customer360PageProps {
  initialCustomerId?: string
}

export function Customer360Page({ initialCustomerId }: Customer360PageProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId ?? CUSTOMERS[0]?.id ?? '',
  )
  const [dateRange, setDateRange] = useState<DateRangeKey>('Last 6 Months')

  const selectedCustomer =
    CUSTOMERS.find((customer) => customer.id === selectedCustomerId) ?? null

  const scale =
    dateRange === 'Last 30 Days'
      ? 0.94
      : dateRange === 'Last 90 Days'
        ? 0.97
        : dateRange === 'Last 12 Months'
          ? 1.06
          : 1

  const totalCustomers = Math.round(2404 * scale)
  const newCustomers = Math.round(276 * scale)
  const lostCustomers = Math.round(98 * scale)
  const avgSubscriptionValue = Number((20.9 * scale).toFixed(2))

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto w-full">
      <PageHeader
        eyebrow="Customer Management"
        title="Customer 360"
        description="Search, filter, and inspect individual customers and their subscription details."
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showComparisonLabel={false}
        showFilterButton={false}
      />

      <MetricGrid>
        <MetricCard
          title="Total Customers"
          value={totalCustomers.toLocaleString('en-US')}
          change="+8.4%"
          trend="up"
          sparklinePoints={[1980, 2060, 2145, 2230, 2320, totalCustomers]}
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
          title="New Customers"
          value={newCustomers.toLocaleString('en-US')}
          change="+18.5%"
          trend="up"
          sparklinePoints={[165, 188, 210, 232, 254, newCustomers]}
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
          title="Lost Customers"
          value={lostCustomers.toLocaleString('en-US')}
          change="-24.6%"
          trend="down"
          sparklinePoints={[130, 122, 114, 108, 102, lostCustomers]}
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
          value={formatCurrency(avgSubscriptionValue, true)}
          change="+3.4%"
          trend="up"
          sparklinePoints={[19.4, 19.8, 20.1, 20.4, 20.7, avgSubscriptionValue]}
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
      </MetricGrid>

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
