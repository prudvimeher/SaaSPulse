import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NavSection } from './Sidebar'
import { Topbar } from './Topbar'

function renderTopbar(overrides?: {
  theme?: 'light' | 'dark'
  onNavigate?: (section: NavSection, customerId?: string) => void
  onToggleTheme?: () => void
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const onNavigate =
    overrides?.onNavigate ?? vi.fn<(section: NavSection, customerId?: string) => void>()
  const onToggleTheme = overrides?.onToggleTheme ?? vi.fn<() => void>()

  render(
    <QueryClientProvider client={queryClient}>
      <Topbar
        onOpenMobileMenu={vi.fn()}
        onNavigate={onNavigate}
        theme={overrides?.theme ?? 'light'}
        onToggleTheme={onToggleTheme}
      />
    </QueryClientProvider>,
  )

  return { onNavigate, onToggleTheme }
}

describe('Topbar', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('navigates to matching pages and searched customers from global search', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'cust-001',
              name: 'Acme Tech',
              email: 'billing@acme.tech',
              initials: 'AT',
              plan: 'Pro',
              mrr: 249,
              status: 'Active',
              signupDate: '2024-06-18',
              billingCycle: 'Monthly',
              totalRevenue: 249,
              seats: 12,
              nextBillingDate: '2024-07-18',
              paymentMethod: 'Visa ending in 4242',
              mrrHistory: [],
              recentActivity: [],
              notes: '',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 5,
          totalPages: 1,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )

    const { onNavigate } = renderTopbar()
    const searchInput = screen.getByLabelText('Global dashboard search')

    await user.type(searchInput, 'Ret')
    const pageResult = screen.getByRole('button', {
      name: /Customer Retention/i,
    })
    await user.click(pageResult)
    expect(onNavigate).toHaveBeenCalledWith('Customer Retention')
    expect(searchInput).toHaveValue('')

    await user.type(searchInput, 'Acme')
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Acme Tech/i }),
      ).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /Acme Tech/i }))
    expect(onNavigate).toHaveBeenCalledWith('Customer 360', 'cust-001')
  })

  it('supports Ctrl+K shortcut, Escape reset, notifications popover, and theme toggle', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [],
          total: 0,
          page: 1,
          pageSize: 5,
          totalPages: 1,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )

    const { onToggleTheme } = renderTopbar({ theme: 'dark' })
    const searchInput = screen.getByLabelText('Global dashboard search')

    await user.keyboard('{Control>}k{/Control}')
    expect(searchInput).toHaveFocus()

    await user.type(searchInput, 'zzz-none')
    await waitFor(() => {
      expect(
        screen.getByText('No matching dashboards or customers.'),
      ).toBeInTheDocument()
    })

    await user.keyboard('{Escape}')
    expect(searchInput).toHaveValue('')
    expect(
      screen.queryByText('No matching dashboards or customers.'),
    ).not.toBeInTheDocument()

    const notifButton = screen.getByRole('button', {
      name: 'View notifications',
    })
    await user.click(notifButton)
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()

    const themeButton = screen.getByRole('button', {
      name: /Current theme: dark/i,
    })
    expect(themeButton).toHaveAttribute('aria-pressed', 'true')
    await user.click(themeButton)
    expect(onToggleTheme).toHaveBeenCalledTimes(1)
  })
})
