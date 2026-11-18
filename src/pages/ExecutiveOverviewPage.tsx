import { useState } from 'react'
import { useExecutiveOverviewQuery } from '../api/queries'
import { ChartPanel } from '../components/ChartPanel'
import { DataTable } from '../components/DataTable'
import type { DataTableColumn } from '../components/DataTable'
import { InsightsPanel } from '../components/InsightsPanel'
import { MetricCard } from '../components/MetricCard'
import { MetricGrid } from '../components/MetricGrid'
import { PageHeader } from '../components/PageHeader'
import {
  DashboardLoadingSkeleton,
  QueryErrorBanner,
} from '../components/QueryStateBanner'
import type { NavSection } from '../components/Sidebar'
import { StatusBadge } from '../components/StatusBadge'
import { AreaTrendChart } from '../components/charts/AreaTrendChart'
import { DonutBreakdownChart } from '../components/charts/DonutBreakdownChart'
import type {
  CustomDateRange,
  DateRangeKey,
  RecentCustomerRow,
} from '../types/analytics'
import { formatCurrency } from '../utils/formatters'

interface ExecutiveOverviewPageProps {
  onNavigate: (section: NavSection, customerId?: string) => void
  dateRange: DateRangeKey
  onDateRangeChange: (nextRange: DateRangeKey) => void
  customRange: CustomDateRange
  onCustomRangeChange: (nextRange: CustomDateRange) => void
}

