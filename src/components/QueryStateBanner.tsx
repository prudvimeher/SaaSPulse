interface QueryErrorBannerProps {
  message: string
  onRetry: () => void
}

export function QueryErrorBanner({ message, onRetry }: QueryErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[#FECDCA] dark:border-[#7F1D1D] bg-[#FEF3F2] dark:bg-[#7F1D1D]/25 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <div className="flex items-center gap-2.5 text-[#B42318] dark:text-[#FCA5A5]">
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center rounded-lg border border-[#FECDCA] dark:border-[#991B1B] bg-white dark:bg-[#111827] px-3 py-1 font-medium text-[#B42318] dark:text-[#FCA5A5] hover:bg-[#FEF3F2] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
      >
        Retry
      </button>
    </div>
  )
}

export function DashboardLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard data"
      className="space-y-5 animate-pulse"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[108px] rounded-xl border border-[#E6E8EF] dark:border-[#1F2937] bg-white dark:bg-[#111827] p-4"
          >
            <div className="h-3 w-24 rounded bg-[#EAECF0] dark:bg-[#1E293B]" />
            <div className="mt-3 h-6 w-28 rounded bg-[#EAECF0] dark:bg-[#1E293B]" />
            <div className="mt-3 h-3 w-32 rounded bg-[#F2F4F7] dark:bg-[#161F33]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[300px] rounded-xl border border-[#E6E8EF] dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5" />
        <div className="xl:col-span-5 h-[300px] rounded-xl border border-[#E6E8EF] dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[260px] rounded-xl border border-[#E6E8EF] dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5" />
        <div className="xl:col-span-4 h-[260px] rounded-xl border border-[#E6E8EF] dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5" />
      </div>
    </div>
  )
}
