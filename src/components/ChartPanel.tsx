import type { ReactNode } from 'react'

interface ChartPanelProps {
  title: string
  subtitle: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  noBodyPadding?: boolean
}

export function ChartPanel({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
  noBodyPadding = false,
}: ChartPanelProps) {
  return (
    <section
      className={`bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col min-w-0 transition-colors ${className}`}
    >
      <div className="px-5 pt-4 pb-3.5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {icon && (
            <div
              className="mt-0.5 text-[#475467] dark:text-[#94A3B8] shrink-0"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[#101828] dark:text-[#F8FAFC] leading-5">
              {title}
            </h2>
            <p className="text-[12px] text-[#667085] dark:text-[#94A3B8] mt-0.5 leading-4">
              {subtitle}
            </p>
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className={noBodyPadding ? '' : 'px-5 pb-5'}>{children}</div>
    </section>
  )
}