export function ExecutiveOverviewPage({
  onNavigate,
  dateRange,
  onDateRangeChange,
  customRange,
  onCustomRangeChange,
}: ExecutiveOverviewPageProps) {
  const [chartMetric, setChartMetric] = useState<'MRR' | 'ARR'>('MRR')
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('All')
  const [showPlanBar, setShowPlanBar] = useState(false)

  const { data, isPending, isError, error, refetch } =
    useExecutiveOverviewQuery(dateRange, customRange)

  const filteredRecentCustomers = !data
    ? []
    : selectedPlanFilter === 'All'
      ? data.recentCustomers
      : data.recentCustomers.filter((row) => row.plan === selectedPlanFilter)

  const trendPoints = (data?.revenueSeries ?? []).map((pt) => ({
    month: pt.month,
    fullLabel: pt.fullLabel,
    value: chartMetric === 'MRR' ? pt.mrr : pt.arr,
  }))

  const columns: DataTableColumn<RecentCustomerRow>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF0F6] dark:bg-[#1E293B] text-[10.5px] font-semibold text-[#344054] dark:text-[#E2E8F0]"
            aria-hidden="true"
          >
            {row.initials}
          </span>
          <span className="font-semibold text-[#101828] dark:text-[#F8FAFC] truncate">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (row) => (
        <span className="inline-flex items-center rounded-md border border-[#E4E7EC] dark:border-[#334155] bg-[#F8F9FC] dark:bg-[#1E293B] px-2 py-0.5 text-[11.5px] font-medium text-[#344054] dark:text-[#CBD5E1]">
          {row.plan}
        </span>
      ),
    },
    {
      key: 'mrr',
      header: 'MRR',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[#101828] dark:text-[#F8FAFC] font-tabular">
          {formatCurrency(row.mrr)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'signedUp',
      header: 'Signed Up',
      render: (row) => (
        <span className="text-[#475467] dark:text-[#94A3B8] font-tabular whitespace-nowrap">
          {row.signedUp}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onNavigate('Customer 360', row.id)
          }}
          aria-label={`Inspect ${row.name} in Customer 360`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#667085] dark:text-[#94A3B8] hover:bg-[#F2F4F7] dark:hover:bg-[#1E293B] hover:text-[#101828] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="19" cy="12" r="1.75" />
          </svg>
        </button>
      ),
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto w-full">
      <PageHeader
        eyebrow="Good morning, Alex"
        title="Executive Overview"
        description="A real-time snapshot of your business performance, revenue, and customers."
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        customRange={customRange}
        onCustomRangeChange={onCustomRangeChange}
        comparisonLabel={data?.comparisonLabel}
        limitationNote={data?.limitationNote ?? null}
        isFilterActive={showPlanBar}
        onFilterToggle={() => setShowPlanBar((prev) => !prev)}
      />

      {isError && (
        <QueryErrorBanner
          message={
            error instanceof Error
              ? error.message
              : 'Unable to load executive overview metrics.'
          }
          onRetry={() => void refetch()}
        />
      )}

      {isPending && !data ? (
        <DashboardLoadingSkeleton />
      ) : data ? (
        <>
          {showPlanBar && (
            <div className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-[#475467] dark:text-[#94A3B8]">
                Filter recent signups by plan:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Starter', 'Pro', 'Business', 'Enterprise'].map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setSelectedPlanFilter(plan)}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                      selectedPlanFilter === plan
                        ? 'bg-[#334155] dark:bg-[#5B4DF0] text-white'
                        : 'bg-[#F8F9FC] dark:bg-[#1E293B] text-[#475467] dark:text-[#CBD5E1] hover:bg-[#EAECF0] dark:hover:bg-[#334155]'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>
          )}

          <MetricGrid>
            <MetricCard
              title="MRR"
              infoLabel="Monthly Recurring Revenue"
              value={formatCurrency(data.mrr)}
              change={data.mrrChange}
              trend={data.mrrTrend}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.mrrSparkline}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              }
            />

            <MetricCard
              title="ARR"
              infoLabel="Annual Recurring Revenue (MRR × 12)"
              value={formatCurrency(data.arr)}
              change={data.mrrChange}
              trend={data.mrrTrend}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.arrSparkline}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              }
            />

            <MetricCard
              title="Total Customers"
              infoLabel="Active paying customers"
              value={data.totalCustomers.toLocaleString('en-US')}
              change={data.customersChange}
              trend={data.customersTrend}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.customersSparkline}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />

            <MetricCard
              title="Churn Rate"
              infoLabel="Period customer churn rate"
              value={`${data.churnRate.toFixed(1)}%`}
              change={data.churnChange}
              trend={data.churnTrendDirection}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.churnSparkline}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
              }
            />
          </MetricGrid>

          {/* Middle Row */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            <div className="xl:col-span-7 min-w-0">
              <ChartPanel
                title="Revenue Performance"
                subtitle={
                  chartMetric === 'MRR'
                    ? 'Monthly recurring revenue (MRR) over time.'
                    : 'Annual recurring revenue (ARR) over time.'
                }
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20v-4" />
                  </svg>
                }
                action={
                  <div className="inline-flex items-center rounded-lg border border-[#E4E7EC] dark:border-[#334155] bg-[#F9FAFB] dark:bg-[#0F172A] p-0.5">
                    {(['MRR', 'ARR'] as const).map((metric) => (
                      <button
                        key={metric}
                        type="button"
                        onClick={() => setChartMetric(metric)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                          chartMetric === metric
                            ? 'bg-[#475569] dark:bg-[#5B4DF0] text-white shadow-2xs'
                            : 'text-[#475467] dark:text-[#94A3B8] hover:text-[#101828] dark:hover:text-[#F8FAFC]'
                        }`}
                      >
                        {metric}
                      </button>
                    ))}
                  </div>
                }
              >
                <AreaTrendChart
                  data={trendPoints}
                  valueLabel={chartMetric}
                  strokeColor="#64748B"
                  fillColor="#64748B"
                  defaultActiveIndex={Math.max(0, trendPoints.length - 2)}
                  formatValue={(value) => formatCurrency(value)}
                  formatYAxis={(value) =>
                    value === 0 ? '$0' : `$${Math.round(value / 1000)}K`
                  }
                />
              </ChartPanel>
            </div>

            <div className="xl:col-span-5 min-w-0">
              <ChartPanel
                title="Revenue by Subscription Plan"
                subtitle="MRR distribution across subscription plans."
                className="h-full"
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                }
              >
                <div className="pt-2">
                  <DonutBreakdownChart
                    slices={data.planSlices}
                    centerValue={formatCurrency(data.mrr)}
                    centerLabel="Total MRR"
                  />
                </div>
              </ChartPanel>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            <div className="xl:col-span-8 min-w-0">
              <ChartPanel
                title="Recent Customers"
                subtitle="Latest customers who signed up for a paid plan."
                noBodyPadding
                className="h-full"
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
                action={
                  <button
                    type="button"
                    onClick={() => onNavigate('Customer 360')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>View All Customers</span>
                    <span aria-hidden="true">→</span>
                  </button>
                }
              >
                <DataTable
                  columns={columns}
                  data={filteredRecentCustomers}
                  getRowKey={(row) => row.id}
                  onRowClick={(row) => onNavigate('Customer 360', row.id)}
                />
              </ChartPanel>
            </div>

            <div className="xl:col-span-4 min-w-0">
              <InsightsPanel
                title="Key Insights"
                subtitle="Notable changes from the previous period."
                insights={data.insights}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
