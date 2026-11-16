import { useState } from 'react'
import type { Customer } from '../types/customer'
import { formatCurrency, formatDate } from '../utils/formatters'
import { StatusBadge } from './StatusBadge'

interface CustomerDetailPanelProps {
  customer: Customer | null
}

type DetailTab = 'Overview' | 'Subscription' | 'Billing' | 'Activity' | 'Notes'

const TABS: readonly DetailTab[] = [
  'Overview',
  'Subscription',
  'Billing',
  'Activity',
  'Notes',
]

export function CustomerDetailPanel({ customer }: CustomerDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('Overview')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!customer) {
    return (
      <aside
        aria-label="Customer details"
        className="bg-white border border-[#E6E8EF] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 flex items-center justify-center min-h-[380px] text-center"
      >
        <div>
          <p className="text-sm font-semibold text-[#101828]">
            No customer selected
          </p>
          <p className="mt-1 text-xs text-[#667085]">
            Select a customer row from the table to inspect their account and subscription details.
          </p>
        </div>
      </aside>
    )
  }

  const history = customer.mrrHistory
  const maxVal = Math.max(...history.map((point) => point.value), 100)
  const yMax = Math.ceil((maxVal * 1.2) / 50) * 50
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax]

  const chartWidth = 280
  const chartHeight = 128
  const padLeft = 36
  const padRight = 14
  const padTop = 14
  const padBottom = 22
  const innerWidth = chartWidth - padLeft - padRight
  const innerHeight = chartHeight - padTop - padBottom

  const points = history.map((point, index) => {
    const x =
      history.length === 1
        ? padLeft + innerWidth / 2
        : padLeft + (index / (history.length - 1)) * innerWidth
    const y = padTop + innerHeight - (point.value / yMax) * innerHeight
    return { ...point, x, y }
  })

  const linePath = points
    .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padTop + innerHeight} L ${points[0].x} ${padTop + innerHeight} Z`
      : ''

  const activePointIndex =
    hoveredIndex !== null && hoveredIndex < points.length
      ? hoveredIndex
      : points.length - 1
  const activePoint = points[activePointIndex]

  return (
    <aside
      aria-label={`Customer details for ${customer.name}`}
      className="bg-white border border-[#E6E8EF] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 flex flex-col gap-4 min-w-0"
    >
      {/* Top Customer Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF0F6] text-sm font-semibold text-[#101828]"
            aria-hidden="true"
          >
            {customer.initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[#101828] leading-5 truncate">
              {customer.name}
            </h2>
            <p className="text-xs text-[#667085] truncate mt-0.5">
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
        className="flex items-center gap-4 border-b border-[#EAECF0] overflow-x-auto"
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
                  ? 'border-[#5B4DF0] text-[#4F46E5]'
                  : 'border-transparent text-[#667085] hover:text-[#101828]'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#EAECF0] bg-[#FCFCFD] p-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#EAECF0] text-[#475467]">
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
                <p className="text-[11px] text-[#667085]">Current Plan</p>
                <p className="text-[13.5px] font-semibold text-[#101828] truncate">
                  {customer.plan}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#EAECF0] bg-[#FCFCFD] p-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#EAECF0] text-[#475467]">
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
                <p className="text-[11px] text-[#667085]">MRR</p>
                <p className="text-[13.5px] font-semibold text-[#101828] font-tabular">
                  {formatCurrency(customer.mrr)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#EAECF0] bg-[#FCFCFD] p-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#EAECF0] text-[#475467]">
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
                <p className="text-[11px] text-[#667085]">Customer Since</p>
                <p className="text-[13px] font-semibold text-[#101828] font-tabular truncate">
                  {formatDate(customer.signupDate)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#EAECF0] bg-[#FCFCFD] p-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#EAECF0] text-[#475467]">
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
                <p className="text-[11px] text-[#667085]">Total Revenue</p>
                <p className="text-[13.5px] font-semibold text-[#101828] font-tabular">
                  {formatCurrency(customer.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue (MRR) Mini Chart */}
          <div className="rounded-xl border border-[#EAECF0] bg-white p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-[13px] font-semibold text-[#101828]">
                Revenue (MRR)
              </h3>
              {activePoint && (
                <div className="rounded-md border border-[#E4E7EC] bg-[#FCFCFD] px-2 py-1 text-right shadow-2xs">
                  <div className="text-[10px] text-[#667085] leading-tight">
                    {activePoint.label}
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#101828] font-tabular leading-tight">
                    {formatCurrency(activePoint.value)}
                  </div>
                </div>
              )}
            </div>

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible"
              role="img"
              aria-label={`Monthly recurring revenue trend for ${customer.name}`}
            >
              <defs>
                <linearGradient id="mrrAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B4DF0" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#5B4DF0" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {yTicks.map((tick) => {
                const y = padTop + innerHeight - (tick / yMax) * innerHeight
                return (
                  <g key={tick}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke="#F2F4F7"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-[#667085] text-[9px] font-tabular"
                    >
                      ${Math.round(tick)}
                    </text>
                  </g>
                )
              })}

              {areaPath && <path d={areaPath} fill="url(#mrrAreaGrad)" />}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#5B4DF0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {points.map((point, index) => {
                const isActive = index === activePointIndex
                return (
                  <g key={point.month}>
                    <text
                      x={point.x}
                      y={chartHeight - 5}
                      textAnchor="middle"
                      className="fill-[#667085] text-[9px]"
                    >
                      {point.month}
                    </text>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? 4 : 2.75}
                      fill={isActive ? '#5B4DF0' : '#FFFFFF'}
                      stroke="#5B4DF0"
                      strokeWidth="1.75"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      )}

      {activeTab === 'Subscription' && (
        <div className="rounded-xl border border-[#EAECF0] bg-[#FCFCFD] p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#667085]">Plan Tier</span>
            <span className="font-semibold text-[#101828]">{customer.plan}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085]">Billing Cycle</span>
            <span className="font-medium text-[#101828]">{customer.billingCycle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085]">Active Seats</span>
            <span className="font-medium text-[#101828] font-tabular">{customer.seats} seats</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085]">Normalized MRR</span>
            <span className="font-semibold text-[#101828] font-tabular">
              {formatCurrency(customer.mrr)}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'Billing' && (
        <div className="rounded-xl border border-[#EAECF0] bg-[#FCFCFD] p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#667085]">Payment Method</span>
            <span className="font-medium text-[#101828]">{customer.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085]">Next Renewal</span>
            <span className="font-medium text-[#101828] font-tabular">
              {customer.nextBillingDate ? formatDate(customer.nextBillingDate) : 'Not scheduled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667085]">Lifetime Value</span>
            <span className="font-semibold text-[#101828] font-tabular">
              {formatCurrency(customer.totalRevenue)}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'Activity' && (
        <ul className="divide-y divide-[#EAECF0] rounded-xl border border-[#EAECF0] bg-white">
          {customer.recentActivity.map((item) => (
            <li key={item.id} className="px-3.5 py-2.5">
              <p className="text-xs font-medium text-[#101828]">{item.title}</p>
              <p className="text-[11px] text-[#667085] mt-0.5 font-tabular">
                {item.timestamp}
              </p>
            </li>
          ))}
        </ul>
      )}

      {activeTab === 'Notes' && (
        <div className="rounded-xl border border-[#EAECF0] bg-[#FCFCFD] p-4">
          <p className="text-xs font-medium text-[#475467] mb-1.5">Account Notes</p>
          <p className="text-xs leading-relaxed text-[#344054]">{customer.notes}</p>
        </div>
      )}
    </aside>
  )
}
