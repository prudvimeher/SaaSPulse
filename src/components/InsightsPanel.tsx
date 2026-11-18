import type { InsightData } from '../types/analytics'

interface InsightsPanelProps {
  title: string
  subtitle: string
  insights: InsightData[]
}

function renderInsightIcon(icon: InsightData['icon']) {
  switch (icon) {
    case 'trendUp':
      return (
        <svg
          className="h-4 w-4 text-[#344054] dark:text-[#CBD5E1]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      )
    case 'trendDown':
      return (
        <svg
          className="h-4 w-4 text-[#344054] dark:text-[#CBD5E1]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
          <polyline points="16 17 22 17 22 11" />
        </svg>
      )
    case 'users':
      return (
        <svg
          className="h-4 w-4 text-[#344054] dark:text-[#CBD5E1]"
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
      )
    case 'layers':
      return (
        <svg
          className="h-4 w-4 text-[#344054] dark:text-[#CBD5E1]"
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
      )
    case 'chart':
      return (
        <svg
          className="h-4 w-4 text-[#344054] dark:text-[#CBD5E1]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20V10" />
          <path d="M18 20V4" />
          <path d="M6 20v-4" />
        </svg>
      )
  }
}

export function InsightsPanel({ title, subtitle, insights }: InsightsPanelProps) {
  return (
    <section className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 flex flex-col gap-3.5 min-w-0 h-full transition-colors">
      <div className="flex items-start gap-2.5">
        <div
          className="mt-0.5 text-[#475467] dark:text-[#94A3B8] shrink-0"
          aria-hidden="true"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[#101828] dark:text-[#F8FAFC] leading-5">
            {title}
          </h2>
          <p className="text-[12px] text-[#667085] dark:text-[#94A3B8] mt-0.5 leading-4">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 flex-1">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-xl border border-[#EAECF0] dark:border-[#1F2937] bg-[#FCFCFD] dark:bg-[#161F33] px-3.5 py-3 flex items-start gap-3"
          >
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#EAECF0] dark:border-[#334155] bg-white dark:bg-[#111827]"
              aria-hidden="true"
            >
              {renderInsightIcon(insight.icon)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#101828] dark:text-[#F8FAFC] leading-4">
                {insight.title}
              </p>
              <p className="text-[12px] text-[#667085] dark:text-[#94A3B8] mt-1 leading-4">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
