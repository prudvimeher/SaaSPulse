# SaaSPulse

Full-stack SaaS analytics dashboard built with **React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query** on the frontend and **Node + Express + TypeScript** on the backend.

## Architecture Overview

- **Frontend (`src/`)**: Five interactive analytics views (`Executive Overview`, `Revenue Intelligence`, `Customer Retention`, `Customer Growth`, `Customer 360`) sharing synchronized date-range filtering, global customer search, light/dark themes, and server-state caching via `@tanstack/react-query`.
- **Unified App & API Server (`server.ts`, `server/`)**: Express server on port `3000` serving the React frontend (Vite middleware in development, `dist/` static build in production) and `/api/*` analytics endpoints (`server/services.ts` + `server/dataset.ts`).

## Setup & Development

```bash
npm install
npm run dev
```

Build and lint:

```bash
npm run build
npm run lint
```

## Automated Testing

The project uses **Vitest** and **React Testing Library** for unit, component, and page integration tests, and **Playwright** for end-to-end browser tests.

### Test Commands

```bash
# Run all unit, component, and integration tests once
npm test

# Run Vitest in watch mode during development
npm run test:watch

# Install Playwright Chromium browser (first-time setup if needed)
npx playwright install chromium

# Run end-to-end tests (auto-starts the Express + Vite server on port 3000)
npm run test:e2e
```

### Test Layout & Configuration

- `vitest.config.ts` & `src/test/setup.ts` — Vitest configuration with `jsdom` environment, `@testing-library/jest-dom` matchers, and automatic React Testing Library cleanup (server tests in `server/` run in Node via `@vitest-environment node`).
- `server/services.test.ts` — Unit tests for analytics calculations, date window resolution, filtering, sorting, pagination, and error handling.
- `src/utils/*.test.ts` & `src/api/client.test.ts` — Unit tests for date validation, currency/date formatters, and `apiGet` response/error parsing.
- `src/components/**/*.test.tsx` & `src/pages/Customer360Page.test.tsx` — Component and page integration tests covering user interactions, SVG charts, and React Query states.
- `playwright.config.ts` & `e2e/saaspulse.spec.ts` — Chromium E2E tests covering cross-dashboard navigation, custom date ranges, global search, Customer 360 workflows, CSV export, theme persistence, and API retry recovery.

## API Endpoints

- `GET /api/health` — Service health check
- `GET /api/overview` — Executive KPIs, revenue trend, plan breakdown, recent customers, insights
- `GET /api/revenue` — Revenue KPIs, MRR/ARR trend, plan revenue breakdown, plan performance table, insights
- `GET /api/retention` — Churn/retention KPIs, churn trend, churn by plan, recently churned customers, insights
- `GET /api/growth` — Customer growth KPIs, growth trend, customer distribution, plan growth table, insights
- `GET /api/customers/summary` — Customer 360 KPI summary
- `GET /api/customers` — Paginated, searchable, filterable, and sortable customer directory
- `GET /api/customers/{customer_id}` — Single customer profile and event details

