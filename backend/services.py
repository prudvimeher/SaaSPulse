from dataclasses import dataclass
from datetime import date
import math
from typing import Literal, Optional

from fastapi import HTTPException

from .dataset import (
    CUSTOMER_RECORDS,
    CustomerRecord,
    DATASET_MAX_DATE,
    DATASET_MIN_DATE,
    MONTH_END_DATES,
    MONTH_FULL_LABELS,
    MONTH_KEYS,
    MONTH_SHORT_LABELS,
)
from .schemas import (
    AccountStatus,
    ChurnTrendPointSchema,
    ChurnedCustomerRowSchema,
    CustomerGrowthResponseSchema,
    CustomerListResponseSchema,
    CustomerRetentionResponseSchema,
    CustomerSchema,
    CustomerSummaryResponseSchema,
    ExecutiveOverviewResponseSchema,
    GrowthTrendPointSchema,
    InsightDataSchema,
    PlanBreakdownSliceSchema,
    PlanChurnRowSchema,
    PlanGrowthRowSchema,
    PlanPerformanceRowSchema,
    RecentCustomerRowSchema,
    RevenueIntelligenceResponseSchema,
    SortDirection,
    SortField,
    SubscriptionPlan,
    TrendDirection,
    TrendPointSchema,
)

DateRangeKey = Literal[
    'Last 7 Days',
    'Last 30 Days',
    'Last 90 Days',
    'Last 6 Months',
    'Last 12 Months',
    'Custom Date Range',
]

PLAN_ORDER: tuple[SubscriptionPlan, ...] = ('Pro', 'Starter', 'Business', 'Enterprise')
CHURN_PLAN_ORDER: tuple[SubscriptionPlan, ...] = ('Starter', 'Pro', 'Business', 'Enterprise')

EXEC_PLAN_COLORS: dict[SubscriptionPlan, str] = {
    'Pro': '#64748B',
    'Starter': '#94A3B8',
    'Business': '#CBD5E1',
    'Enterprise': '#E2E8F0',
}

REV_PLAN_COLORS: dict[SubscriptionPlan, str] = {
    'Pro': '#475569',
    'Starter': '#94A3B8',
    'Business': '#CBD5E1',
    'Enterprise': '#E2E8F0',
}

CHURN_PLAN_COLORS: dict[SubscriptionPlan, str] = {
    'Starter': '#A59FF7',
    'Pro': '#6356E5',
    'Business': '#8177ED',
    'Enterprise': '#9D95F2',
}

GROWTH_PLAN_COLORS: dict[SubscriptionPlan, str] = {
    'Pro': '#6D5CE8',
    'Starter': '#8E83EE',
    'Business': '#B5AEF5',
    'Enterprise': '#D7D3FA',
}


@dataclass(frozen=True)
class DateWindow:
    start_date: str
    end_date: str
    effective_start: str
    effective_end: str
    comparison_label: str
    limitation_note: Optional[str]
    months: list[str]
    previous_month: Optional[str]


def _format_display_date(iso_date: str) -> str:
    year_s, month_s, day_s = iso_date.split('-')
    months = (
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    )
    return f'{months[int(month_s) - 1]} {int(day_s)}, {year_s}'


