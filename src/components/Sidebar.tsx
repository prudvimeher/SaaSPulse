export type NavSection =
  | 'Executive Overview'
  | 'Revenue Intelligence'
  | 'Customer Retention'
  | 'Customer Growth'
  | 'Customer 360'

interface SidebarProps {
  activeSection: NavSection
  onSelectSection: (section: NavSection) => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({
  activeSection,
  onSelectSection,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems: { label: NavSection; icon: React.ReactNode }[] = [
    {
      label: 'Executive Overview',
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Revenue Intelligence',
      icon: (
        <svg
          className="h-4 w-4"
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
      ),
    },
    {
      label: 'Customer Retention',
      icon: (
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
      ),
    },
    {
      label: 'Customer Growth',
      icon: (
        <svg
          className="h-4 w-4"
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
      ),
    },
    {
      label: 'Customer 360',
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ]

  const content = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-[#111827] border-r border-[#E6E8EF] dark:border-[#1F2937] w-[232px] px-3.5 py-4 transition-colors">
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between px-2 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md text-[#101828] dark:text-[#F8FAFC]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="3" y="13" width="4" height="8" rx="1.2" />
                <rect x="10" y="8" width="4" height="13" rx="1.2" />
                <rect x="17" y="4" width="4" height="17" rx="1.2" />
              </svg>
            </div>
            <span className="text-[16px] font-bold tracking-tight text-[#101828] dark:text-[#F8FAFC]">
              SaaSPulse
            </span>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden rounded-md p-1 text-[#667085] dark:text-[#94A3B8] hover:bg-[#F2F4F7] dark:hover:bg-[#1E293B] cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Main Navigation */}
        <nav aria-label="Main navigation" className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.label
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  onSelectSection(item.label)
                  onCloseMobile()
                }}
                className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#F0EFFD] dark:bg-[#5B4DF0]/20 text-[#4F46E5] dark:text-[#A5B4FC] font-semibold'
                    : 'text-[#344054] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] hover:text-[#101828] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <span
                  className={
                    isActive
                      ? 'text-[#4F46E5] dark:text-[#A5B4FC]'
                      : 'text-[#475467] dark:text-[#94A3B8]'
                  }
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Favorites */}
        <div className="mt-7 px-2.5">
          <p className="text-[11px] font-semibold text-[#667085] dark:text-[#94A3B8] mb-2">
            Favorites
          </p>
          <div className="space-y-1 -mx-2.5">
            <button
              type="button"
              onClick={() => {
                onSelectSection('Revenue Intelligence')
                onCloseMobile()
              }}
              className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#344054] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer whitespace-nowrap"
            >
              <svg
                className="h-4 w-4 text-[#475467] dark:text-[#94A3B8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Revenue Trends</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectSection('Customer Retention')
                onCloseMobile()
              }}
              className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#344054] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer whitespace-nowrap"
            >
              <svg
                className="h-4 w-4 text-[#475467] dark:text-[#94A3B8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Churn Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Utility Links */}
      <div className="pt-4 border-t border-[#F2F4F7] dark:border-[#1F2937] space-y-1">
        <button
          type="button"
          onClick={() => {
            onSelectSection('Customer 360')
            onCloseMobile()
          }}
          className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#344054] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer whitespace-nowrap"
        >
          <svg
            className="h-4 w-4 text-[#475467] dark:text-[#94A3B8]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
          <span>Settings</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectSection('Customer 360')
            onCloseMobile()
          }}
          className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#344054] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer whitespace-nowrap"
        >
          <svg
            className="h-4 w-4 text-[#475467] dark:text-[#94A3B8]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <span>Help &amp; Support</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:block shrink-0">{content}</aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#101828]/30 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-50 h-full">{content}</aside>
        </div>
      )}
    </>
  )
}
