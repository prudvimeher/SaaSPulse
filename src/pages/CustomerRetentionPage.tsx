import { useState } from 'react'
import { useCustomerRetentionQuery } from '../api/queries'
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
import { AreaTrendChart } from '../components/charts/AreaTrendChart'
import type {
  ChurnedCustomerRow,
  CustomDateRange,
  DateRangeKey,
} from '../types/analytics'
import { formatCurrency } from '../utils/formatters'

interface CustomerRetentionPageProps {
  onNavigate: (section: NavSection, customerId?: string) => void
  dateRange: DateRangeKey
  onDateRangeChange: (nextRange: DateRangeKey) => void
  customRange: CustomDateRange
  onCustomRangeChange: (nextRange: CustomDateRange) => void
}

const REASON_STYLES: Record<ChurnedCustomerRow['reason'], string> = {
  Price:
    'bg-[#FEF2F2] dark:bg-[#7F1D1D]/45 text-[#B42318] dark:text-[#FCA5A5]',
  'Not using':
    'bg-[#FFFAEB] dark:bg-[#78350F]/45 text-[#B54708] dark:text-[#FCD34D]',
  'Missing features':
    'bg-[#F5F3FF] dark:bg-[#312E81]/50 text-[#4338CA] dark:text-[#C7D2FE]',
  Other:
    'bg-[#F2F4F7] dark:bg-[#1E293B] text-[#475467] dark:text-[#CBD5E1]',
}

