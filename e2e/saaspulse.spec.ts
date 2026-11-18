import { expect, test } from '@playwright/test'

test.describe('SaaSPulse critical user workflows', () => {
  test('loads Executive Overview, validates custom date ranges, and preserves date range across dashboards', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Executive Overview' }),
    ).toBeVisible()
    await expect(page.getByText('Revenue Performance')).toBeVisible()
    await expect(page.getByText('Recent Customers')).toBeVisible()

    // Toggle MRR / ARR chart view
    await page.getByRole('button', { name: 'ARR', exact: true }).click()
    await expect(
      page.getByText('Annual recurring revenue (ARR) over time.'),
    ).toBeVisible()

    // Switch to Custom Date Range and verify validation + valid apply
    const rangeSelect = page.getByLabel('Reporting date range')
    await rangeSelect.selectOption('Custom Date Range')

    const startInput = page.getByLabel('Custom start date')
    const endInput = page.getByLabel('Custom end date')

    await startInput.fill('2024-05-15')
    await endInput.fill('2024-04-01')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByRole('alert')).toContainText(
      'Start date cannot be later than end date.',
    )

    await startInput.fill('2024-03-01')
    await endInput.fill('2024-04-30')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByText('Mar 1, 2024 – Apr 30, 2024').first()).toBeVisible()

    // Navigate across dashboards and confirm date range persists
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' })
    await mainNav.getByRole('button', { name: 'Revenue Intelligence' }).click()
    await expect(
      page.getByRole('heading', { name: 'Revenue Intelligence' }),
    ).toBeVisible()
    await expect(page.getByLabel('Reporting date range')).toHaveValue(
      'Custom Date Range',
    )

    await mainNav.getByRole('button', { name: 'Customer Retention' }).click()
    await expect(
      page.getByRole('heading', { name: 'Customer Retention' }),
    ).toBeVisible()
    await expect(page.getByLabel('Reporting date range')).toHaveValue(
      'Custom Date Range',
    )

    await mainNav.getByRole('button', { name: 'Customer Growth' }).click()
    await expect(
      page.getByRole('heading', { name: 'Customer Growth', exact: true }),
    ).toBeVisible()
    await expect(page.getByLabel('Reporting date range')).toHaveValue(
      'Custom Date Range',
    )

    // Out-of-bounds custom date range shows empty-state fallbacks cleanly without crashing
    await page.getByLabel('Custom start date').fill('2025-01-01')
    await page.getByLabel('Custom end date').fill('2025-01-10')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByText('No growth data in selected range')).toBeVisible()
  })

  test('navigates from global search and dashboard drilldowns to Customer 360 detail tabs', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Executive Overview', exact: true }),
    ).toBeVisible()

    // Global search shortcut + deep link to Acme Tech
    const globalSearch = page.getByLabel('Global dashboard search')
    await page.keyboard.press('Control+k')
    await expect(globalSearch).toBeFocused()
    await globalSearch.fill('Acme')
    await page.getByRole('button', { name: /Acme Tech/i }).click()

    await expect(
      page.getByRole('heading', { name: 'Customer 360' }),
    ).toBeVisible()
    const detailPanel = page.getByLabel('Customer details for Acme Tech')
    await expect(detailPanel).toBeVisible()

    await detailPanel.getByRole('tab', { name: 'Subscription' }).click()
    await expect(detailPanel.getByText('12 seats')).toBeVisible()
    await detailPanel.getByRole('tab', { name: 'Billing' }).click()
    await expect(detailPanel.getByText('Visa ending in 4242')).toBeVisible()
    await detailPanel.getByRole('tab', { name: 'Activity' }).click()
    await expect(
      detailPanel.getByText('Monthly invoice #1042 paid ($249)'),
    ).toBeVisible()
    await detailPanel.getByRole('tab', { name: 'Notes' }).click()
    await expect(
      detailPanel.getByText(/Key mid-market engineering customer/i),
    ).toBeVisible()

    // Drilldown from Customer Retention churned customer row
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Customer Retention' })
      .click()
    await expect(
      page.getByRole('heading', { name: 'Recently Churned Customers' }),
    ).toBeVisible()
    await page.getByText('Bramble Tech').click()

    const brambleDetail = page.getByLabel('Customer details for Bramble Tech')
    await expect(brambleDetail).toBeVisible()
    await brambleDetail.getByRole('tab', { name: 'Billing' }).click()
    await expect(brambleDetail.getByText('Not scheduled')).toBeVisible()
  })

  test('supports Customer 360 filtering, sorting, pagination, empty reset, and CSV export', async ({
    page,
  }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Customer 360' })
      .click()

    await expect(
      page.getByRole('heading', { name: 'Customer 360' }),
    ).toBeVisible()

    // Combined Plan + Status filter
    await page.getByLabel('Filter by subscription plan').selectOption('Business')
    await page.getByLabel('Filter by account status').selectOption('Past Due')
    const table = page.getByLabel('Customers directory')
    await expect(table.getByText('DevX Systems')).toBeVisible()

    // Empty search + Clear filters
    await page
      .getByLabel('Search customers by name or email')
      .fill('no-such-customer-xyz')
    await expect(table.getByText('No matching customers found')).toBeVisible()
    await table.getByRole('button', { name: 'Clear filters' }).click()
    await expect(table.getByText('Acme Tech')).toBeVisible()

    // Sort by Highest MRR and paginate
    await page.getByLabel('Sort customers').selectOption('mrr:desc')
    await expect(table.locator('tbody tr').first()).toContainText('$1,999')

    await page.getByRole('button', { name: 'Page 2' }).click()
    await expect(table.getByText(/Showing 8–14 of/)).toBeVisible()

    // Export CSV
    const downloadPromise = page.waitForEvent('download')
    await table.getByRole('button', { name: 'Export' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('saaspulse-customers.csv')
    await expect(table.getByRole('status')).toContainText(/Exported \d+ customers/)
  })

  test('persists dark theme across reloads and recovers from transient API errors', async ({
    page,
  }) => {
    let shouldFail = true
    await page.route('**/api/overview**', async (route) => {
      if (shouldFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Simulated overview outage' }),
        })
        return
      }
      await route.continue()
    })

    await page.goto('/')

    // Error banner appears after React Query retry exhausts, then Retry recovers
    const alert = page.getByRole('alert')
    await expect(alert).toContainText('Simulated overview outage')
    shouldFail = false
    await alert.getByRole('button', { name: 'Retry' }).click()
    await expect(page.getByText('Revenue Performance')).toBeVisible()

    // Theme toggle + reload persistence
    await page.getByRole('button', { name: /Switch to dark theme/i }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
