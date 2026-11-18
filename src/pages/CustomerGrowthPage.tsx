import { useState } from 'react'
import { useCustomerGrowthQuery } from '../api/queries'
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
import { DonutBreakdownChart } from '../components/charts/DonutBreakdownChart'
import { GrowthComboChart } from '../components/charts/GrowthComboChart'
import type {
  CustomDateRange,
  DateRangeKey,
  PlanGrowthRow,
} from '../types/analytics'

interface CustomerGrowthPageProps {
  onNavigate: (section: NavSection) => void
  dateRange: DateRangeKey
  onDateRangeChange: (nextRange: DateRangeKey) => void
  customRange: CustomDateRange
  onCustomRangeChange: (nextRange: CustomDateRange) => void
}

export function CustomerGrowthPage({
  onNavigate,
  dateRange,
  onDateRangeChange,
  customRange,
  onCustomRangeChange,
}: CustomerGrowthPageProps) {
  const [planFilter, setPlanFilter] = useState<string>('All')
  const [showFilterBar, setShowFilterBar] = useState(false)

  const { data, isPending, isError, error, refetch } =
    useCustomerGrowthQuery(dateRange, customRange)

  const filteredPlanGrowth = !data
    ? []
    : planFilter === 'All'
      ? data.planGrowth
      : data.planGrowth.filter((row) => row.plan === planFilter)

  const totalStart = filteredPlanGrowth.reduce(
    (sum, r) => sum + r.startCustomers,
    0,
  )
  const totalNew = filteredPlanGrowth.reduce((sum, r) => sum + r.newCustomers, 0)
  const totalLost = filteredPlanGrowth.reduce(
    (sum, r) => sum + r.lostCustomers,
    0,
  )
  const totalEnd = filteredPlanGrowth.reduce((sum, r) => sum + r.endCustomers, 0)
  const totalGrowth = filteredPlanGrowth.reduce((sum, r) => sum + r.netGrowth, 0)
  const totalGrowthPct =
    totalStart > 0
      ? `${totalGrowth >= 0 ? '+' : ''}${((totalGrowth / totalStart) * 100).toFixed(1)}%`
      : '+0.0%'

  const columns: DataTableColumn<PlanGrowthRow>[] = [
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
      key: 'start',
      header: 'Customers (Start)',
      align: 'right',
      render: (row) => (
        <span className="font-tabular">
          {row.startCustomers.toLocaleString('en-US')}
        </span>
      ),
      footer: totalStart.toLocaleString('en-US'),
    },
    {
      key: 'new',
      header: 'New',
      align: 'right',
      render: (row) => (
        <span className="font-tabular">{row.newCustomers.toLocaleString('en-US')}</span>
      ),
      footer: totalNew.toLocaleString('en-US'),
    },
    {
      key: 'lost',
      header: 'Lost',
      align: 'right',
      render: (row) => (
        <span className="font-tabular">{row.lostCustomers.toLocaleString('en-US')}</span>
      ),
      footer: totalLost.toLocaleString('en-US'),
    },
    {
      key: 'end',
      header: 'Customers (End)',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[#101828] dark:text-[#F8FAFC] font-tabular">
          {row.endCustomers.toLocaleString('en-US')}
        </span>
      ),
      footer: totalEnd.toLocaleString('en-US'),
    },
    {
      key: 'growth',
      header: 'Growth',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[#101828] dark:text-[#F8FAFC] font-tabular">
          {row.netGrowth >= 0 ? '+' : ''}
          {row.netGrowth}
        </span>
      ),
      footer: `${totalGrowth >= 0 ? '+' : ''}${totalGrowth}`,
    },
    {
      key: 'growthPct',
      header: 'Growth %',
      align: 'right',
      render: (row) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF3] dark:bg-[#064E3B]/50 px-2 py-0.5 text-[11.5px] font-semibold text-[#067647] dark:text-[#6EE7B7] font-tabular">
          <span aria-hidden="true">↗</span>
          <span>{row.growthPercent}</span>
        </span>
      ),
      footer: (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF3] dark:bg-[#064E3B]/50 px-2 py-0.5 text-[11.5px] font-semibold text-[#067647] dark:text-[#6EE7B7] font-tabular">
          <span aria-hidden="true">↗</span>
          <span>{totalGrowthPct}</span>
        </span>
      ),
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto w-full">
      <PageHeader
        eyebrow="Customer Analytics"
        title="Customer Growth"
        description="Track customer acquisition, growth, and changes in your customer base over time."
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        customRange={customRange}
        onCustomRangeChange={onCustomRangeChange}
        comparisonLabel={data?.comparisonLabel}
        limitationNote={data?.limitationNote ?? null}
        isFilterActive={showFilterBar}
        onFilterToggle={() => setShowFilterBar((prev) => !prev)}
      />

      {isError && (
        <QueryErrorBanner
          message={
            error instanceof Error
              ? error.message
              : 'Unable to load customer growth metrics.'
          }
          onRetry={() => void refetch()}
        />
      )}

      {isPending && !data ? (
        <DashboardLoadingSkeleton />
      ) : data ? (
        <>
          {showFilterBar && (
            <div className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-[#475467] dark:text-[#94A3B8]">
                Filter growth table by plan:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Pro', 'Starter', 'Business', 'Enterprise'].map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setPlanFilter(plan)}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                      planFilter === plan
                        ? 'bg-[#5B4DF0] text-white'
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
              title="New Customers"
              infoLabel="Customers acquired during period"
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

            <MetricCard
              title="Active Customers"
              infoLabel="Total active paying customers"
              value={data.activeCustomers.toLocaleString('en-US')}
              change={data.activeChange}
              trend={data.activeTrendDirection}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.activeSparkline}
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
              title="Lost Customers"
              infoLabel="Customers churned during period"
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
              title="Net Customer Growth"
              infoLabel="New customers minus lost customers"
              value={`${data.netGrowth >= 0 ? '+' : ''}${data.netGrowth.toLocaleString('en-US')}`}
              change={data.netChange}
              trend={data.netTrendDirection}
              comparisonLabel={data.comparisonLabel}
              sparklinePoints={data.netSparkline}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              }
            />
          </MetricGrid>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            <div className="xl:col-span-7 min-w-0">
              <ChartPanel
                title="Customer Growth Trend"
                subtitle="New, lost, and net customers over time."
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20v-4" />
                  </svg>
                }
              >
                <GrowthComboChart data={data.growthTrend} />
              </ChartPanel>
            </div>

            <div className="xl:col-span-5 min-w-0">
              <ChartPanel
                title="Customer Distribution"
                subtitle="Customers by account status."
                className="h-full"
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              >
                <div className="pt-2">
                  <DonutBreakdownChart
                    slices={data.distributionSlices}
                    centerValue={data.totalCustomers.toLocaleString('en-US')}
                    centerLabel="Total Customers"
                    valueFormat="count"
                  />
                </div>
              </ChartPanel>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            <div className="xl:col-span-8 min-w-0">
              <ChartPanel
                title="Customer Growth by Subscription Plan"
                subtitle="Change in customer count by plan for the selected period."
                noBodyPadding
                className="h-full"
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                }
                action={
                  <button
                    type="button"
                    onClick={() => onNavigate('Revenue Intelligence')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>View Plan Details</span>
                    <span aria-hidden="true">→</span>
                  </button>
                }
              >
                <DataTable
                  columns={columns}
                  data={filteredPlanGrowth}
                  getRowKey={(row) => row.plan}
                  showFooter={filteredPlanGrowth.length > 0}
                />
              </ChartPanel>
            </div>

            <div className="xl:col-span-4 min-w-0">
              <InsightsPanel
                title="Key Growth Insights"
                subtitle="Important changes in your customer growth."
                insights={data.insights}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
