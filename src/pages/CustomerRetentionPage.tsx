import { useState } from 'react'
import { ChartPanel } from '../components/ChartPanel'
import { DataTable } from '../components/DataTable'
import type { DataTableColumn } from '../components/DataTable'
import { InsightsPanel } from '../components/InsightsPanel'
import { MetricCard } from '../components/MetricCard'
import { MetricGrid } from '../components/MetricGrid'
import { PageHeader } from '../components/PageHeader'
import type { NavSection } from '../components/Sidebar'
import { AreaTrendChart } from '../components/charts/AreaTrendChart'
import { getCustomerRetentionData } from '../data/dashboardData'
import type { ChurnedCustomerRow, DateRangeKey } from '../data/dashboardData'
import { formatCurrency } from '../utils/formatters'

interface CustomerRetentionPageProps {
  onNavigate: (section: NavSection, customerId?: string) => void
}

const REASON_STYLES: Record<ChurnedCustomerRow['reason'], string> = {
  Price: 'bg-[#FEF2F2] text-[#B42318]',
  'Not using': 'bg-[#FFFAEB] text-[#B54708]',
  'Missing features': 'bg-[#F5F3FF] text-[#4338CA]',
  Other: 'bg-[#F2F4F7] text-[#475467]',
}

export function CustomerRetentionPage({
  onNavigate,
}: CustomerRetentionPageProps) {
  const [dateRange, setDateRange] = useState<DateRangeKey>('Last 6 Months')
  const [trendMode, setTrendMode] = useState<'churn' | 'retention'>('churn')
  const [reasonFilter, setReasonFilter] = useState<string>('All')
  const [showReasonBar, setShowReasonBar] = useState(false)

  const data = getCustomerRetentionData(dateRange)

  const filteredChurned =
    reasonFilter === 'All'
      ? data.recentlyChurned
      : data.recentlyChurned.filter((row) => row.reason === reasonFilter)

  const trendPoints = data.churnTrend.map((pt) => ({
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
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF0F6] text-[10.5px] font-semibold text-[#344054]"
            aria-hidden="true"
          >
            {row.initials}
          </span>
          <span className="font-semibold text-[#101828] truncate">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (row) => (
        <span className="inline-flex items-center rounded-md border border-[#E4E7EC] bg-[#F8F9FC] px-2 py-0.5 text-[11.5px] font-medium text-[#344054]">
          {row.plan}
        </span>
      ),
    },
    {
      key: 'mrr',
      header: 'MRR',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[#101828] font-tabular">
          {formatCurrency(row.mrr)}
        </span>
      ),
    },
    {
      key: 'activeFor',
      header: 'Active For',
      render: (row) => (
        <span className="text-[#475467] whitespace-nowrap">{row.activeFor}</span>
      ),
    },
    {
      key: 'churnedOn',
      header: 'Churned On',
      render: (row) => (
        <span className="text-[#475467] font-tabular whitespace-nowrap">
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
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828] transition-colors cursor-pointer"
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
        eyebrow="Customer Analytics"
        title="Customer Retention"
        description="Analyze churn, retention, and customer health across subscription plans."
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isFilterActive={showReasonBar}
        onFilterToggle={() => setShowReasonBar((prev) => !prev)}
      />

      {showReasonBar && (
        <div className="bg-white border border-[#E6E8EF] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-medium text-[#475467]">
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
                      : 'bg-[#F8F9FC] text-[#475467] hover:bg-[#EAECF0]'
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
          infoLabel="Percentage of customers lost in period"
          value={`${data.churnRate.toFixed(1)}%`}
          change="-1.3 pp"
          trend="down"
          sparklinePoints={[5.8, 5.6, 5.2, 4.7, 4.5, data.churnRate]}
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
          infoLabel="Percentage of customers retained in period"
          value={`${data.retentionRate.toFixed(1)}%`}
          change="+1.3 pp"
          trend="up"
          sparklinePoints={[94.2, 94.4, 94.8, 95.3, 95.5, data.retentionRate]}
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
          change="-24.6%"
          trend="down"
          sparklinePoints={[130, 122, 114, 108, 102, data.lostCustomers]}
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
          change="+18.5%"
          trend="up"
          sparklinePoints={[190, 210, 228, 244, 258, data.newCustomers]}
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
              <div className="inline-flex items-center rounded-lg border border-[#E4E7EC] bg-[#F9FAFB] p-0.5">
                <button
                  type="button"
                  onClick={() => setTrendMode('churn')}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    trendMode === 'churn'
                      ? 'bg-[#5B4DF0] text-white shadow-2xs'
                      : 'text-[#475467] hover:text-[#101828]'
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
                      : 'text-[#475467] hover:text-[#101828]'
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
              defaultActiveIndex={5}
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
            <div className="border-t border-[#EAECF0]">
              <div className="grid grid-cols-12 px-5 py-2.5 bg-[#FCFCFD] border-b border-[#EAECF0] text-[12px] font-medium text-[#475467]">
                <div className="col-span-4">Plan</div>
                <div className="col-span-5">Churn Rate</div>
                <div className="col-span-3 text-right">Customers</div>
              </div>
              <div className="divide-y divide-[#EAECF0]">
                {data.churnByPlan.map((row) => {
                  const barWidth = Math.min(100, Math.round((row.churnRate / 8) * 100))
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
                        <span className="font-medium text-[#101828] truncate">
                          {row.plan}
                        </span>
                      </div>
                      <div className="col-span-5 flex items-center gap-2.5 pr-2">
                        <span className="w-10 font-semibold text-[#101828] font-tabular">
                          {row.churnRate.toFixed(1)}%
                        </span>
                        <div className="flex-1 h-3 rounded-full bg-[#F2F4F7] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#C4BFFA]"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      <div className="col-span-3 text-right font-tabular text-[#344054]">
                        {row.customers.toLocaleString('en-US')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#F9FAFB] transition-colors cursor-pointer whitespace-nowrap"
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
    </div>
  )
}