def _parse_iso_date(value: str) -> Optional[date]:
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def resolve_date_window(
    date_range: DateRangeKey = 'Last 6 Months',
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> DateWindow:
    limitation_note: Optional[str] = None

    if date_range == 'Last 7 Days':
        resolved_start = '2024-06-12'
        resolved_end = '2024-06-18'
        comparison_label = 'Jun 12 – Jun 18, 2024'
        limitation_note = (
            'Monthly trend charts reflect the Jun 2024 monthly snapshot; '
            'customer metrics and signups reflect exact Jun 12–18 records.'
        )
    elif date_range == 'Last 30 Days':
        resolved_start = '2024-05-20'
        resolved_end = '2024-06-18'
        comparison_label = 'vs. Previous 30 Days'
    elif date_range == 'Last 90 Days':
        resolved_start = '2024-03-21'
        resolved_end = '2024-06-18'
        comparison_label = 'vs. Previous 90 Days'
    elif date_range == 'Last 6 Months':
        resolved_start = DATASET_MIN_DATE
        resolved_end = DATASET_MAX_DATE
        comparison_label = 'Jan – Jun 2024'
    elif date_range == 'Last 12 Months':
        resolved_start = '2023-06-19'
        resolved_end = DATASET_MAX_DATE
        comparison_label = 'vs. Available 2024 Baseline'
        limitation_note = (
            'Seeded ledger spans Jan 1 – Jun 18, 2024 (with 2023 baseline cohorts); '
            'monthly series begins in Jan 2024.'
        )
    elif date_range == 'Custom Date Range':
        if not start_date or not end_date:
            raise HTTPException(
                status_code=400,
                detail='Both start_date and end_date are required for Custom Date Range.',
            )
        parsed_start = _parse_iso_date(start_date)
        parsed_end = _parse_iso_date(end_date)
        if parsed_start is None or parsed_end is None:
            raise HTTPException(
                status_code=400,
                detail='Invalid date format. Expected YYYY-MM-DD.',
            )
        if parsed_start > parsed_end:
            raise HTTPException(
                status_code=400,
                detail='Start date cannot be later than end date.',
            )
        resolved_start = start_date
        resolved_end = end_date
        comparison_label = f'{_format_display_date(resolved_start)} – {_format_display_date(resolved_end)}'
        if resolved_end < DATASET_MIN_DATE or resolved_start > DATASET_MAX_DATE:
            limitation_note = (
                'No records exist in the selected custom range. '
                'Historical data spans Jan 1 – Jun 18, 2024.'
            )
        elif resolved_start < DATASET_MIN_DATE or resolved_end > DATASET_MAX_DATE:
            limitation_note = 'Results reflect available history within Jan 1 – Jun 18, 2024.'
        elif resolved_start[:7] == resolved_end[:7]:
            limitation_note = (
                'Monthly trend charts reflect the selected month; '
                'customer totals reflect exact dates within the window.'
            )
    else:
        raise HTTPException(status_code=400, detail=f'Unsupported date_range: {date_range}')

    start_mk = resolved_start[:7]
    end_mk = resolved_end[:7]
    months = [mk for mk in MONTH_KEYS if start_mk <= mk <= end_mk]

    if months:
        first_idx = MONTH_KEYS.index(months[0])
        previous_month = MONTH_KEYS[first_idx - 1] if first_idx > 0 else None
    else:
        previous_month = None

    effective_start = max(resolved_start, DATASET_MIN_DATE)
    effective_end = min(resolved_end, DATASET_MAX_DATE)

    return DateWindow(
        start_date=resolved_start,
        end_date=resolved_end,
        effective_start=effective_start,
        effective_end=effective_end,
        comparison_label=comparison_label,
        limitation_note=limitation_note,
        months=months,
        previous_month=previous_month,
    )


def _format_percent_delta(current: float, baseline: float) -> tuple[str, TrendDirection, float]:
    if baseline <= 0:
        return ('0.0%', 'up', 0.0)
    pct = ((current - baseline) / baseline) * 100.0
    rounded = round(pct, 1)
    sign = '+' if rounded > 0 else ''
    trend: TrendDirection = 'up' if rounded >= 0 else 'down'
    return (f'{sign}{rounded:.1f}%', trend, rounded)


def _format_pp_delta(current: float, baseline: float) -> tuple[str, TrendDirection, float]:
    diff = round(current - baseline, 1)
    sign = '+' if diff > 0 else ''
    trend: TrendDirection = 'up' if diff >= 0 else 'down'
    return (f'{sign}{diff:.1f} pp', trend, diff)


def _month_stats(month_key: str, plan: Optional[SubscriptionPlan] = None) -> dict[str, float | int]:
    month_start = f'{month_key}-01'
    month_end = MONTH_END_DATES[month_key]

    records = (
        [r for r in CUSTOMER_RECORDS if r.customer.plan == plan]
        if plan is not None
        else CUSTOMER_RECORDS
    )

    mrr = sum(r.active_mrr_for_month(month_key) for r in records)
    active_customers = sum(1 for r in records if r.active_mrr_for_month(month_key) > 0)
    retained_start = sum(
        1
        for r in records
        if r.customer.signupDate < month_start
        and (r.canceled_date is None or r.canceled_date >= month_start)
    )
    retained_end = sum(1 for r in records if r.is_retained_on(month_end))
    new_customers = sum(
        1 for r in records if month_start <= r.customer.signupDate <= month_end
    )
    lost_customers = sum(
        1
        for r in records
        if r.canceled_date is not None and month_start <= r.canceled_date <= month_end
    )
    churn_rate = round((lost_customers / retained_start) * 100.0, 1) if retained_start > 0 else 0.0
    retention_rate = round(100.0 - churn_rate, 1) if retained_start > 0 else 0.0

    return {
        'mrr': mrr,
        'arr': mrr * 12,
        'active_customers': active_customers,
        'retained_start': retained_start,
        'retained_end': retained_end,
        'new_customers': new_customers,
        'lost_customers': lost_customers,
        'churn_rate': churn_rate,
        'retention_rate': retention_rate,
    }


def _period_customer_counts(
    effective_start: str,
    effective_end: str,
    plan: Optional[SubscriptionPlan] = None,
) -> dict[str, float | int]:
    if effective_start > effective_end:
        return {
            'retained_start': 0,
            'retained_end': 0,
            'new_customers': 0,
            'lost_customers': 0,
            'churn_rate': 0.0,
            'retention_rate': 0.0,
        }

    records = (
        [r for r in CUSTOMER_RECORDS if r.customer.plan == plan]
        if plan is not None
        else CUSTOMER_RECORDS
    )

    retained_start = sum(
        1
        for r in records
        if r.customer.signupDate < effective_start
        and (r.canceled_date is None or r.canceled_date >= effective_start)
    )
    retained_end = sum(1 for r in records if r.is_retained_on(effective_end))
    new_customers = sum(
        1 for r in records if effective_start <= r.customer.signupDate <= effective_end
    )
    lost_customers = sum(
        1
        for r in records
        if r.canceled_date is not None and effective_start <= r.canceled_date <= effective_end
    )
    churn_rate = round((lost_customers / retained_start) * 100.0, 1) if retained_start > 0 else 0.0
    retention_rate = round(100.0 - churn_rate, 1) if retained_start > 0 else 0.0

    return {
        'retained_start': retained_start,
        'retained_end': retained_end,
        'new_customers': new_customers,
        'lost_customers': lost_customers,
        'churn_rate': churn_rate,
        'retention_rate': retention_rate,
    }


def _active_duration_label(signup_date: str, canceled_date: str) -> str:
    s = date.fromisoformat(signup_date)
    c = date.fromisoformat(canceled_date)
    months = max(1, (c.year - s.year) * 12 + (c.month - s.month))
    return f'{months} month' if months == 1 else f'{months} months'


def get_executive_overview(
    date_range: DateRangeKey = 'Last 6 Months',
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> ExecutiveOverviewResponseSchema:
    window = resolve_date_window(date_range, start_date, end_date)
    months = window.months

    if not months:
        return ExecutiveOverviewResponseSchema(
            mrr=0,
            arr=0,
            totalCustomers=0,
            churnRate=0.0,
            mrrChange='0.0%',
            mrrTrend='up',
            customersChange='0.0%',
            customersTrend='up',
            churnChange='0.0 pp',
            churnTrendDirection='up',
            mrrSparkline=[],
            arrSparkline=[],
            customersSparkline=[],
            churnSparkline=[],
            revenueSeries=[],
            planSlices=[],
            recentCustomers=[],
            insights=[
                InsightDataSchema(
                    id='exec-empty',
                    icon='chart',
                    title='No snapshot data in selected range',
                    description='Adjust the custom date range to fall within Jan 1 – Jun 18, 2024.',
                )
            ],
            comparisonLabel=window.comparison_label,
            limitationNote=window.limitation_note,
            startDate=window.start_date,
            endDate=window.end_date,
        )

    month_stats = [_month_stats(mk) for mk in months]
    latest_mk = months[-1]
    latest_stats = month_stats[-1]

    baseline_mk = window.previous_month or months[0]
    baseline_stats = _month_stats(baseline_mk)

    mrr = int(latest_stats['mrr'])
    arr = mrr * 12
    total_customers = int(latest_stats['active_customers'])

    period_counts = _period_customer_counts(window.effective_start, window.effective_end)
    churn_rate = float(period_counts['churn_rate'])
    baseline_churn = float(baseline_stats['churn_rate'])

    baseline_mrr = int(baseline_stats['mrr'])
    baseline_customers = int(baseline_stats['active_customers'])

    mrr_label, mrr_trend, _ = _format_percent_delta(mrr, baseline_mrr)
    cust_label, cust_trend, _ = _format_percent_delta(total_customers, baseline_customers)
    churn_label, churn_trend, churn_diff = _format_pp_delta(churn_rate, baseline_churn)

    revenue_series = [
        TrendPointSchema(
            month=MONTH_SHORT_LABELS[mk],
            fullLabel=MONTH_FULL_LABELS[mk],
            mrr=int(st['mrr']),
            arr=int(st['arr']),
        )
        for mk, st in zip(months, month_stats)
    ]

    plan_slices: list[PlanBreakdownSliceSchema] = []
    for plan in PLAN_ORDER:
        plan_stats = _month_stats(latest_mk, plan)
        plan_mrr = int(plan_stats['mrr'])
        pct = round((plan_mrr / max(mrr, 1)) * 100.0, 1)
        plan_slices.append(
            PlanBreakdownSliceSchema(
                plan=plan,
                amount=plan_mrr,
                percentage=pct,
                color=EXEC_PLAN_COLORS[plan],
            )
        )

    recent_records = [
        r
        for r in CUSTOMER_RECORDS
        if window.effective_start <= r.customer.signupDate <= window.effective_end
    ]
    recent_records.sort(key=lambda r: r.customer.signupDate, reverse=True)
    recent_customers = [
        RecentCustomerRowSchema(
            id=r.customer.id,
            name=r.customer.name,
            initials=r.customer.initials,
            plan=r.customer.plan,
            mrr=r.customer.mrr,
            status=r.customer.status,
            signedUp=_format_display_date(r.customer.signupDate),
        )
        for r in recent_records[:4]
    ]

    period_new = int(period_counts['new_customers'])
    prev_new_base = int(baseline_stats['new_customers'])
    avg_new_per_month = period_new / len(months)
    new_rate_label, _, _ = _format_percent_delta(
        period_new if len(months) == 1 else avg_new_per_month,
        prev_new_base,
    )

    insights = [
        InsightDataSchema(
            id='exec-1',
            icon='trendUp' if mrr_trend == 'up' else 'trendDown',
            title=f'MRR changed by {mrr_label}',
            description=f'From ${baseline_mrr:,} ({MONTH_FULL_LABELS[baseline_mk]}) to ${mrr:,} ({MONTH_FULL_LABELS[latest_mk]}).',
        ),
        InsightDataSchema(
            id='exec-2',
            icon='users',
            title=f'{period_new:,} new customers in period',
            description=f'{len(recent_customers)} recent signup{"" if len(recent_customers) == 1 else "s"} matched in period ({new_rate_label} monthly pace).',
        ),
        InsightDataSchema(
            id='exec-3',
            icon='trendDown' if churn_diff <= 0 else 'trendUp',
            title=f'Period churn rate is {churn_rate:.1f}%',
            description=f'{int(period_counts["lost_customers"])} lost out of {int(period_counts["retained_start"])} starting customers ({churn_label} vs. {MONTH_FULL_LABELS[baseline_mk]}).',
        ),
    ]

    return ExecutiveOverviewResponseSchema(
        mrr=mrr,
        arr=arr,
        totalCustomers=total_customers,
        churnRate=churn_rate,
        mrrChange=mrr_label,
        mrrTrend=mrr_trend,
        customersChange=cust_label,
        customersTrend=cust_trend,
        churnChange=churn_label,
        churnTrendDirection=churn_trend,
        mrrSparkline=[int(st['mrr']) for st in month_stats],
        arrSparkline=[int(st['arr']) for st in month_stats],
        customersSparkline=[int(st['active_customers']) for st in month_stats],
        churnSparkline=[float(st['churn_rate']) for st in month_stats],
        revenueSeries=revenue_series,
        planSlices=plan_slices,
        recentCustomers=recent_customers,
        insights=insights,
        comparisonLabel=window.comparison_label,
        limitationNote=window.limitation_note,
        startDate=window.start_date,
        endDate=window.end_date,
    )


def get_revenue_intelligence(
    date_range: DateRangeKey = 'Last 6 Months',
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> RevenueIntelligenceResponseSchema:
    window = resolve_date_window(date_range, start_date, end_date)
    months = window.months

    if not months:
        return RevenueIntelligenceResponseSchema(
            mrr=0,
            arr=0,
            revenueGrowth='0.0%',
            revenueGrowthChange='0.0 pp',
            revenueGrowthTrend='up',
            mrrChange='0.0%',
            mrrTrend='up',
            arpu=0.0,
            arpuChange='0.0%',
            arpuTrend='up',
            mrrSparkline=[],
            arrSparkline=[],
            growthSparkline=[],
            arpuSparkline=[],
            revenueSeries=[],
            planSlices=[],
            planPerformance=[],
            insights=[
                InsightDataSchema(
                    id='rev-empty',
                    icon='chart',
                    title='No revenue data in selected range',
                    description='Adjust the custom date range to fall within Jan 1 – Jun 18, 2024.',
                )
            ],
            comparisonLabel=window.comparison_label,
            limitationNote=window.limitation_note,
            startDate=window.start_date,
            endDate=window.end_date,
        )

    month_stats = [_month_stats(mk) for mk in months]
    latest_mk = months[-1]
    latest_stats = month_stats[-1]
    baseline_mk = window.previous_month or months[0]
    baseline_stats = _month_stats(baseline_mk)

    mrr = int(latest_stats['mrr'])
    arr = mrr * 12
    active_customers = int(latest_stats['active_customers'])
    arpu = round(mrr / active_customers, 2) if active_customers > 0 else 0.0

    baseline_mrr = int(baseline_stats['mrr'])
    baseline_customers = int(baseline_stats['active_customers'])
    baseline_arpu = baseline_mrr / baseline_customers if baseline_customers > 0 else 0.0

    mrr_label, mrr_trend, _ = _format_percent_delta(mrr, baseline_mrr)
    arpu_label, arpu_trend, _ = _format_percent_delta(arpu, baseline_arpu)

    growth_series: list[float] = []
    for idx, st in enumerate(month_stats):
        prev_st = month_stats[idx - 1] if idx > 0 else (
            _month_stats(window.previous_month) if window.previous_month else None
        )
        if not prev_st or int(prev_st['mrr']) <= 0:
            growth_series.append(0.0)
        else:
            growth_series.append(
                round(((int(st['mrr']) - int(prev_st['mrr'])) / int(prev_st['mrr'])) * 100.0, 1)
            )

    latest_growth_pct = growth_series[-1] if growth_series else 0.0
    prev_growth_pct = growth_series[-2] if len(growth_series) > 1 else 0.0
    growth_delta_label, growth_delta_trend, _ = _format_pp_delta(latest_growth_pct, prev_growth_pct)

    revenue_series = [
        TrendPointSchema(
            month=MONTH_SHORT_LABELS[mk],
            fullLabel=MONTH_FULL_LABELS[mk],
            mrr=int(st['mrr']),
            arr=int(st['arr']),
        )
        for mk, st in zip(months, month_stats)
    ]

    plan_baseline_mk = months[-2] if len(months) > 1 else (window.previous_month or latest_mk)

    plan_slices: list[PlanBreakdownSliceSchema] = []
    plan_performance: list[PlanPerformanceRowSchema] = []

    for plan in PLAN_ORDER:
        cur_p = _month_stats(latest_mk, plan)
        prev_p = _month_stats(plan_baseline_mk, plan)
        plan_mrr = int(cur_p['mrr'])
        plan_arr = plan_mrr * 12
        plan_customers = int(cur_p['active_customers'])
        pct = round((plan_mrr / max(mrr, 1)) * 100.0, 1)
        mom_label, _, _ = _format_percent_delta(plan_mrr, int(prev_p['mrr']))

        plan_slices.append(
            PlanBreakdownSliceSchema(
                plan=plan,
                amount=plan_mrr,
                percentage=pct,
                color=REV_PLAN_COLORS[plan],
            )
        )
        plan_performance.append(
            PlanPerformanceRowSchema(
                plan=plan,
                color=REV_PLAN_COLORS[plan],
                customers=plan_customers,
                mrr=plan_mrr,
                arr=plan_arr,
                momGrowth=mom_label,
                sharePercent=f'{pct:.1f}%',
            )
        )

    top_plan = max(plan_performance, key=lambda r: r.mrr)
    mrr_diff = mrr - baseline_mrr
    diff_prefix = '+$' if mrr_diff >= 0 else '-$'

    insights = [
        InsightDataSchema(
            id='rev-1',
            icon='trendUp' if mrr_trend == 'up' else 'trendDown',
            title=f'Revenue changed by {mrr_label}',
            description=f'MRR moved from ${baseline_mrr:,} to ${mrr:,} ({diff_prefix}{abs(mrr_diff):,}).',
        ),
        InsightDataSchema(
            id='rev-2',
            icon='layers',
            title=f'{top_plan.plan} plan contributes {top_plan.sharePercent} of total MRR',
            description=f'${top_plan.mrr:,} from {top_plan.customers:,} active customers.',
        ),
        InsightDataSchema(
            id='rev-3',
            icon='users',
            title=f'Average revenue per customer is ${arpu:.2f}',
            description=f'A change of {arpu_label} compared to {MONTH_FULL_LABELS[baseline_mk]}.',
        ),
    ]

    return RevenueIntelligenceResponseSchema(
        mrr=mrr,
        arr=arr,
        revenueGrowth=mrr_label,
        revenueGrowthChange=growth_delta_label,
        revenueGrowthTrend=growth_delta_trend,
        mrrChange=mrr_label,
        mrrTrend=mrr_trend,
        arpu=arpu,
        arpuChange=arpu_label,
        arpuTrend=arpu_trend,
        mrrSparkline=[int(st['mrr']) for st in month_stats],
        arrSparkline=[int(st['arr']) for st in month_stats],
        growthSparkline=growth_series,
        arpuSparkline=[
            round(int(st['mrr']) / max(int(st['active_customers']), 1), 2)
            for st in month_stats
        ],
        revenueSeries=revenue_series,
        planSlices=plan_slices,
        planPerformance=plan_performance,
        insights=insights,
        comparisonLabel=window.comparison_label,
        limitationNote=window.limitation_note,
        startDate=window.start_date,
        endDate=window.end_date,
    )


def get_customer_retention(
    date_range: DateRangeKey = 'Last 6 Months',
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> CustomerRetentionResponseSchema:
    window = resolve_date_window(date_range, start_date, end_date)
    months = window.months

    if not months:
        return CustomerRetentionResponseSchema(
            churnRate=0.0,
            retentionRate=0.0,
            lostCustomers=0,
            newCustomers=0,
            churnChange='0.0 pp',
            churnTrendDirection='up',
            retentionChange='0.0 pp',
            retentionTrendDirection='up',
            lostChange='0.0%',
            lostTrendDirection='up',
            newChange='0.0%',
            newTrendDirection='up',
            churnSparkline=[],
            retentionSparkline=[],
            lostSparkline=[],
            newSparkline=[],
            churnTrend=[],
            churnByPlan=[],
            recentlyChurned=[],
            insights=[
                InsightDataSchema(
                    id='ret-empty',
                    icon='chart',
                    title='No retention data in selected range',
                    description='Adjust the custom date range to fall within Jan 1 – Jun 18, 2024.',
                )
            ],
            comparisonLabel=window.comparison_label,
            limitationNote=window.limitation_note,
            startDate=window.start_date,
            endDate=window.end_date,
        )

    month_stats = [_month_stats(mk) for mk in months]
    baseline_mk = window.previous_month or months[0]
    baseline_stats = _month_stats(baseline_mk)

    period_counts = _period_customer_counts(window.effective_start, window.effective_end)
    churn_rate = float(period_counts['churn_rate'])
    retention_rate = float(period_counts['retention_rate'])
    lost_customers = int(period_counts['lost_customers'])
    new_customers = int(period_counts['new_customers'])

    baseline_churn = float(baseline_stats['churn_rate'])
    baseline_retention = float(baseline_stats['retention_rate'])
    churn_label, churn_trend, churn_diff = _format_pp_delta(churn_rate, baseline_churn)
    ret_label, ret_trend, ret_diff = _format_pp_delta(retention_rate, baseline_retention)

    lost_baseline = int(baseline_stats['lost_customers']) * max(len(months), 1)
    new_baseline = int(baseline_stats['new_customers']) * max(len(months), 1)
    lost_label, lost_trend, _ = _format_percent_delta(lost_customers, lost_baseline)
    new_label, new_trend, _ = _format_percent_delta(new_customers, new_baseline)

    churn_trend_pts = [
        ChurnTrendPointSchema(
            month=MONTH_SHORT_LABELS[mk],
            fullLabel=MONTH_FULL_LABELS[mk],
            churnRate=float(st['churn_rate']),
            retentionRate=float(st['retention_rate']),
        )
        for mk, st in zip(months, month_stats)
    ]

    latest_mk = months[-1]
    churn_by_plan: list[PlanChurnRowSchema] = []
    for plan in CHURN_PLAN_ORDER:
        plan_period = _period_customer_counts(window.effective_start, window.effective_end, plan)
        plan_latest = _month_stats(latest_mk, plan)
        churn_by_plan.append(
            PlanChurnRowSchema(
                plan=plan,
                color=CHURN_PLAN_COLORS[plan],
                churnRate=float(plan_period['churn_rate']),
                customers=int(plan_latest['active_customers']),
            )
        )

    churned_records = [
        r
        for r in CUSTOMER_RECORDS
        if r.canceled_date is not None
        and window.effective_start <= r.canceled_date <= window.effective_end
    ]
    churned_records.sort(key=lambda r: r.canceled_date or '', reverse=True)
    recently_churned = [
        ChurnedCustomerRowSchema(
            id=r.customer.id,
            name=r.customer.name,
            initials=r.customer.initials,
            plan=r.customer.plan,
            mrr=r.customer.mrr,
            activeFor=_active_duration_label(r.customer.signupDate, r.canceled_date or ''),
            churnedOn=_format_display_date(r.canceled_date or ''),
            churnedDate=r.canceled_date or '',
            reason=r.churn_reason or 'Other',
        )
        for r in churned_records
    ]

    highest_churn = max(churn_by_plan, key=lambda row: row.churnRate)
    diff_pp = abs(highest_churn.churnRate - churn_rate)
    comp_word = 'higher' if highest_churn.churnRate >= churn_rate else 'lower'

    insights = [
        InsightDataSchema(
            id='ret-1',
            icon='trendDown' if churn_diff <= 0 else 'trendUp',
            title=f'Period churn rate is {churn_rate:.1f}%',
            description=f'{lost_customers} churned out of {int(period_counts["retained_start"])} starting accounts ({churn_label} vs. {MONTH_FULL_LABELS[baseline_mk]}).',
        ),
        InsightDataSchema(
            id='ret-2',
            icon='layers',
            title=f'{highest_churn.plan} plan has the highest churn ({highest_churn.churnRate:.1f}%)',
            description=f'{diff_pp:.1f} pp {comp_word} than your overall period churn ({churn_rate:.1f}%).',
        ),
        InsightDataSchema(
            id='ret-3',
            icon='trendUp' if ret_diff >= 0 else 'trendDown',
            title=f'Retention rate is {retention_rate:.1f}%',
            description=f'100 − {churn_rate:.1f}% churn ({ret_label} vs. {MONTH_FULL_LABELS[baseline_mk]}).',
        ),
    ]

    return CustomerRetentionResponseSchema(
        churnRate=churn_rate,
        retentionRate=retention_rate,
        lostCustomers=lost_customers,
        newCustomers=new_customers,
        churnChange=churn_label,
        churnTrendDirection=churn_trend,
        retentionChange=ret_label,
        retentionTrendDirection=ret_trend,
        lostChange=lost_label,
        lostTrendDirection=lost_trend,
        newChange=new_label,
        newTrendDirection=new_trend,
        churnSparkline=[pt.churnRate for pt in churn_trend_pts],
        retentionSparkline=[pt.retentionRate for pt in churn_trend_pts],
        lostSparkline=[int(st['lost_customers']) for st in month_stats],
        newSparkline=[int(st['new_customers']) for st in month_stats],
        churnTrend=churn_trend_pts,
        churnByPlan=churn_by_plan,
        recentlyChurned=recently_churned,
        insights=insights,
        comparisonLabel=window.comparison_label,
        limitationNote=window.limitation_note,
        startDate=window.start_date,
        endDate=window.end_date,
    )


def get_customer_growth(
    date_range: DateRangeKey = 'Last 6 Months',
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> CustomerGrowthResponseSchema:
    window = resolve_date_window(date_range, start_date, end_date)
    months = window.months

    if not months:
        return CustomerGrowthResponseSchema(
            newCustomers=0,
            activeCustomers=0,
            lostCustomers=0,
            netGrowth=0,
            totalCustomers=0,
            newChange='0.0%',
            newTrendDirection='up',
            activeChange='0.0%',
            activeTrendDirection='up',
            lostChange='0.0%',
            lostTrendDirection='up',
            netChange='0.0%',
            netTrendDirection='up',
            newSparkline=[],
            activeSparkline=[],
            lostSparkline=[],
            netSparkline=[],
            growthTrend=[],
            distributionSlices=[],
            planGrowth=[],
            insights=[
                InsightDataSchema(
                    id='gro-empty',
                    icon='chart',
                    title='No growth data in selected range',
                    description='Adjust the custom date range to fall within Jan 1 – Jun 18, 2024.',
                )
            ],
            comparisonLabel=window.comparison_label,
            limitationNote=window.limitation_note,
            startDate=window.start_date,
            endDate=window.end_date,
        )

    month_stats = [_month_stats(mk) for mk in months]
    latest_stats = month_stats[-1]
    baseline_mk = window.previous_month or months[0]
    baseline_stats = _month_stats(baseline_mk)

    period_counts = _period_customer_counts(window.effective_start, window.effective_end)
    new_customers = int(period_counts['new_customers'])
    lost_customers = int(period_counts['lost_customers'])
    active_customers = int(latest_stats['active_customers'])
    retained_end = int(period_counts['retained_end'])
    past_due_customers = max(0, retained_end - active_customers)
    net_growth = new_customers - lost_customers
    total_customers = retained_end + lost_customers

    new_baseline = int(baseline_stats['new_customers']) * max(len(months), 1)
    lost_baseline = int(baseline_stats['lost_customers']) * max(len(months), 1)
    active_baseline = int(baseline_stats['active_customers'])
    net_baseline = (
        int(baseline_stats['new_customers']) - int(baseline_stats['lost_customers'])
    ) * max(len(months), 1)

    new_label, new_trend, _ = _format_percent_delta(new_customers, new_baseline)
    active_label, active_trend, _ = _format_percent_delta(active_customers, active_baseline)
    lost_label, lost_trend, _ = _format_percent_delta(lost_customers, lost_baseline)
    net_label, net_trend, _ = _format_percent_delta(net_growth, net_baseline)

    growth_trend = [
        GrowthTrendPointSchema(
            month=MONTH_SHORT_LABELS[mk],
            fullLabel=MONTH_FULL_LABELS[mk],
            newCustomers=int(st['new_customers']),
            lostCustomers=int(st['lost_customers']),
            netGrowth=int(st['new_customers']) - int(st['lost_customers']),
        )
        for mk, st in zip(months, month_stats)
    ]

    distribution_slices: list[PlanBreakdownSliceSchema] = []
    if total_customers > 0:
        distribution_slices = [
            PlanBreakdownSliceSchema(
                plan='Active',
                amount=active_customers,
                percentage=round((active_customers / total_customers) * 100.0, 1),
                color='#6D5CE8',
                countLabel=f'{active_customers:,}',
            ),
            PlanBreakdownSliceSchema(
                plan='Churned (Lost)',
                amount=lost_customers,
                percentage=round((lost_customers / total_customers) * 100.0, 1),
                color='#B8B1F5',
                countLabel=f'{lost_customers:,}',
            ),
            PlanBreakdownSliceSchema(
                plan='Past Due',
                amount=past_due_customers,
                percentage=round((past_due_customers / total_customers) * 100.0, 1),
                color='#E5E7EB',
                countLabel=f'{past_due_customers:,}',
            ),
        ]

    plan_growth: list[PlanGrowthRowSchema] = []
    for plan in PLAN_ORDER:
        p_counts = _period_customer_counts(window.effective_start, window.effective_end, plan)
        p_start = int(p_counts['retained_start'])
        p_new = int(p_counts['new_customers'])
        p_lost = int(p_counts['lost_customers'])
        p_end = int(p_counts['retained_end'])
        p_net = p_new - p_lost
        pct = round((p_net / p_start) * 100.0, 1) if p_start > 0 else 0.0
        sign = '+' if p_net >= 0 else ''
        plan_growth.append(
            PlanGrowthRowSchema(
                plan=plan,
                color=GROWTH_PLAN_COLORS[plan],
                startCustomers=p_start,
                newCustomers=p_new,
                lostCustomers=p_lost,
                endCustomers=p_end,
                netGrowth=p_net,
                growthPercent=f'{sign}{pct:.1f}%',
            )
        )

    fastest_plan = max(
        plan_growth,
        key=lambda row: float(row.growthPercent.replace('%', '')),
    )
    total_start_base = sum(row.startCustomers for row in plan_growth)
    base_growth_label, _, _ = _format_percent_delta(retained_end, total_start_base)

    insights = [
        InsightDataSchema(
            id='gro-1',
            icon='trendUp',
            title=f'Customer base changed by {base_growth_label}',
            description=f'From {total_start_base:,} to {retained_end:,} retained customers ({"+" if net_growth >= 0 else ""}{net_growth} net).',
        ),
        InsightDataSchema(
            id='gro-2',
            icon='users',
            title=f'{new_customers:,} new customers acquired',
            description=f'{new_label} compared to {MONTH_FULL_LABELS[baseline_mk]} monthly pace.',
        ),
        InsightDataSchema(
            id='gro-3',
            icon='chart',
            title=f'{fastest_plan.plan} plan grew the fastest',
            description=f'{fastest_plan.growthPercent} growth with {"+" if fastest_plan.netGrowth >= 0 else ""}{fastest_plan.netGrowth} net customers.',
        ),
    ]

    return CustomerGrowthResponseSchema(
        newCustomers=new_customers,
        activeCustomers=active_customers,
        lostCustomers=lost_customers,
        netGrowth=net_growth,
        totalCustomers=total_customers,
        newChange=new_label,
        newTrendDirection=new_trend,
        activeChange=active_label,
        activeTrendDirection=active_trend,
        lostChange=lost_label,
        lostTrendDirection=lost_trend,
        netChange=net_label,
        netTrendDirection=net_trend,
        newSparkline=[int(st['new_customers']) for st in month_stats],
        activeSparkline=[int(st['active_customers']) for st in month_stats],
        lostSparkline=[int(st['lost_customers']) for st in month_stats],
        netSparkline=[pt.netGrowth for pt in growth_trend],
        growthTrend=growth_trend,
        distributionSlices=distribution_slices,
        planGrowth=plan_growth,
        insights=insights,
        comparisonLabel=window.comparison_label,
        limitationNote=window.limitation_note,
        startDate=window.start_date,
        endDate=window.end_date,
    )


def get_customer_summary(
    date_range: DateRangeKey = 'Last 6 Months',
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> CustomerSummaryResponseSchema:
    window = resolve_date_window(date_range, start_date, end_date)
    months = window.months

    if not months:
        return CustomerSummaryResponseSchema(
            totalCustomers=0,
            newCustomers=0,
            lostCustomers=0,
            avgSubscriptionValue=0.0,
            totalChange='0.0%',
            totalTrend='up',
            newChange='0.0%',
            newTrend='up',
            lostChange='0.0%',
            lostTrend='up',
            avgValueChange='0.0%',
            avgValueTrend='up',
            totalSparkline=[],
            newSparkline=[],
            lostSparkline=[],
            avgValueSparkline=[],
            comparisonLabel=window.comparison_label,
            limitationNote=window.limitation_note,
            startDate=window.start_date,
            endDate=window.end_date,
        )

    month_stats = [_month_stats(mk) for mk in months]
    latest_stats = month_stats[-1]
    baseline_mk = window.previous_month or months[0]
    baseline_stats = _month_stats(baseline_mk)

    period_counts = _period_customer_counts(window.effective_start, window.effective_end)
    active_customers = int(latest_stats['active_customers'])
    lost_customers = int(period_counts['lost_customers'])
    new_customers = int(period_counts['new_customers'])
    total_customers = int(period_counts['retained_end']) + lost_customers
    mrr = int(latest_stats['mrr'])
    avg_sub_val = round(mrr / active_customers, 2) if active_customers > 0 else 0.0

    baseline_total = int(baseline_stats['retained_end']) + int(baseline_stats['lost_customers'])
    baseline_lost = int(baseline_stats['lost_customers']) * max(len(months), 1)
    baseline_new = int(baseline_stats['new_customers']) * max(len(months), 1)
    baseline_avg = (
        int(baseline_stats['mrr']) / int(baseline_stats['active_customers'])
        if int(baseline_stats['active_customers']) > 0
        else 0.0
    )

    total_label, total_trend, _ = _format_percent_delta(total_customers, baseline_total)
    new_label, new_trend, _ = _format_percent_delta(new_customers, baseline_new)
    lost_label, lost_trend, _ = _format_percent_delta(lost_customers, baseline_lost)
    avg_label, avg_trend, _ = _format_percent_delta(avg_sub_val, baseline_avg)

    return CustomerSummaryResponseSchema(
        totalCustomers=total_customers,
        newCustomers=new_customers,
        lostCustomers=lost_customers,
        avgSubscriptionValue=avg_sub_val,
        totalChange=total_label,
        totalTrend=total_trend,
        newChange=new_label,
        newTrend=new_trend,
        lostChange=lost_label,
        lostTrend=lost_trend,
        avgValueChange=avg_label,
        avgValueTrend=avg_trend,
        totalSparkline=[
            int(st['retained_end']) + int(st['lost_customers']) for st in month_stats
        ],
        newSparkline=[int(st['new_customers']) for st in month_stats],
        lostSparkline=[int(st['lost_customers']) for st in month_stats],
        avgValueSparkline=[
            round(int(st['mrr']) / max(int(st['active_customers']), 1), 2)
            for st in month_stats
        ],
        comparisonLabel=window.comparison_label,
        limitationNote=window.limitation_note,
        startDate=window.start_date,
        endDate=window.end_date,
    )


def list_customers(
    *,
    search: str = '',
    plan: Optional[Literal['All', 'Starter', 'Pro', 'Business', 'Enterprise']] = 'All',
    status: Optional[Literal['All', 'Active', 'Past Due', 'Canceled']] = 'All',
    sort_by: SortField = 'signupDate',
    sort_dir: SortDirection = 'desc',
    page: int = 1,
    page_size: int = 7,
    date_range: Optional[DateRangeKey] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> CustomerListResponseSchema:
    records = list(CUSTOMER_RECORDS)

    if date_range is not None:
        window = resolve_date_window(date_range, start_date, end_date)
        if not window.months:
            records = []
        else:
            records = [
                r
                for r in records
                if r.customer.signupDate <= window.effective_end
                and (r.canceled_date is None or r.canceled_date >= window.effective_start)
            ]

    q = search.strip().lower()
    if q:
        records = [
            r
            for r in records
            if q in r.customer.name.lower() or q in r.customer.email.lower()
        ]

    if plan and plan != 'All':
        records = [r for r in records if r.customer.plan == plan]

    if status and status != 'All':
        records = [r for r in records if r.customer.status == status]

    reverse = sort_dir == 'desc'
    if sort_by == 'mrr':
        records.sort(key=lambda r: r.customer.name.lower())
        records.sort(key=lambda r: r.customer.mrr, reverse=reverse)
    else:
        records.sort(key=lambda r: r.customer.name.lower())
        records.sort(key=lambda r: r.customer.signupDate, reverse=reverse)

    total = len(records)
    total_pages = max(1, math.ceil(total / page_size))
    safe_page = min(max(1, page), total_pages)
    start_idx = (safe_page - 1) * page_size
    page_items = [r.customer for r in records[start_idx : start_idx + page_size]]

    return CustomerListResponseSchema(
        items=page_items,
        total=total,
        page=safe_page,
        pageSize=page_size,
        totalPages=total_pages,
    )


def get_customer_by_id(customer_id: str) -> CustomerSchema:
    for record in CUSTOMER_RECORDS:
        if record.customer.id == customer_id:
            return record.customer
    raise HTTPException(
        status_code=404,
        detail=f'Customer "{customer_id}" not found.',
    )
