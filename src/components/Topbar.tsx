import { useEffect, useMemo, useRef, useState } from 'react'
import { useGlobalCustomerSearchQuery } from '../api/queries'
import type { NavSection } from './Sidebar'

interface TopbarProps {
  onOpenMobileMenu: () => void
  onNavigate?: (section: NavSection, customerId?: string) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const SECTIONS: readonly NavSection[] = [
  'Executive Overview',
  'Revenue Intelligence',
  'Customer Retention',
  'Customer Growth',
  'Customer 360',
]

export function Topbar({
  onOpenMobileMenu,
  onNavigate,
  theme,
  onToggleTheme,
}: TopbarProps) {
  const [quickSearch, setQuickSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setQuickSearch('')
        setShowNotifications(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const { data: customerSearchData, isFetching: isSearchingCustomers } =
    useGlobalCustomerSearchQuery(quickSearch)

  const matchingPages = useMemo(() => {
    const q = quickSearch.trim().toLowerCase()
    if (!q) return []
    return SECTIONS.filter((section) => section.toLowerCase().includes(q))
  }, [quickSearch])

  const searchResults = {
    pages: matchingPages,
    customers: customerSearchData?.items ?? [],
  }

  const hasSearchQuery = quickSearch.trim().length > 0
  const themeToggleLabel =
    theme === 'light'
      ? 'Current theme: light. Switch to dark theme'
      : 'Current theme: dark. Switch to light theme'

  return (
    <header className="h-14 shrink-0 bg-white dark:bg-[#111827] border-b border-[#E6E8EF] dark:border-[#1F2937] px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E7EC] dark:border-[#334155] text-[#344054] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] cursor-pointer shrink-0"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        <div className="relative w-full max-w-md">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085] dark:text-[#94A3B8]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={searchInputRef}
            type="search"
            value={quickSearch}
            onChange={(event) => setQuickSearch(event.target.value)}
            placeholder="Search for customers, plans, or metrics..."
            aria-label="Global dashboard search"
            className="w-full h-9 rounded-lg border border-[#E4E7EC] dark:border-[#334155] bg-[#F9FAFB] dark:bg-[#0F172A] pl-9 pr-14 text-[13px] text-[#101828] dark:text-[#F1F5F9] placeholder:text-[#667085] dark:placeholder:text-[#64748B] focus:bg-white dark:focus:bg-[#111827] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors"
          />
          <kbd className="pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-1.5 py-0.5 text-[10.5px] font-medium text-[#667085] dark:text-[#94A3B8] absolute right-2 top-1/2 -translate-y-1/2">
            ⌘ K
          </kbd>

          {hasSearchQuery && (
            <div className="absolute left-0 right-0 top-10 z-30 rounded-xl border border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#111827] p-2 shadow-lg space-y-1">
              {searchResults.pages.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => {
                    onNavigate?.(section)
                    setQuickSearch('')
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] cursor-pointer text-left"
                >
                  <span>{section}</span>
                  <span className="text-[11px] text-[#667085] dark:text-[#94A3B8]">
                    Page
                  </span>
                </button>
              ))}
              {searchResults.customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    onNavigate?.('Customer 360', customer.id)
                    setQuickSearch('')
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] cursor-pointer text-left"
                >
                  <span className="font-medium text-[#101828] dark:text-[#F8FAFC]">
                    {customer.name}
                  </span>
                  <span className="text-[11px] text-[#667085] dark:text-[#94A3B8]">
                    {customer.plan} · {customer.status}
                  </span>
                </button>
              ))}
              {searchResults.pages.length === 0 &&
                searchResults.customers.length === 0 && (
                  <p className="px-2.5 py-2 text-xs text-[#667085] dark:text-[#94A3B8]">
                    {isSearchingCustomers
                      ? 'Searching customers...'
                      : 'No matching dashboards or customers.'}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={themeToggleLabel}
          title={themeToggleLabel}
          aria-pressed={theme === 'dark'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#475467] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          {theme === 'light' ? (
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          ) : (
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowNotifications((prev) => !prev)}
          aria-label="View notifications"
          aria-expanded={showNotifications}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#475467] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          <svg
            className="h-[18px] w-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#5B4DF0] ring-2 ring-white dark:ring-[#111827]" />
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-11 z-30 w-72 rounded-xl border border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#111827] p-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#F2F4F7] dark:border-[#1F2937]">
              <span className="text-xs font-semibold text-[#101828] dark:text-[#F8FAFC]">
                Notifications
              </span>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="text-[11px] font-medium text-[#4F46E5] dark:text-[#A5B4FC] hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div className="pt-2 space-y-2 text-xs text-[#475467] dark:text-[#94A3B8]">
              <p>
                <span className="font-medium text-[#101828] dark:text-[#F8FAFC]">
                  DevX Systems
                </span>{' '}
                payment retry is scheduled for Jun 22.
              </p>
              <p>
                <span className="font-medium text-[#101828] dark:text-[#F8FAFC]">
                  Nova Systems
                </span>{' '}
                completed annual Business renewal ($5,988).
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 pl-1">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF0F6] dark:bg-[#1E293B] text-xs font-semibold text-[#344054] dark:text-[#E2E8F0]"
            aria-hidden="true"
          >
            A
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-[13px] font-semibold text-[#101828] dark:text-[#F8FAFC]">
              Alex Carter
            </p>
            <p className="text-[11px] text-[#667085] dark:text-[#94A3B8]">
              Founder &amp; CEO
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
