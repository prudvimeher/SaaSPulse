import { useEffect, useState } from 'react'
import type { NavSection } from './components/Sidebar'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import type { CustomDateRange, DateRangeKey } from './types/analytics'
import { DEFAULT_CUSTOM_RANGE } from './utils/dateRanges'
import { Customer360Page } from './pages/Customer360Page'
import { CustomerGrowthPage } from './pages/CustomerGrowthPage'
import { CustomerRetentionPage } from './pages/CustomerRetentionPage'
import { ExecutiveOverviewPage } from './pages/ExecutiveOverviewPage'
import { RevenueIntelligencePage } from './pages/RevenueIntelligencePage'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'saaspulse-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch {
    // Ignore localStorage access errors
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function App() {
  const [activeSection, setActiveSection] =
    useState<NavSection>('Executive Overview')
  const [focusedCustomerId, setFocusedCustomerId] = useState<string | undefined>(
    undefined,
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRangeKey>('Last 6 Months')
  const [customRange, setCustomRange] =
    useState<CustomDateRange>(DEFAULT_CUSTOM_RANGE)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Ignore localStorage access errors
    }
  }, [theme])

  const handleNavigate = (section: NavSection, customerId?: string) => {
    setFocusedCustomerId(customerId)
    setActiveSection(section)
  }

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B1120] text-[#101828] dark:text-[#F1F5F9] flex transition-colors">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(section) => handleNavigate(section)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={handleNavigate}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 min-w-0">
          {activeSection === 'Executive Overview' && (
            <ExecutiveOverviewPage
              onNavigate={handleNavigate}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
          )}
          {activeSection === 'Revenue Intelligence' && (
            <RevenueIntelligencePage
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
          )}
          {activeSection === 'Customer Retention' && (
            <CustomerRetentionPage
              onNavigate={handleNavigate}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
          )}
          {activeSection === 'Customer Growth' && (
            <CustomerGrowthPage
              onNavigate={handleNavigate}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
          )}
          {activeSection === 'Customer 360' && (
            <Customer360Page
              key={focusedCustomerId ?? 'default'}
              initialCustomerId={focusedCustomerId}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
