import { useEffect, useState } from 'react'
import {
  fetchCustomersList,
  useCustomerDetailQuery,
  useCustomerSummaryQuery,
  useCustomersQuery,
} from '../api/queries'
import { CustomerDetailPanel } from '../components/CustomerDetailPanel'
import { CustomerTable } from '../components/CustomerTable'
import { MetricCard } from '../components/MetricCard'
import { MetricGrid } from '../components/MetricGrid'
import { PageHeader } from '../components/PageHeader'
import { QueryErrorBanner } from '../components/QueryStateBanner'
import type { CustomDateRange, DateRangeKey } from '../types/analytics'
import type {
  AccountStatus,
  SortDirection,
  SortField,
  SubscriptionPlan,
} from '../types/customer'
import { formatCurrency } from '../utils/formatters'

interface Customer360PageProps {
  initialCustomerId?: string
  dateRange: DateRangeKey
  onDateRangeChange: (nextRange: DateRangeKey) => void
  customRange: CustomDateRange
  onCustomRangeChange: (nextRange: CustomDateRange) => void
}

const PAGE_SIZE = 7

export function Customer360Page({
  initialCustomerId,
  dateRange,
  onDateRangeChange,
  customRange,
  onCustomRangeChange,
}: Customer360PageProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    initialCustomerId ?? null,
  )
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<'All' | SubscriptionPlan>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | AccountStatus>('All')
  const [sortField, setSortField] = useState<SortField>('signupDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 180)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const summaryQuery = useCustomerSummaryQuery(dateRange, customRange)
  const customersQuery = useCustomersQuery({
    search: debouncedSearch,
    plan: planFilter,
    status: statusFilter,
    sortBy: sortField,
    sortDir: sortDirection,
    page: currentPage,
    pageSize: PAGE_SIZE,
    dateRange,
    startDate: customRange.startDate,
    endDate: customRange.endDate,
  })

  const pageCustomers = customersQuery.data?.items ?? []
  const effectiveSelectedId =
    selectedCustomerId ?? pageCustomers[0]?.id ?? null

  const detailQuery = useCustomerDetailQuery(effectiveSelectedId)
  const selectedCustomer =
    detailQuery.data ??
    pageCustomers.find((c) => c.id === effectiveSelectedId) ??
    null

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (value === '') {
      setDebouncedSearch('')
    }
    setCurrentPage(1)
  }

  const handlePlanChange = (value: 'All' | SubscriptionPlan) => {
    setPlanFilter(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: 'All' | AccountStatus) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setPlanFilter('All')
    setStatusFilter('All')
    setCurrentPage(1)
  }

  const handleExportCsv = async (): Promise<number> => {
    const fullList = await fetchCustomersList({
      search: debouncedSearch,
      plan: planFilter,
      status: statusFilter,
      sortBy: sortField,
      sortDir: sortDirection,
      page: 1,
      pageSize: 200,
      dateRange,
      startDate: customRange.startDate,
      endDate: customRange.endDate,
    })

    const headers = ['ID', 'Name', 'Email', 'Plan', 'MRR', 'Status', 'Signup Date']
    const rows = fullList.items.map((customer) => [
      customer.id,
      `"${customer.name.replace(/"/g, '""')}"`,
      `"${customer.email.replace(/"/g, '""')}"`,
      customer.plan,
      String(customer.mrr),
      customer.status,
      customer.signupDate,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'saaspulse-customers.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return fullList.items.length
  }

  const summary = summaryQuery.data

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto w-full">
      <PageHeader
        eyebrow="Customer Management"
        title="Customer 360"
        description="Search, filter, and inspect individual customers and their subscription details."
        dateRange={dateRange}
        onDateRangeChange={(nextRange) => {
          setCurrentPage(1)
          onDateRangeChange(nextRange)
        }}
        customRange={customRange}
        onCustomRangeChange={(nextRange) => {
          setCurrentPage(1)
          onCustomRangeChange(nextRange)
        }}
        comparisonLabel={summary?.comparisonLabel}
        limitationNote={summary?.limitationNote ?? null}
        showComparisonLabel={false}
        showFilterButton={false}
      />

      {summaryQuery.isError && (
        <QueryErrorBanner
          message={
            summaryQuery.error instanceof Error
              ? summaryQuery.error.message
              : 'Unable to load customer summary KPIs.'
          }
          onRetry={() => void summaryQuery.refetch()}
        />
      )}

      {summaryQuery.isPending && !summary ? (
        <div
          aria-busy="true"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse"
        >
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[108px] rounded-xl border border-[#E6E8EF] dark:border-[#1F2937] bg-white dark:bg-[#111827] p-4"
            />
          ))}
        </div>
      ) : summary ? (
        <MetricGrid>
          <MetricCard
            title="Total Customers"
            value={summary.totalCustomers.toLocaleString('en-US')}
            change={summary.totalChange}
            trend={summary.totalTrend}
            comparisonLabel={summary.comparisonLabel}
            sparklinePoints={summary.totalSparkline}
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
            value={summary.newCustomers.toLocaleString('en-US')}
            change={summary.newChange}
            trend={summary.newTrend}
            comparisonLabel={summary.comparisonLabel}
            sparklinePoints={summary.newSparkline}
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
            value={summary.lostCustomers.toLocaleString('en-US')}
            change={summary.lostChange}
            trend={summary.lostTrend}
            comparisonLabel={summary.comparisonLabel}
            sparklinePoints={summary.lostSparkline}
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
            value={formatCurrency(summary.avgSubscriptionValue, true)}
            change={summary.avgValueChange}
            trend={summary.avgValueTrend}
            comparisonLabel={summary.comparisonLabel}
            sparklinePoints={summary.avgValueSparkline}
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
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 min-w-0">
          <CustomerTable
            customers={pageCustomers}
            totalCount={customersQuery.data?.total ?? 0}
            currentPage={customersQuery.data?.page ?? currentPage}
            totalPages={customersQuery.data?.totalPages ?? 1}
            pageSize={PAGE_SIZE}
            searchQuery={searchInput}
            planFilter={planFilter}
            statusFilter={statusFilter}
            sortField={sortField}
            sortDirection={sortDirection}
            onSearchChange={handleSearchChange}
            onPlanChange={handlePlanChange}
            onStatusChange={handleStatusChange}
            onSortChange={handleSortChange}
            onPageChange={setCurrentPage}
            onResetFilters={handleResetFilters}
            onExportCsv={handleExportCsv}
            selectedCustomerId={effectiveSelectedId}
            onSelectCustomer={setSelectedCustomerId}
            isLoading={customersQuery.isPending && !customersQuery.data}
            isFetching={customersQuery.isFetching}
            errorMessage={
              customersQuery.isError
                ? customersQuery.error instanceof Error
                  ? customersQuery.error.message
                  : 'Request failed'
                : null
            }
            onRetry={() => void customersQuery.refetch()}
          />
        </div>

        <div className="xl:col-span-4 min-w-0">
          <CustomerDetailPanel
            customer={selectedCustomer}
            isLoading={detailQuery.isPending && Boolean(effectiveSelectedId)}
            errorMessage={
              detailQuery.isError
                ? detailQuery.error instanceof Error
                  ? detailQuery.error.message
                  : 'Request failed'
                : null
            }
            onRetry={() => void detailQuery.refetch()}
          />
        </div>
      </div>
    </div>
  )
}
