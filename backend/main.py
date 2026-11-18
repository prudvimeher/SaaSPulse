from typing import Literal, Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    AccountStatus,
    CustomerGrowthResponseSchema,
    CustomerListResponseSchema,
    CustomerRetentionResponseSchema,
    CustomerSchema,
    CustomerSummaryResponseSchema,
    ExecutiveOverviewResponseSchema,
    RevenueIntelligenceResponseSchema,
    SortDirection,
    SortField,
    SubscriptionPlan,
)
from .services import (
    DateRangeKey,
    get_customer_by_id,
    get_customer_growth,
    get_customer_retention,
    get_customer_summary,
    get_executive_overview,
    get_revenue_intelligence,
    list_customers,
)

app = FastAPI(
    title='SaaSPulse Analytics API',
    version='1.0.0',
    description='Backend API serving consistent SaaS metrics, cohorts, and customer records for SaaSPulse.',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    allow_origin_regex=r'https://.*\.run\.app',
    allow_credentials=True,
    allow_methods=['GET'],
    allow_headers=['*'],
)


@app.get('/api/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/api/overview', response_model=ExecutiveOverviewResponseSchema)
def executive_overview(
    date_range: DateRangeKey = Query(default='Last 6 Months'),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
) -> ExecutiveOverviewResponseSchema:
    return get_executive_overview(date_range=date_range, start_date=start_date, end_date=end_date)


@app.get('/api/revenue', response_model=RevenueIntelligenceResponseSchema)
def revenue_intelligence(
    date_range: DateRangeKey = Query(default='Last 6 Months'),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
) -> RevenueIntelligenceResponseSchema:
    return get_revenue_intelligence(date_range=date_range, start_date=start_date, end_date=end_date)


@app.get('/api/retention', response_model=CustomerRetentionResponseSchema)
def customer_retention(
    date_range: DateRangeKey = Query(default='Last 6 Months'),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
) -> CustomerRetentionResponseSchema:
    return get_customer_retention(date_range=date_range, start_date=start_date, end_date=end_date)


@app.get('/api/growth', response_model=CustomerGrowthResponseSchema)
def customer_growth(
    date_range: DateRangeKey = Query(default='Last 6 Months'),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
) -> CustomerGrowthResponseSchema:
    return get_customer_growth(date_range=date_range, start_date=start_date, end_date=end_date)


@app.get('/api/customers/summary', response_model=CustomerSummaryResponseSchema)
def customer_summary(
    date_range: DateRangeKey = Query(default='Last 6 Months'),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
) -> CustomerSummaryResponseSchema:
    return get_customer_summary(date_range=date_range, start_date=start_date, end_date=end_date)


@app.get('/api/customers', response_model=CustomerListResponseSchema)
def customers_list(
    search: str = Query(default=''),
    plan: Literal['All', SubscriptionPlan] = Query(default='All'),
    status: Literal['All', AccountStatus] = Query(default='All'),
    sort_by: SortField = Query(default='signupDate'),
    sort_dir: SortDirection = Query(default='desc'),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=7, ge=1, le=200),
    date_range: Optional[DateRangeKey] = Query(default=None),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
) -> CustomerListResponseSchema:
    return list_customers(
        search=search,
        plan=plan,
        status=status,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size,
        date_range=date_range,
        start_date=start_date,
        end_date=end_date,
    )


@app.get('/api/customers/{customer_id}', response_model=CustomerSchema)
def customer_detail(customer_id: str) -> CustomerSchema:
    return get_customer_by_id(customer_id)
