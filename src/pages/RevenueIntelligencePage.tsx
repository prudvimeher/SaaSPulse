import { useState } from 'react'
import { useRevenueIntelligenceQuery } from '../api/queries'
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
import { AreaTrendChart } from '../components/charts/AreaTrendChart'
import { DonutBreakdownChart } from '../components/charts/DonutBreakdownChart'
import type {
  CustomDateRange,
  DateRangeKey,
  PlanPerformanceRow,
} from '../types/analytics'
import { formatCurrency } from '../utils/formatters'

interface RevenueIntelligencePageProps {
  dateRange: DateRangeKey
  onDateRangeChange: (nextRange: DateRangeKey) => void
  customRange: CustomDateRange
  onCustomRangeChange: (nextRange: CustomDateRange) => void
}

export function RevenueIntelligencePage({
  dateRange,
  onDateRangeChange,
  customRange,
  onCustomRangeChange,
}: RevenueIntelligencePageProps) {
  const [chartMetric, setChartMetric] = useState<'MRR' | 'ARR'>('MRR')
  const [selectedPlan, setSelectedPlan] = useState<string>('All')
  const [showPlanFilter, setShowPlanFilter] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)

  const { data, isPending, isError, error, refetch } =
    useRevenueIntelligenceQuery(dateRange, customRange)

  const filteredPlans = !data
    ? []
    : selectedPlan === 'All'
      ? data.planPerformance
      : data.planPerformance.filter((row) => row.plan === selectedPlan)

  const trendPoints = (data?.revenueSeries ?? []).map((pt) => ({
    month: pt.month,
    fullLabel: pt.fullLabel,
    value: chartMetric === 'MRR' ? pt.mrr : pt.arr,
  }))

  const totalCustomers = filteredPlans.reduce((sum, row) => sum + row.customers, 0)
  const totalMrr = filteredPlans.reduce((sum, row) => sum + row.mrr, 0)
  const totalArr = filteredPlans.reduce((sum, row) => sum + row.arr, 0)

  const handleExportPlanCsv = () => {
    const headers = ['Plan', 'Customers', 'MRR', 'ARR', 'MoM Growth', '% of MRR']
    const rows = filteredPlans.map((row) => [
      row.plan,
      String(row.customers),
      String(row.mrr),
      String(row.arr),
      row.momGrowth,
      row.sharePercent,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'saaspulse-plan-revenue.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setExportStatus('Exported CSV')
    window.setTimeout(() => setExportStatus(null), 2000)
  }

  const columns: DataTableColumn<PlanPerformanceRow>[] = [
    {
      key: 'plan',
      header: 'Plan',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span
            className="h-3 w-3 rounded-[3px] shrink-0"
            style={{ backgroundColor: row.color }}
            aria-hidden="true"
          />
          <span className="font-medium text-[#101828] dark:text-[#F8FAFC]">
            {row.plan}
          </span>
        </div>
      ),
      footer: 'Total',
    },
    {
      key: 'customers',
      header: 'Customers',
      align: 'right',
      render: (row) => (
        <span className="font-tabular">{row.customers.toLocaleString('en-US')}</span>
      ),
      footer: totalCustomers.toLocaleString('en-US'),
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
      footer: formatCurrency(totalMrr),
    },
    {
      key: 'arr',
      header: 'ARR',
      align: 'right',
      render: (row) => (
        <span className="font-tabular">{formatCurrency(row.arr)}</span>
      ),
      footer: formatCurrency(totalArr),
    },
    {
      key: 'momGrowth',
      header: 'MoM Growth',
      align: 'right',
      render: (row) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF3] dark:bg-[#064E3B]/50 px-2 py-0.5 text-[11.5px] font-semibold text-[#067647] dark:text-[#6EE7B7] font-tabular">
          <span aria-hidden="true">↗</span>
          <span>{row.momGrowth}</span>
        </span>
      ),
      footer: (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF3] dark:bg-[#064E3B]/50 px-2 py-0.5 text-[11.5px] font-semibold text-[#067647] dark:text-[#6EE7B7] font-tabular">
          <span aria-hidden="true">↗</span>
          <span>{data?.mrrChange ?? '0.0%'}</span>
        </span>
      ),
    },
    {
      key: 'share',
      header: '% of MRR',
      align: 'right',
      render: (row) => <span className="font-tabular">{row.sharePercent}</span>,
      footer:
        selectedPlan === 'All'
          ? '100%'
          : filteredPlans[0]?.sharePercent ?? '100%',
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto w-full">
      <PageHeader
        eyebrow="Revenue Analytics"
        title="Revenue Intelligence"
        description="Track MRR, ARR, and revenue performance across time and subscription plans."
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        customRange={customRange}
        onCustomRangeChange={onCustomRangeChange}
        comparisonLabel={data?.comparisonLabel}
        limitationNote={data?.limitationNote ?? null}
        isFilterActive={showPlanFilter}
        onFilterToggle={() => setShowPlanFilter((prev) => !prev)}
      />

      {isError && (
        <QueryErrorBanner
          message={
            error instanceof Error
              ? error.message
              : 'Unable to load revenue intelligence metrics.'
          }
          onRetry={() => void refetch()}
        />
      )}

      {isPending && !data ? (
        <DashboardLoadingSkeleton />
      ) : data ? (
        <>
          {showPlanFilter && (
            <div className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-[#475467] dark:text-[#94A3B8]">
                Focus plan performance table:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Pro', 'Starter', 'Business', 'Enterprise'].map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                      selectedPlan === plan
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
              infoLabel="Annual Recurring Revenue"
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
              title="Revenue Growth"
              infoLabel="Period-over-period recurring revenue growth"
              value={data.revenueGrowth}
              change={data.revenueGrowthChange}
              trend={data.revenueGrowthTrend}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.growthSparkline}
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
              title="Avg. Revenue per Customer"
              infoLabel="MRR divided by active customers"
              value={formatCurrency(data.arpu, true)}
              change={data.arpuChange}
              trend={data.arpuTrend}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.arpuSparkline}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect width="14" height="18" x="5" y="3" rx="2" />
                  <line x1="9" x2="15" y1="8" y2="8" />
                  <line x1="9" x2="15" y1="12" y2="12" />
                  <line x1="9" x2="13" y1="16" y2="16" />
                </svg>
              }
            />
          </MetricGrid>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            <div className="xl:col-span-8 min-w-0">
              <ChartPanel
                title="MRR & ARR Trend"
                subtitle="Monthly recurring revenue and annual recurring revenue over time."
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
                            ? 'bg-[#3B496B] dark:bg-[#5B4DF0] text-white shadow-2xs'
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
                  fillColor="#475569"
                  defaultActiveIndex={Math.max(0, trendPoints.length - 2)}
                  formatValue={(value) => formatCurrency(value)}
                  formatYAxis={(value) =>
                    value === 0 ? '$0' : `$${Math.round(value / 1000)}K`
                  }
                />
              </ChartPanel>
            </div>

            <div className="xl:col-span-4 min-w-0">
              <ChartPanel
                title="Revenue Breakdown"
                subtitle="MRR distribution by subscription plan."
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

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            <div className="xl:col-span-8 min-w-0">
              <ChartPanel
                title="Subscription Plan Performance"
                subtitle="Revenue, customers, and growth by subscription plan."
                noBodyPadding
                className="h-full"
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                }
                action={
                  <div className="flex items-center gap-2">
                    {exportStatus && (
                      <span className="text-xs font-medium text-[#067647] dark:text-[#6EE7B7] bg-[#ECFDF3] dark:bg-[#064E3B]/50 px-2 py-1 rounded-md">
                        {exportStatus}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleExportPlanCsv}
                      disabled={filteredPlans.length === 0}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <svg className="h-3.5 w-3.5 text-[#475467] dark:text-[#94A3B8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                      <span>Export</span>
                    </button>
                  </div>
                }
              >
                <DataTable
                  columns={columns}
                  data={filteredPlans}
                  getRowKey={(row) => row.plan}
                  showFooter={filteredPlans.length > 0}
                />
              </ChartPanel>
            </div>

            <div className="xl:col-span-4 min-w-0">
              <InsightsPanel
                title="Key Revenue Insights"
                subtitle="Notable revenue changes and trends for the selected period."
                insights={data.insights}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
