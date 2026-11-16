import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import type { NavSection } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { Customer360Page } from './pages/Customer360Page'
import { CustomerGrowthPage } from './pages/CustomerGrowthPage'
import { CustomerRetentionPage } from './pages/CustomerRetentionPage'
import { ExecutiveOverviewPage } from './pages/ExecutiveOverviewPage'
import { RevenueIntelligencePage } from './pages/RevenueIntelligencePage'

export function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('Executive Overview')
  const [focusedCustomerId, setFocusedCustomerId] = useState<string | undefined>(
    undefined,
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavigate = (section: NavSection, customerId?: string) => {
    setFocusedCustomerId(customerId)
    setActiveSection(section)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#101828] flex">
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
        />

        <main className="flex-1 min-w-0">
          {activeSection === 'Executive Overview' && (
            <ExecutiveOverviewPage onNavigate={handleNavigate} />
          )}
          {activeSection === 'Revenue Intelligence' && (
            <RevenueIntelligencePage />
          )}
          {activeSection === 'Customer Retention' && (
            <CustomerRetentionPage onNavigate={handleNavigate} />
          )}
          {activeSection === 'Customer Growth' && (
            <CustomerGrowthPage onNavigate={handleNavigate} />
          )}
          {activeSection === 'Customer 360' && (
            <Customer360Page
              key={focusedCustomerId ?? 'default'}
              initialCustomerId={focusedCustomerId}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
