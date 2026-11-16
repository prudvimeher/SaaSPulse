import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import type { NavSection } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { Customer360Page } from './pages/Customer360Page'

export function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('Customer 360')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#101828] flex">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 min-w-0">
          {activeSection === 'Customer 360' ? (
            <Customer360Page />
          ) : (
            <div className="p-6 max-w-[1440px] mx-auto">
              <div className="bg-white border border-[#E6E8EF] rounded-xl p-8 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <p className="text-xs font-medium text-[#667085]">
                  SaaSPulse Workspace
                </p>
                <h1 className="mt-1 text-xl font-bold text-[#101828]">
                  {activeSection}
                </h1>
                <p className="mt-2 text-sm text-[#667085] max-w-md mx-auto">
                  This release focuses on Customer 360. Switch back to inspect customer subscriptions, MRR, and retention status.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection('Customer 360')}
                  className="mt-5 inline-flex items-center rounded-lg bg-[#5B4DF0] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4F46E5] transition-colors cursor-pointer"
                >
                  Open Customer 360
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
