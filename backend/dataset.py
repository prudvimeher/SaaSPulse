from dataclasses import dataclass
from typing import Optional
from .schemas import (
    AccountStatus,
    BillingCycle,
    ChurnReason,
    CustomerActivityItemSchema,
    CustomerSchema,
    RevenueHistoryPointSchema,
    SubscriptionPlan,
)

MONTH_KEYS: tuple[str, ...] = (
    '2024-01',
    '2024-02',
    '2024-03',
    '2024-04',
    '2024-05',
    '2024-06',
)

MONTH_SHORT_LABELS: dict[str, str] = {
    '2024-01': 'Jan',
    '2024-02': 'Feb',
    '2024-03': 'Mar',
    '2024-04': 'Apr',
    '2024-05': 'May',
    '2024-06': 'Jun',
}

MONTH_FULL_LABELS: dict[str, str] = {
    '2024-01': 'Jan 2024',
    '2024-02': 'Feb 2024',
    '2024-03': 'Mar 2024',
    '2024-04': 'Apr 2024',
    '2024-05': 'May 2024',
    '2024-06': 'Jun 2024',
}

MONTH_END_DATES: dict[str, str] = {
    '2024-01': '2024-01-31',
    '2024-02': '2024-02-29',
    '2024-03': '2024-03-31',
    '2024-04': '2024-04-30',
    '2024-05': '2024-05-31',
    '2024-06': '2024-06-18',
}

DATASET_MIN_DATE = '2024-01-01'
DATASET_MAX_DATE = '2024-06-18'


@dataclass(frozen=True)
class CustomerRecord:
    customer: CustomerSchema
    canceled_date: Optional[str] = None
    churn_reason: Optional[ChurnReason] = None
    past_due_date: Optional[str] = None
    monthly_mrr: tuple[int, int, int, int, int, int] = (0, 0, 0, 0, 0, 0)

    def active_mrr_for_month(self, month_key: str) -> int:
        idx = MONTH_KEYS.index(month_key)
        month_end = MONTH_END_DATES[month_key]
        if self.customer.signupDate > month_end:
            return 0
        if self.canceled_date is not None and self.canceled_date <= month_end:
            return 0
        if self.past_due_date is not None and self.past_due_date <= month_end:
            return 0
        return self.monthly_mrr[idx]

    def is_active_on(self, iso_date: str) -> bool:
        if self.customer.signupDate > iso_date:
            return False
        if self.canceled_date is not None and self.canceled_date <= iso_date:
            return False
        if self.past_due_date is not None and self.past_due_date <= iso_date:
            return False
        return True

    def is_retained_on(self, iso_date: str) -> bool:
        if self.customer.signupDate > iso_date:
            return False
        if self.canceled_date is not None and self.canceled_date <= iso_date:
            return False
        return True


def _format_short_date(iso_date: str) -> str:
    year_s, month_s, day_s = iso_date.split('-')
    months = (
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    )
    return f'{months[int(month_s) - 1]} {int(day_s):02d}, {year_s}'


def _make_initials(name: str) -> str:
    parts = [p for p in name.replace('-', ' ').split() if p]
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return name[:2].upper()