export function CustomerRetentionPage({
  onNavigate,
  dateRange,
  onDateRangeChange,
  customRange,
  onCustomRangeChange,
}: CustomerRetentionPageProps) {
  const [trendMode, setTrendMode] = useState<'churn' | 'retention'>('churn')
  const [reasonFilter, setReasonFilter] = useState<string>('All')
  const [showReasonBar, setShowReasonBar] = useState(false)

  const { data, isPending, isError, error, refetch } =
    useCustomerRetentionQuery(dateRange, customRange)

  const filteredChurned = !data
    ? []
    : reasonFilter === 'All'
      ? data.recentlyChurned
      : data.recentlyChurned.filter((row) => row.reason === reasonFilter)

  const trendPoints = (data?.churnTrend ?? []).map((pt) => ({
    month: pt.month,
    fullLabel: pt.fullLabel,
    value: trendMode === 'churn' ? pt.churnRate : pt.retentionRate,
  }))

  const columns: DataTableColumn<ChurnedCustomerRow>[] = [
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
      key: 'activeFor',
      header: 'Active For',
      render: (row) => (
        <span className="text-[#475467] dark:text-[#94A3B8] whitespace-nowrap">
          {row.activeFor}
        </span>
      ),
    },
    {
      key: 'churnedOn',
      header: 'Churned On',
      render: (row) => (
        <span className="text-[#475467] dark:text-[#94A3B8] font-tabular whitespace-nowrap">
          {row.churnedOn}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-medium whitespace-nowrap ${REASON_STYLES[row.reason]}`}
        >
          {row.reason}
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

  const maxPlanChurn = data?.churnByPlan.length
    ? Math.max(...data.churnByPlan.map((r) => r.churnRate), 8)
    : 8

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto w-full">
      <PageHeader
        eyebrow="Customer Analytics"
        title="Customer Retention"
        description="Analyze churn, retention, and customer health across subscription plans."
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        customRange={customRange}
        onCustomRangeChange={onCustomRangeChange}
        comparisonLabel={data?.comparisonLabel}
        limitationNote={data?.limitationNote ?? null}
        isFilterActive={showReasonBar}
        onFilterToggle={() => setShowReasonBar((prev) => !prev)}
      />

      {isError && (
        <QueryErrorBanner
          message={
            error instanceof Error
              ? error.message
              : 'Unable to load customer retention metrics.'
          }
          onRetry={() => void refetch()}
        />
      )}

      {isPending && !data ? (
        <DashboardLoadingSkeleton />
      ) : data ? (
        <>
          {showReasonBar && (
            <div className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-[#475467] dark:text-[#94A3B8]">
                Filter churned customers by exit reason:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Price', 'Not using', 'Missing features', 'Other'].map(
                  (reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setReasonFilter(reason)}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                        reasonFilter === reason
                          ? 'bg-[#5B4DF0] text-white'
                          : 'bg-[#F8F9FC] dark:bg-[#1E293B] text-[#475467] dark:text-[#CBD5E1] hover:bg-[#EAECF0] dark:hover:bg-[#334155]'
                      }`}
                    >
                      {reason}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          <MetricGrid>
            <MetricCard
              title="Churn Rate"
              infoLabel="Percentage of starting customers lost in period"
              value={`${data.churnRate.toFixed(1)}%`}
              change={data.churnChange}
              trend={data.churnTrendDirection}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.churnSparkline}
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
              title="Retention Rate"
              infoLabel="Percentage of customers retained in period (100 - Churn Rate)"
              value={`${data.retentionRate.toFixed(1)}%`}
              change={data.retentionChange}
              trend={data.retentionTrendDirection}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.retentionSparkline}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              }
            />

            <MetricCard
              title="Lost Customers"
              infoLabel="Subscriptions canceled in period"
              value={data.lostCustomers.toLocaleString('en-US')}
              change={data.lostChange}
              trend={data.lostTrendDirection}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.lostSparkline}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
              }
            />

            <MetricCard
              title="New Customers"
              infoLabel="New paying customers acquired in period"
              value={data.newCustomers.toLocaleString('en-US')}
              change={data.newChange}
              trend={data.newTrendDirection}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.newSparkline}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
              }
            />
          </MetricGrid>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            <div className="xl:col-span-7 min-w-0">
              <ChartPanel
                title="Churn Rate Trend"
                subtitle={
                  trendMode === 'churn'
                    ? 'Monthly churn rate over time.'
                    : 'Monthly retention rate over time.'
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
                    <button
                      type="button"
                      onClick={() => setTrendMode('churn')}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        trendMode === 'churn'
                          ? 'bg-[#5B4DF0] text-white shadow-2xs'
                          : 'text-[#475467] dark:text-[#94A3B8] hover:text-[#101828] dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      Churn Rate
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrendMode('retention')}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        trendMode === 'retention'
                          ? 'bg-[#5B4DF0] text-white shadow-2xs'
                          : 'text-[#475467] dark:text-[#94A3B8] hover:text-[#101828] dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      Retention Rate
                    </button>
                  </div>
                }
              >
                <AreaTrendChart
                  data={trendPoints}
                  valueLabel={trendMode === 'churn' ? 'Churn' : 'Retention'}
                  strokeColor="#5B4DF0"
                  fillColor="#6356E5"
                  defaultActiveIndex={Math.max(0, trendPoints.length - 1)}
                  formatValue={(value) => `${value.toFixed(1)}%`}
                  formatYAxis={(value) => `${value.toFixed(1)}%`}
                  yMin={trendMode === 'churn' ? 0 : 90}
                  yMaxOverride={trendMode === 'churn' ? 8 : 100}
                />
              </ChartPanel>
            </div>

            <div className="xl:col-span-5 min-w-0">
              <ChartPanel
                title="Churn by Subscription Plan"
                subtitle="Churn rate and customer count by plan."
                className="h-full"
                noBodyPadding
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              >
                {data.churnByPlan.length === 0 ? (
                  <div className="border-t border-[#EAECF0] dark:border-[#1F2937] px-5 py-12 text-center text-xs text-[#667085] dark:text-[#94A3B8]">
                    No plan churn breakdown available for the selected date range.
                  </div>
                ) : (
                  <div className="border-t border-[#EAECF0] dark:border-[#1F2937]">
                    <div className="grid grid-cols-12 px-5 py-2.5 bg-[#FCFCFD] dark:bg-[#161F33] border-b border-[#EAECF0] dark:border-[#1F2937] text-[12px] font-medium text-[#475467] dark:text-[#94A3B8]">
                      <div className="col-span-4">Plan</div>
                      <div className="col-span-5">Churn Rate</div>
                      <div className="col-span-3 text-right">Customers</div>
                    </div>
                    <div className="divide-y divide-[#EAECF0] dark:divide-[#1F2937]">
                      {data.churnByPlan.map((row) => {
                        const barWidth = Math.min(
                          100,
                          Math.round((row.churnRate / maxPlanChurn) * 100),
                        )
                        return (
                          <div
                            key={row.plan}
                            className="grid grid-cols-12 items-center px-5 py-3 text-[13px]"
                          >
                            <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                              <span
                                className="h-3 w-3 rounded-[3px] shrink-0"
                                style={{ backgroundColor: row.color }}
                                aria-hidden="true"
                              />
                              <span className="font-medium text-[#101828] dark:text-[#F8FAFC] truncate">
                                {row.plan}
                              </span>
                            </div>
                            <div className="col-span-5 flex items-center gap-2.5 pr-2">
                              <span className="w-10 font-semibold text-[#101828] dark:text-[#F8FAFC] font-tabular">
                                {row.churnRate.toFixed(1)}%
                              </span>
                              <div className="flex-1 h-3 rounded-full bg-[#F2F4F7] dark:bg-[#1E293B] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#C4BFFA] dark:bg-[#818CF8]"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                            <div className="col-span-3 text-right font-tabular text-[#344054] dark:text-[#CBD5E1]">
                              {row.customers.toLocaleString('en-US')}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </ChartPanel>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            <div className="xl:col-span-8 min-w-0">
              <ChartPanel
                title="Recently Churned Customers"
                subtitle="Customers who cancelled their subscription in the selected period."
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
                    <span>View All Churned</span>
                    <span aria-hidden="true">→</span>
                  </button>
                }
              >
                <DataTable
                  columns={columns}
                  data={filteredChurned}
                  getRowKey={(row) => row.id}
                  onRowClick={(row) => onNavigate('Customer 360', row.id)}
                />
              </ChartPanel>
            </div>

            <div className="xl:col-span-4 min-w-0">
              <InsightsPanel
                title="Retention Insights"
                subtitle="Key takeaways from your customer retention data."
                insights={data.insights}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
