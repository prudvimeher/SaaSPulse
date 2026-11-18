# SaaSPulse

Full-stack SaaS analytics dashboard built with **React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query** on the frontend and **FastAPI** on the backend.

## Architecture Overview

- **Frontend (`src/`)**: Five interactive analytics views (`Executive Overview`, `Revenue Intelligence`, `Customer Retention`, `Customer Growth`, `Customer 360`) sharing synchronized date-range filtering, global customer search, light/dark themes, and server-state caching via `@tanstack/react-query`.
- **Unified App & API Server (`server.ts`, `server/`)**: Express server on port `3000` serving the React frontend (Vite middleware in development, `dist/` static build in production) and `/api/*` analytics endpoints (`server/services.ts` + `server/dataset.ts`), or proxying `/api/*` to FastAPI (`127.0.0.1:8001`) when `backend/.venv` is active.
- **FastAPI Backend (`backend/`)**: Optional Python FastAPI implementation serving the same dataset and API contracts (`backend/dataset.py`, `backend/schemas.py`, `backend/services.py`).

## Optional Python Backend Setup (FastAPI)

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
backend/.venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8001
```

Run backend tests:

```bash
backend/.venv/bin/pytest -v backend/test_api.py
```

## Frontend Setup (React + Vite)

```bash
npm install
npm run dev
```

Build and lint:

```bash
npm run build
npm run lint
```

## API Endpoints

- `GET /api/health` — Service health check
- `GET /api/overview` — Executive KPIs, revenue trend, plan breakdown, recent customers, insights
- `GET /api/revenue` — Revenue KPIs, MRR/ARR trend, plan revenue breakdown, plan performance table, insights
- `GET /api/retention` — Churn/retention KPIs, churn trend, churn by plan, recently churned customers, insights
- `GET /api/growth` — Customer growth KPIs, growth trend, customer distribution, plan growth table, insights
- `GET /api/customers/summary` — Customer 360 KPI summary
- `GET /api/customers` — Paginated, searchable, filterable, and sortable customer directory
- `GET /api/customers/{customer_id}` — Single customer profile and event details