def _build_record(
    cid: str,
    name: str,
    email: str,
    plan: SubscriptionPlan,
    mrr: int,
    status: AccountStatus,
    signup_date: str,
    billing_cycle: BillingCycle,
    seats: int,
    payment_method: str,
    notes: str,
    *,
    initials: Optional[str] = None,
    canceled_date: Optional[str] = None,
    churn_reason: Optional[ChurnReason] = None,
    past_due_date: Optional[str] = None,
    next_billing_date: Optional[str] = None,
    total_revenue: Optional[int] = None,
    monthly_mrr: Optional[tuple[int, int, int, int, int, int]] = None,
    activities: Optional[list[CustomerActivityItemSchema]] = None,
) -> CustomerRecord:
    computed_initials = initials or _make_initials(name)
    signup_month = signup_date[:7]

    if monthly_mrr is None:
        vals: list[int] = []
        for idx, mk in enumerate(MONTH_KEYS):
            month_end = MONTH_END_DATES[mk]
            if signup_date > month_end:
                vals.append(0)
            elif canceled_date is not None and canceled_date <= month_end:
                vals.append(0)
            elif idx <= 1 and mrr >= 199 and signup_month < '2024-03':
                vals.append(max(49, mrr - 50))
            elif idx == 2 and mrr >= 249 and signup_month < '2024-04':
                vals.append(max(49, mrr - 25))
            else:
                vals.append(mrr)
        monthly_mrr_tuple = (vals[0], vals[1], vals[2], vals[3], vals[4], vals[5])
    else:
        monthly_mrr_tuple = monthly_mrr

    # Build display mrrHistory for the detail panel chart
    history_points = [
        RevenueHistoryPointSchema(
            month=MONTH_SHORT_LABELS[mk],
            label=MONTH_FULL_LABELS[mk],
            value=monthly_mrr_tuple[idx],
        )
        for idx, mk in enumerate(MONTH_KEYS)
    ]

    if total_revenue is None:
        active_sum = sum(monthly_mrr_tuple)
        if signup_date < '2024-01-01':
            # Include pre-2024 months approximation
            year_s, month_s, _ = signup_date.split('-')
            pre_months = (2023 - int(year_s)) * 12 + (13 - int(month_s))
            total_rev = active_sum + pre_months * max(49, mrr - 50)
        else:
            total_rev = max(mrr, active_sum)
    else:
        total_rev = total_revenue

    if next_billing_date is None and status != 'Canceled':
        if billing_cycle == 'Annual':
            y_s, m_s, d_s = signup_date.split('-')
            next_billing_date = f'{int(y_s) + 1}-{m_s}-{d_s}'
        else:
            day_num = min(28, int(signup_date.split('-')[2]))
            next_billing_date = f'2024-07-{day_num:02d}' if day_num <= 18 else f'2024-06-{day_num:02d}'

    if activities is None:
        if status == 'Canceled' and canceled_date:
            activities = [
                CustomerActivityItemSchema(
                    id=f'{cid}-act-1',
                    title=f'Subscription canceled ({churn_reason or "Other"})',
                    timestamp=_format_short_date(canceled_date),
                ),
                CustomerActivityItemSchema(
                    id=f'{cid}-act-2',
                    title=f'Account created on {plan} plan',
                    timestamp=_format_short_date(signup_date),
                ),
            ]
        elif status == 'Past Due' and past_due_date:
            activities = [
                CustomerActivityItemSchema(
                    id=f'{cid}-act-1',
                    title=f'Payment retry scheduled (${mrr})',
                    timestamp=_format_short_date(past_due_date),
                ),
                CustomerActivityItemSchema(
                    id=f'{cid}-act-2',
                    title=f'Onboarded onto {plan} tier',
                    timestamp=_format_short_date(signup_date),
                ),
            ]
        else:
            activities = [
                CustomerActivityItemSchema(
                    id=f'{cid}-act-1',
                    title=(
                        f'Annual renewal confirmed (${mrr * 12:,})'
                        if billing_cycle == 'Annual'
                        else f'Monthly invoice paid (${mrr:,})'
                    ),
                    timestamp=_format_short_date(
                        signup_date if signup_date >= '2024-05-19' else f'2024-06-{min(18, int(signup_date.split("-")[2])):02d}'
                    ),
                ),
                CustomerActivityItemSchema(
                    id=f'{cid}-act-2',
                    title=f'Provisioned {seats} seats on {plan} plan',
                    timestamp=_format_short_date(signup_date),
                ),
            ]

    customer = CustomerSchema(
        id=cid,
        name=name,
        email=email,
        initials=computed_initials,
        plan=plan,
        mrr=mrr,
        status=status,
        signupDate=signup_date,
        billingCycle=billing_cycle,
        totalRevenue=total_rev,
        seats=seats,
        nextBillingDate=next_billing_date if status != 'Canceled' else None,
        paymentMethod=payment_method,
        mrrHistory=history_points,
        recentActivity=activities,
        notes=notes,
    )

    return CustomerRecord(
        customer=customer,
        canceled_date=canceled_date,
        churn_reason=churn_reason,
        past_due_date=past_due_date,
        monthly_mrr=monthly_mrr_tuple,
    )


