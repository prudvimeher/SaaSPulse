import { useEffect, useMemo, useRef, useState } from 'react'
import { CUSTOMERS } from '../data/customers'
import type { NavSection } from './Sidebar'

interface TopbarProps {
  onOpenMobileMenu: () => void
  onNavigate?: (section: NavSection, customerId?: string) => void
}

const SECTIONS: readonly NavSection[] = [
  'Executive Overview',
  'Revenue Intelligence',
  'Customer Retention',
  'Customer Growth',
  'Customer 360',
]

export function Topbar({ onOpenMobileMenu, onNavigate }: TopbarProps) {
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

  const searchResults = useMemo(() => {
    const q = quickSearch.trim().toLowerCase()
    if (!q) return { pages: [], customers: [] }

    const pages = SECTIONS.filter((section) =>
      section.toLowerCase().includes(q),
    )
    const customers = CUSTOMERS.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.plan.toLowerCase().includes(q),
    ).slice(0, 5)

    return { pages, customers }
  }, [quickSearch])

  const hasSearchQuery = quickSearch.trim().length > 0

  return (
    <header className="h-14 shrink-0 bg-white border-b border-[#E6E8EF] px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB] cursor-pointer shrink-0"
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
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]"
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
            className="w-full h-9 rounded-lg border border-[#E4E7EC] bg-[#F9FAFB] pl-9 pr-14 text-[13px] text-[#101828] placeholder:text-[#667085] focus:bg-white focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors"
          />
          <kbd className="pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-[#E4E7EC] bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-[#667085] absolute right-2 top-1/2 -translate-y-1/2">
            ⌘ K
          </kbd>

          {hasSearchQuery && (
            <div className="absolute left-0 right-0 top-10 z-30 rounded-xl border border-[#E4E7EC] bg-white p-2 shadow-lg space-y-1">
              {searchResults.pages.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => {
                    onNavigate?.(section)
                    setQuickSearch('')
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#F9FAFB] cursor-pointer text-left"
                >
                  <span>{section}</span>
                  <span className="text-[11px] text-[#667085]">Page</span>
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
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hover:bg-[#F9FAFB] cursor-pointer text-left"
                >
                  <span className="font-medium text-[#101828]">
                    {customer.name}
                  </span>
                  <span className="text-[11px] text-[#667085]">
                    {customer.plan} · {customer.status}
                  </span>
                </button>
              ))}
              {searchResults.pages.length === 0 &&
                searchResults.customers.length === 0 && (
                  <p className="px-2.5 py-2 text-xs text-[#667085]">
                    No matching dashboards or customers.
                  </p>
                )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 relative">
        <button
          type="button"
          onClick={() => setShowNotifications((prev) => !prev)}
          aria-label="View notifications"
          aria-expanded={showNotifications}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#475467] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
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
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#5B4DF0] ring-2 ring-white" />
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-11 z-30 w-72 rounded-xl border border-[#E4E7EC] bg-white p-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#F2F4F7]">
              <span className="text-xs font-semibold text-[#101828]">
                Notifications
              </span>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="text-[11px] font-medium text-[#4F46E5] hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div className="pt-2 space-y-2 text-xs text-[#475467]">
              <p>
                <span className="font-medium text-[#101828]">DevX Systems</span>{' '}
                payment retry is scheduled for Jun 22.
              </p>
              <p>
                <span className="font-medium text-[#101828]">Nova Systems</span>{' '}
                completed annual Business renewal ($5,988).
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 pl-1">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF0F6] text-xs font-semibold text-[#344054]"
            aria-hidden="true"
          >
            A
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-[13px] font-semibold text-[#101828]">Alex Carter</p>
            <p className="text-[11px] text-[#667085]">Founder &amp; CEO</p>
          </div>
        </div>
      </div>
    </header>
  )
}
