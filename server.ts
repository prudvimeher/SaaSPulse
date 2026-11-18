import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express, { type NextFunction, type Request, type Response } from 'express'
import {
  ApiServiceError,
  getCustomerById,
  getCustomerGrowth,
  getCustomerRetention,
  getCustomerSummary,
  getExecutiveOverview,
  getRevenueIntelligence,
  listCustomers,
} from './server/services.ts'
import type { DateRangeKey } from './src/types/analytics.ts'
import type {
  AccountStatus,
  SortDirection,
  SortField,
  SubscriptionPlan,
} from './src/types/customer.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 3000)

const VALID_DATE_RANGES = new Set<DateRangeKey>([
  'Last 7 Days',
  'Last 30 Days',
  'Last 90 Days',
  'Last 6 Months',
  'Last 12 Months',
  'Custom Date Range',
])

const VALID_PLANS = new Set<'All' | SubscriptionPlan>([
  'All',
  'Starter',
  'Pro',
  'Business',
  'Enterprise',
])

const VALID_STATUSES = new Set<'All' | AccountStatus>([
  'All',
  'Active',
  'Past Due',
  'Canceled',
])


function getQueryString(
  req: Request,
  key: string,
): string | undefined {
  const raw = req.query[key]
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0]
  return undefined
}

function parseDateRange(raw?: string): DateRangeKey {
  if (!raw) return 'Last 6 Months'
  if (!VALID_DATE_RANGES.has(raw as DateRangeKey)) {
    throw new ApiServiceError(400, `Unsupported date_range: ${raw}`)
  }
  return raw as DateRangeKey
}

async function createServer(): Promise<void> {
  const app = express()

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' })
  })

  app.get('/api/overview', (req: Request, res: Response, next: NextFunction) => {
    try {
      const dateRange = parseDateRange(getQueryString(req, 'date_range'))
      const startDate = getQueryString(req, 'start_date')
      const endDate = getQueryString(req, 'end_date')
      res.json(getExecutiveOverview(dateRange, startDate, endDate))
    } catch (err) {
      next(err)
    }
  })

  app.get('/api/revenue', (req: Request, res: Response, next: NextFunction) => {
    try {
      const dateRange = parseDateRange(getQueryString(req, 'date_range'))
      const startDate = getQueryString(req, 'start_date')
      const endDate = getQueryString(req, 'end_date')
      res.json(getRevenueIntelligence(dateRange, startDate, endDate))
    } catch (err) {
      next(err)
    }
  })

  app.get('/api/retention', (req: Request, res: Response, next: NextFunction) => {
    try {
      const dateRange = parseDateRange(getQueryString(req, 'date_range'))
      const startDate = getQueryString(req, 'start_date')
      const endDate = getQueryString(req, 'end_date')
      res.json(getCustomerRetention(dateRange, startDate, endDate))
    } catch (err) {
      next(err)
    }
  })

  app.get('/api/growth', (req: Request, res: Response, next: NextFunction) => {
    try {
      const dateRange = parseDateRange(getQueryString(req, 'date_range'))
      const startDate = getQueryString(req, 'start_date')
      const endDate = getQueryString(req, 'end_date')
      res.json(getCustomerGrowth(dateRange, startDate, endDate))
    } catch (err) {
      next(err)
    }
  })

  app.get(
    '/api/customers/summary',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const dateRange = parseDateRange(getQueryString(req, 'date_range'))
        const startDate = getQueryString(req, 'start_date')
        const endDate = getQueryString(req, 'end_date')
        res.json(getCustomerSummary(dateRange, startDate, endDate))
      } catch (err) {
        next(err)
      }
    },
  )

  app.get('/api/customers', (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = getQueryString(req, 'search') ?? ''
      const rawPlan = getQueryString(req, 'plan') ?? 'All'
      if (!VALID_PLANS.has(rawPlan as 'All' | SubscriptionPlan)) {
        throw new ApiServiceError(400, `Unsupported plan filter: ${rawPlan}`)
      }
      const rawStatus = getQueryString(req, 'status') ?? 'All'
      if (!VALID_STATUSES.has(rawStatus as 'All' | AccountStatus)) {
        throw new ApiServiceError(
          400,
          `Unsupported status filter: ${rawStatus}`,
        )
      }
      const rawSortBy = getQueryString(req, 'sort_by') ?? 'signupDate'
      const sortBy: SortField = rawSortBy === 'mrr' ? 'mrr' : 'signupDate'
      const rawSortDir = getQueryString(req, 'sort_dir') ?? 'desc'
      const sortDir: SortDirection = rawSortDir === 'asc' ? 'asc' : 'desc'
      const page = Math.max(1, Number(getQueryString(req, 'page') ?? 1) || 1)
      const pageSize = Math.min(
        200,
        Math.max(1, Number(getQueryString(req, 'page_size') ?? 7) || 7),
      )

      const rawDateRange = getQueryString(req, 'date_range')
      const dateRange =
        rawDateRange !== undefined ? parseDateRange(rawDateRange) : undefined
      const startDate = getQueryString(req, 'start_date')
      const endDate = getQueryString(req, 'end_date')

      res.json(
        listCustomers({
          search,
          plan: rawPlan as 'All' | SubscriptionPlan,
          status: rawStatus as 'All' | AccountStatus,
          sortBy,
          sortDir,
          page,
          pageSize,
          dateRange,
          startDate,
          endDate,
        }),
      )
    } catch (err) {
      next(err)
    }
  })

  app.get(
    '/api/customers/:customerId',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const rawId = req.params.customerId
        const customerId = Array.isArray(rawId) ? rawId[0] : rawId
        res.json(getCustomerById(customerId))
      } catch (err) {
        next(err)
      }
    },
  )

  // Always return JSON for unknown /api/* routes (never fall through to HTML)
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ detail: 'API endpoint not found.' })
  })

  app.use(
    (err: unknown, _req: Request, res: Response, next: NextFunction) => {
      if (err instanceof ApiServiceError) {
        res.status(err.status).json({ detail: err.message })
        return
      }
      next(err)
    },
  )

  const distDir = path.resolve(__dirname, 'dist')
  const isProd = process.env.NODE_ENV === 'production'

  let mountedVite = false
  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite')
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      })
      app.use(vite.middlewares)
      mountedVite = true
    } catch {
      mountedVite = false
    }
  }

  if (!mountedVite) {
    app.use(express.static(distDir))
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.join(distDir, 'index.html'))
        return
      }
      next()
    })
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`SaaSPulse server listening on http://0.0.0.0:${PORT}`)
  })

  const shutdown = () => {
    server.close(() => process.exit(0))
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

void createServer()