def _seed_dataset() -> list[CustomerRecord]:
    records: list[CustomerRecord] = [
        # --- June 2024 Signups ---
        _build_record(
            'cust-001', 'Acme Tech', 'billing@acme.tech', 'Pro', 249, 'Active',
            '2024-06-18', 'Monthly', 12, 'Visa ending in 4242',
            'Key mid-market engineering customer. Evaluating Business tier for Q3 SSO rollout.',
            initials='AT', total_revenue=249, next_billing_date='2024-07-18',
            monthly_mrr=(0, 0, 0, 0, 0, 249),
            activities=[
                CustomerActivityItemSchema(id='act-1', title='Monthly invoice #1042 paid ($249)', timestamp='Jun 18, 2024'),
                CustomerActivityItemSchema(id='act-2', title='Provisioned 12 team seats on Pro plan', timestamp='Jun 18, 2024'),
            ],
        ),
        _build_record(
            'cust-002', 'Nova Systems', 'hello@novasystems.io', 'Business', 499, 'Active',
            '2024-06-16', 'Annual', 28, 'Mastercard ending in 8819',
            'Annual Business contract with strong seat utilization across product & finance teams.',
            initials='NS', total_revenue=5988, next_billing_date='2025-06-16',
            monthly_mrr=(0, 0, 0, 0, 0, 499),
            activities=[
                CustomerActivityItemSchema(id='act-3', title='Annual contract confirmed ($5,988)', timestamp='Jun 16, 2024'),
                CustomerActivityItemSchema(id='act-4', title='Enabled SAML SSO integration', timestamp='Jun 17, 2024'),
            ],
        ),
        _build_record(
            'cust-003', 'CloudLift', 'team@cloudlift.co', 'Pro', 249, 'Active',
            '2024-06-14', 'Monthly', 10, 'Amex ending in 1004',
            'Consistent weekly active leadership usage. High NPS respondent.',
            initials='CL', total_revenue=249, next_billing_date='2024-07-14',
            monthly_mrr=(0, 0, 0, 0, 0, 249),
        ),
        _build_record(
            'cust-004', 'Pioneer Dev', 'contact@pioneer.dev', 'Starter', 99, 'Active',
            '2024-06-12', 'Monthly', 4, 'Visa ending in 7310',
            'Seed-stage developer tools startup growing seat count steadily.',
            initials='PD', total_revenue=99, next_billing_date='2024-07-12',
            monthly_mrr=(0, 0, 0, 0, 0, 99),
        ),
        _build_record(
            'cust-005', 'BrightLayer', 'hi@brightlayer.com', 'Pro', 199, 'Active',
            '2024-06-10', 'Monthly', 8, 'Visa ending in 5501',
            'Design-led SaaS team tracking cohort retention and expansion MRR.',
            initials='BL', total_revenue=199, next_billing_date='2024-07-10',
            monthly_mrr=(0, 0, 0, 0, 0, 199),
        ),
        _build_record(
            'cust-006', 'DevX Systems', 'support@devx.com', 'Business', 499, 'Past Due',
            '2024-06-08', 'Monthly', 24, 'Visa ending in 1903 (Expired)',
            'Card expired on June renewal; account owner notified for updated corporate card.',
            initials='DX', total_revenue=499, next_billing_date='2024-06-22',
            past_due_date='2024-06-09', monthly_mrr=(0, 0, 0, 0, 0, 499),
            activities=[
                CustomerActivityItemSchema(id='act-12', title='Payment retry scheduled (card expired)', timestamp='Jun 09, 2024'),
                CustomerActivityItemSchema(id='act-13', title='Dunning notice sent to finance contact', timestamp='Jun 08, 2024'),
            ],
        ),
        _build_record(
            'cust-029', 'Quantum Ledger', 'finance@quantumledger.io', 'Enterprise', 1499, 'Active',
            '2024-06-04', 'Annual', 65, 'Wire / ACH Direct Debit',
            'Multi-entity financial SaaS deployed on Enterprise SLA with dedicated CSM.',
            initials='QL', total_revenue=17988, next_billing_date='2025-06-04',
            monthly_mrr=(0, 0, 0, 0, 0, 1499),
        ),

        # --- May 2024 Signups ---
        _build_record(
            'cust-007', 'TechMove', 'hello@techmove.io', 'Starter', 49, 'Canceled',
            '2024-05-28', 'Monthly', 2, 'Mastercard ending in 3398',
            'Paused subscription during internal restructuring; candidate for Q4 win-back.',
            initials='TM', total_revenue=49, canceled_date='2024-06-12', churn_reason='Other',
            monthly_mrr=(0, 0, 0, 0, 49, 0),
        ),
        _build_record(
            'cust-008', 'Veloce Cloud', 'finance@velocecloud.com', 'Business', 649, 'Active',
            '2024-05-24', 'Annual', 35, 'ACH Direct Debit',
            'High-growth infrastructure customer with multi-region reporting enabled.',
            initials='VC', total_revenue=7788, next_billing_date='2025-05-24',
            monthly_mrr=(0, 0, 0, 0, 599, 649),
        ),
        _build_record(
            'cust-009', 'Kinetix AI', 'ops@kinetix.ai', 'Pro', 299, 'Active',
            '2024-05-19', 'Monthly', 15, 'Amex ending in 9120',
            'Fast-growing AI workflow startup; upgraded seat pack in June.',
            initials='KA', total_revenue=548, next_billing_date='2024-07-19',
            monthly_mrr=(0, 0, 0, 0, 249, 299),
        ),
        _build_record(
            'cust-010', 'Harbor Metrics', 'accounts@harbormetrics.co', 'Starter', 79, 'Active',
            '2024-05-15', 'Monthly', 3, 'Visa ending in 6621',
            'Analytics consultancy monitoring client SaaS benchmarks.',
            initials='HM', total_revenue=158, next_billing_date='2024-07-15',
            monthly_mrr=(0, 0, 0, 0, 79, 79),
        ),
        _build_record(
            'cust-011', 'SignalForge', 'billing@signalforge.dev', 'Business', 549, 'Active',
            '2024-05-11', 'Annual', 30, 'Visa ending in 3045',
            'Observability vendor on annual Business commitment.',
            initials='SF', total_revenue=6588, next_billing_date='2025-05-11',
            monthly_mrr=(0, 0, 0, 0, 549, 549),
        ),
        _build_record(
            'cust-012', 'LumenStack', 'team@lumenstack.io', 'Pro', 199, 'Past Due',
            '2024-05-06', 'Monthly', 9, 'Mastercard ending in 7742',
            'Second retry scheduled; CSM reached out to billing admin.',
            initials='LS', total_revenue=199, next_billing_date='2024-06-21',
            past_due_date='2024-06-06', monthly_mrr=(0, 0, 0, 0, 199, 199),
        ),

        # --- April 2024 Signups ---
        _build_record(
            'cust-013', 'OrbitPay', 'finance@orbitpay.com', 'Business', 799, 'Active',
            '2024-04-29', 'Annual', 42, 'ACH Direct Debit',
            'Largest fintech account in Business tier; zero churn risk.',
            initials='OP', total_revenue=9588, next_billing_date='2025-04-29',
            monthly_mrr=(0, 0, 0, 749, 799, 799),
        ),
        _build_record(
            'cust-014', 'CedarWorks', 'hello@cedarworks.co', 'Starter', 49, 'Active',
            '2024-04-22', 'Monthly', 2, 'Visa ending in 2184',
            'Small boutique agency using Starter workspace for monthly KPI reviews.',
            initials='CW', total_revenue=147, next_billing_date='2024-07-22',
            monthly_mrr=(0, 0, 0, 49, 49, 49),
        ),
        _build_record(
            'cust-015', 'PulseGrid', 'admin@pulsegrid.net', 'Pro', 249, 'Active',
            '2024-04-17', 'Monthly', 11, 'Amex ending in 4412',
            'Energy analytics SaaS monitoring recurring fleet contracts.',
            initials='PG', total_revenue=747, next_billing_date='2024-07-17',
            monthly_mrr=(0, 0, 0, 249, 249, 249),
        ),
        _build_record(
            'cust-016', 'StrataFlow', 'billing@strataflow.io', 'Starter', 99, 'Canceled',
            '2024-04-10', 'Monthly', 4, 'Visa ending in 8841',
            'Acquired by larger enterprise parent; consolidated onto parent billing.',
            initials='ST', total_revenue=99, canceled_date='2024-05-10', churn_reason='Other',
            monthly_mrr=(0, 0, 0, 99, 0, 0),
        ),
        _build_record(
            'cust-017', 'VectorLabs', 'finance@vectorlabs.ai', 'Business', 499, 'Active',
            '2024-04-03', 'Monthly', 22, 'Mastercard ending in 5190',
            'ML tooling startup tracking cohort retention weekly.',
            initials='VL', total_revenue=1497, next_billing_date='2024-07-03',
            monthly_mrr=(0, 0, 0, 499, 499, 499),
        ),
        _build_record(
            'cust-030', 'Titan Grid', 'procurement@titangrid.com', 'Enterprise', 1999, 'Active',
            '2024-04-01', 'Annual', 85, 'ACH Direct Debit',
            'Enterprise logistics platform using custom BI exports and dedicated support.',
            initials='TG', total_revenue=23988, next_billing_date='2025-04-01',
            monthly_mrr=(0, 0, 0, 1799, 1999, 1999),
        ),

        # --- March 2024 Signups ---
        _build_record(
            'cust-018', 'Northstar Ops', 'ops@northstarops.com', 'Pro', 199, 'Active',
            '2024-03-26', 'Monthly', 7, 'Visa ending in 9912',
            'Logistics operations platform with steady Pro tier usage.',
            initials='NO', total_revenue=796, next_billing_date='2024-06-26',
            monthly_mrr=(0, 0, 199, 199, 199, 199),
        ),
        _build_record(
            'cust-019', 'MintLedger', 'team@mintledger.co', 'Starter', 99, 'Active',
            '2024-03-19', 'Monthly', 5, 'Visa ending in 1157',
            'Bookkeeping SaaS evaluating upgrade to Pro for custom cohort exports.',
            initials='ML', total_revenue=396, next_billing_date='2024-07-19',
            monthly_mrr=(0, 0, 99, 99, 99, 99),
        ),
        _build_record(
            'cust-020', 'Apex Telemetry', 'billing@apextelemetry.io', 'Business', 599, 'Active',
            '2024-03-11', 'Annual', 32, 'ACH Direct Debit',
            'Global telemetry SaaS with quarterly executive business reviews.',
            initials='AX', total_revenue=7188, next_billing_date='2025-03-11',
            monthly_mrr=(0, 0, 549, 599, 599, 599),
        ),
        _build_record(
            'cust-021', 'RelayDesk', 'support@relaydesk.com', 'Pro', 249, 'Past Due',
            '2024-03-04', 'Monthly', 10, 'Amex ending in 6008',
            'Billing contact requested PO update before card re-charge.',
            initials='RD', total_revenue=747, next_billing_date='2024-06-24',
            past_due_date='2024-06-04', monthly_mrr=(0, 0, 249, 249, 249, 249),
        ),

        # --- February 2024 Signups ---
        _build_record(
            'cust-022', 'Cobalt Cloud', 'hello@cobaltcloud.dev', 'Starter', 49, 'Active',
            '2024-02-24', 'Monthly', 2, 'Visa ending in 3829',
            'Indie SaaS studio running two micro-products.',
            initials='CC', total_revenue=245, next_billing_date='2024-06-24',
            monthly_mrr=(0, 49, 49, 49, 49, 49),
        ),
        _build_record(
            'cust-023', 'Beacon Health', 'it@beaconhealth.org', 'Business', 699, 'Active',
            '2024-02-15', 'Annual', 38, 'ACH Direct Debit',
            'Healthcare scheduling SaaS on annual Business agreement.',
            initials='BH', total_revenue=8388, next_billing_date='2025-02-15',
            monthly_mrr=(0, 599, 649, 649, 699, 699),
        ),
        _build_record(
            'cust-024', 'Quarry Data', 'accounts@quarrydata.io', 'Pro', 299, 'Canceled',
            '2024-02-08', 'Monthly', 12, 'Mastercard ending in 2077',
            'Churned after building internal warehouse reporting.',
            initials='QD', total_revenue=598, canceled_date='2024-04-08', churn_reason='Missing features',
            monthly_mrr=(0, 299, 299, 0, 0, 0),
        ),
        _build_record(
            'cust-031', 'Aether Security', 'secops@aethersecurity.io', 'Enterprise', 1499, 'Active',
            '2024-02-02', 'Annual', 54, 'Wire / ACH Direct Debit',
            'Cybersecurity vendor using SOC2 compliance audit reporting.',
            initials='AS', total_revenue=17988, next_billing_date='2025-02-02',
            monthly_mrr=(0, 1299, 1299, 1499, 1499, 1499),
        ),

        # --- January 2024 Signups ---
        _build_record(
            'cust-025', 'DriftLine', 'team@driftline.app', 'Starter', 79, 'Active',
            '2024-01-29', 'Monthly', 3, 'Visa ending in 4890',
            'Product analytics workspace for mobile subscription apps.',
            initials='DL', total_revenue=414, next_billing_date='2024-06-29',
            monthly_mrr=(49, 49, 79, 79, 79, 79),
        ),
        _build_record(
            'cust-026', 'Meridian Pay', 'billing@meridianpay.com', 'Business', 549, 'Active',
            '2024-01-21', 'Annual', 26, 'ACH Direct Debit',
            'B2B payments infrastructure customer with strong annual retention.',
            initials='MP', total_revenue=6588, next_billing_date='2025-01-21',
            monthly_mrr=(449, 499, 499, 549, 549, 549),
        ),
        _build_record(
            'cust-027', 'Kestrel Docs', 'founders@kestreldocs.com', 'Pro', 199, 'Active',
            '2024-01-14', 'Monthly', 8, 'Visa ending in 7033',
            'Developer documentation SaaS with healthy seat expansion.',
            initials='KD', total_revenue=1094, next_billing_date='2024-07-14',
            monthly_mrr=(149, 149, 199, 199, 199, 199),
        ),
        _build_record(
            'cust-028', 'SummitOps', 'hello@summitops.io', 'Starter', 49, 'Canceled',
            '2024-01-05', 'Monthly', 2, 'Mastercard ending in 1409',
            'Sunset project after pivot; clean billing history.',
            initials='SO', total_revenue=196, canceled_date='2024-05-05', churn_reason='Not using',
            monthly_mrr=(49, 49, 49, 49, 0, 0),
        ),
        _build_record(
            'cust-032', 'Vanguard BI', 'ops@vanguardbi.com', 'Pro', 249, 'Active',
            '2024-01-03', 'Monthly', 11, 'Amex ending in 5502',
            'Self-serve BI vendor tracking expansion ARR.',
            initials='VB', total_revenue=1394, next_billing_date='2024-07-03',
            monthly_mrr=(199, 199, 249, 249, 249, 249),
        ),
    ]

    # Add 40 realistic pre-2024 baseline customers (2023-07 through 2023-12)
    # including 6 realistic churn events evenly across Jan-Jun 2024 so every month has
    # authentic cohort churn, retention, and plan representation.
    baseline_specs: list[
        tuple[str, str, SubscriptionPlan, int, AccountStatus, str, BillingCycle, int, Optional[str], Optional[ChurnReason]]
    ] = [
        ('Helios Cloud', 'finance@helioscloud.io', 'Enterprise', 1499, 'Active', '2023-12-22', 'Annual', 60, None, None),
        ('Cascade AI', 'billing@cascadeai.dev', 'Pro', 299, 'Active', '2023-12-18', 'Monthly', 14, None, None),
        ('Bramble Tech', 'ops@brambletech.co', 'Starter', 99, 'Canceled', '2023-12-12', 'Monthly', 4, '2024-06-15', 'Price'),
        ('Ironclad Data', 'ap@ironcladdata.com', 'Business', 599, 'Active', '2023-12-08', 'Annual', 28, None, None),
        ('Finch Billing', 'team@finchbilling.io', 'Pro', 249, 'Active', '2023-12-03', 'Monthly', 10, None, None),
        ('Solstice SaaS', 'hello@solsticesaas.com', 'Starter', 79, 'Active', '2023-11-27', 'Monthly', 3, None, None),
        ('ClearPath Ops', 'billing@clearpathops.com', 'Business', 549, 'Active', '2023-11-21', 'Annual', 25, None, None),
        ('MetricFlow', 'admin@metricflow.io', 'Pro', 199, 'Canceled', '2023-11-16', 'Monthly', 8, '2024-04-21', 'Price'),
        ('Redwood Dev', 'founders@redwood.dev', 'Starter', 49, 'Active', '2023-11-12', 'Monthly', 2, None, None),
        ('Silverline HQ', 'finance@silverlinehq.com', 'Enterprise', 1299, 'Active', '2023-11-05', 'Annual', 48, None, None),
        ('GridPoint', 'ops@gridpoint.net', 'Pro', 249, 'Active', '2023-10-29', 'Monthly', 11, None, None),
        ('LaunchPad Lab', 'hello@launchpadlab.co', 'Starter', 99, 'Canceled', '2023-10-24', 'Monthly', 4, '2024-03-19', 'Not using'),
        ('Prism Analytics', 'billing@prismanalytics.io', 'Business', 649, 'Active', '2023-10-18', 'Annual', 34, None, None),
        ('Bluejay CRM', 'team@bluejaycrm.com', 'Pro', 299, 'Active', '2023-10-11', 'Monthly', 15, None, None),
        ('Trellis Cloud', 'accounts@trelliscloud.dev', 'Starter', 79, 'Active', '2023-10-04', 'Monthly', 3, None, None),
        ('AnchorStack', 'finance@anchorstack.io', 'Business', 499, 'Active', '2023-09-28', 'Monthly', 22, None, None),
        ('Verge Labs', 'billing@vergelabs.ai', 'Pro', 199, 'Canceled', '2023-09-22', 'Monthly', 7, '2024-02-26', 'Missing features'),
        ('Sparkline Co', 'hello@sparkline.co', 'Starter', 49, 'Active', '2023-09-16', 'Monthly', 2, None, None),
        ('Nexus Freight', 'it@nexusfreight.com', 'Enterprise', 1999, 'Active', '2023-09-09', 'Annual', 90, None, None),
        ('Canopy HR', 'ops@canopyhr.io', 'Pro', 249, 'Active', '2023-09-03', 'Monthly', 10, None, None),
        ('Oakridge Soft', 'billing@oakridgesoft.com', 'Business', 549, 'Active', '2023-08-27', 'Annual', 27, None, None),
        ('SwiftCart', 'team@swiftcart.shop', 'Starter', 99, 'Canceled', '2023-08-21', 'Monthly', 4, '2024-02-11', 'Not using'),
        ('Polaris Sync', 'admin@polarissync.io', 'Pro', 199, 'Active', '2023-08-15', 'Monthly', 9, None, None),
        ('Monolith DB', 'finance@monolithdb.dev', 'Business', 699, 'Active', '2023-08-08', 'Annual', 36, None, None),
        ('Wavefront UX', 'hello@wavefrontux.com', 'Starter', 79, 'Active', '2023-08-02', 'Monthly', 3, None, None),
        ('Nimbus Core', 'billing@nimbuscore.io', 'Pro', 299, 'Active', '2023-07-28', 'Monthly', 14, None, None),
        ('Ember Forge', 'ops@emberforge.dev', 'Starter', 49, 'Canceled', '2023-07-22', 'Monthly', 2, '2024-01-24', 'Price'),
        ('Keystone Ops', 'finance@keystoneops.com', 'Business', 599, 'Active', '2023-07-17', 'Annual', 30, None, None),
        ('Cobalt Mesh', 'team@cobaltmesh.io', 'Pro', 249, 'Active', '2023-07-12', 'Monthly', 12, None, None),
        ('Arbor Systems', 'billing@arborsystems.org', 'Enterprise', 1299, 'Active', '2023-07-08', 'Annual', 50, None, None),
        ('Cinder Mail', 'hello@cindermail.co', 'Starter', 79, 'Active', '2023-07-04', 'Monthly', 3, None, None),
        ('Atlas Revenue', 'finance@atlasrevenue.com', 'Business', 799, 'Active', '2023-06-29', 'Annual', 40, None, None),
        ('Zenith Forms', 'team@zenithforms.io', 'Pro', 199, 'Active', '2023-06-25', 'Monthly', 8, None, None),
        ('PixelForge', 'accounts@pixelforge.app', 'Starter', 99, 'Active', '2023-06-21', 'Monthly', 4, None, None),
        ('Stratos Cloud', 'billing@stratoscloud.net', 'Pro', 249, 'Active', '2023-08-19', 'Monthly', 11, None, None),
        ('Boreal Tech', 'ops@borealtech.ca', 'Business', 499, 'Active', '2023-09-14', 'Annual', 23, None, None),
        ('Crestline AI', 'founders@crestline.ai', 'Pro', 299, 'Active', '2023-10-08', 'Monthly', 13, None, None),
        ('Harborline', 'hello@harborline.co', 'Starter', 49, 'Active', '2023-11-01', 'Monthly', 2, None, None),
        ('Solis Health', 'it@solishealth.org', 'Business', 599, 'Active', '2023-11-29', 'Annual', 29, None, None),
        ('FinGrid', 'finance@fingrid.io', 'Pro', 249, 'Active', '2023-12-15', 'Monthly', 10, None, None),
    ]

    payment_methods = (
        'Visa ending in 4111',
        'Mastercard ending in 5544',
        'Amex ending in 3001',
        'ACH Direct Debit',
    )

    for idx, (name, email, plan, mrr, status, signup_date, cycle, seats, canceled_date, reason) in enumerate(baseline_specs, start=33):
        cid = f'cust-{idx:03d}'
        pm = 'ACH Direct Debit' if cycle == 'Annual' else payment_methods[idx % 3]
        note = (
            f'Churned customer ({reason}). Retained for cohort win-back outreach.'
            if status == 'Canceled'
            else f'Established {plan} tier account onboarded in 2023 with steady usage.'
        )
        records.append(
            _build_record(
                cid=cid,
                name=name,
                email=email,
                plan=plan,
                mrr=mrr,
                status=status,
                signup_date=signup_date,
                billing_cycle=cycle,
                seats=seats,
                payment_method=pm,
                notes=note,
                canceled_date=canceled_date,
                churn_reason=reason,
            )
        )

    return records


CUSTOMER_RECORDS: list[CustomerRecord] = _seed_dataset()
