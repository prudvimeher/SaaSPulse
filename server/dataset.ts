import type {
  AccountStatus,
  BillingCycle,
  Customer,
  CustomerActivityItem,
  RevenueHistoryPoint,
  SubscriptionPlan,
} from '../src/types/customer.ts'
import type { ChurnReason } from '../src/types/analytics.ts'

export const MONTH_KEYS = [
  '2024-01',
  '2024-02',
  '2024-03',
  '2024-04',
  '2024-05',
  '2024-06',
] as const

export type MonthKey = (typeof MONTH_KEYS)[number]

export const MONTH_SHORT_LABELS: Record<MonthKey, string> = {
  '2024-01': 'Jan',
  '2024-02': 'Feb',
  '2024-03': 'Mar',
  '2024-04': 'Apr',
  '2024-05': 'May',
  '2024-06': 'Jun',
}

export const MONTH_FULL_LABELS: Record<MonthKey, string> = {
  '2024-01': 'Jan 2024',
  '2024-02': 'Feb 2024',
  '2024-03': 'Mar 2024',
  '2024-04': 'Apr 2024',
  '2024-05': 'May 2024',
  '2024-06': 'Jun 2024',
}

export const MONTH_END_DATES: Record<MonthKey, string> = {
  '2024-01': '2024-01-31',
  '2024-02': '2024-02-29',
  '2024-03': '2024-03-31',
  '2024-04': '2024-04-30',
  '2024-05': '2024-05-31',
  '2024-06': '2024-06-18',
}

export const DATASET_MIN_DATE = '2024-01-01'
export const DATASET_MAX_DATE = '2024-06-18'

export interface CustomerRecord {
  customer: Customer
  canceledDate: string | null
  churnReason: ChurnReason | null
  pastDueDate: string | null
  monthlyMrr: readonly [number, number, number, number, number, number]
}

export function activeMrrForMonth(
  record: CustomerRecord,
  monthKey: MonthKey,
): number {
  const idx = MONTH_KEYS.indexOf(monthKey)
  const monthEnd = MONTH_END_DATES[monthKey]
  if (record.customer.signupDate > monthEnd) return 0
  if (record.canceledDate !== null && record.canceledDate <= monthEnd) return 0
  if (record.pastDueDate !== null && record.pastDueDate <= monthEnd) return 0
  return record.monthlyMrr[idx] ?? 0
}

export function isRetainedOn(
  record: CustomerRecord,
  isoDate: string,
): boolean {
  if (record.customer.signupDate > isoDate) return false
  if (record.canceledDate !== null && record.canceledDate <= isoDate) return false
  return true
}

function formatShortDate(isoDate: string): string {
  const [yearS, monthS, dayS] = isoDate.split('-')
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[Number(monthS) - 1]} ${String(Number(dayS)).padStart(2, '0')}, ${yearS}`
}

function makeInitials(name: string): string {
  const parts = name
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

interface BuildRecordOptions {
  initials?: string
  canceledDate?: string | null
  churnReason?: ChurnReason | null
  pastDueDate?: string | null
  nextBillingDate?: string | null
  totalRevenue?: number
  monthlyMrr?: readonly [number, number, number, number, number, number]
  activities?: CustomerActivityItem[]
}

function buildRecord(
  cid: string,
  name: string,
  email: string,
  plan: SubscriptionPlan,
  mrr: number,
  status: AccountStatus,
  signupDate: string,
  billingCycle: BillingCycle,
  seats: number,
  paymentMethod: string,
  notes: string,
  options: BuildRecordOptions = {},
): CustomerRecord {
  const computedInitials = options.initials ?? makeInitials(name)
  const signupMonth = signupDate.slice(0, 7)
  const canceledDate = options.canceledDate ?? null
  const churnReason = options.churnReason ?? null
  const pastDueDate = options.pastDueDate ?? null

  let monthlyMrrTuple: readonly [number, number, number, number, number, number]
  if (options.monthlyMrr) {
    monthlyMrrTuple = options.monthlyMrr
  } else {
    const vals: number[] = []
    for (let idx = 0; idx < MONTH_KEYS.length; idx += 1) {
      const mk = MONTH_KEYS[idx]
      const monthEnd = MONTH_END_DATES[mk]
      if (signupDate > monthEnd) {
        vals.push(0)
      } else if (canceledDate !== null && canceledDate <= monthEnd) {
        vals.push(0)
      } else if (idx <= 1 && mrr >= 199 && signupMonth < '2024-03') {
        vals.push(Math.max(49, mrr - 50))
      } else if (idx === 2 && mrr >= 249 && signupMonth < '2024-04') {
        vals.push(Math.max(49, mrr - 25))
      } else {
        vals.push(mrr)
      }
    }
    monthlyMrrTuple = [vals[0], vals[1], vals[2], vals[3], vals[4], vals[5]]
  }

  const historyPoints: RevenueHistoryPoint[] = MONTH_KEYS.map((mk, idx) => ({
    month: MONTH_SHORT_LABELS[mk],
    label: MONTH_FULL_LABELS[mk],
    value: monthlyMrrTuple[idx],
  }))

  let totalRevenue: number
  if (options.totalRevenue !== undefined) {
    totalRevenue = options.totalRevenue
  } else {
    const activeSum = monthlyMrrTuple.reduce((acc, v) => acc + v, 0)
    if (signupDate < '2024-01-01') {
      const [yearS, monthS] = signupDate.split('-')
      const preMonths = (2023 - Number(yearS)) * 12 + (13 - Number(monthS))
      totalRevenue = activeSum + preMonths * Math.max(49, mrr - 50)
    } else {
      totalRevenue = Math.max(mrr, activeSum)
    }
  }

  let nextBillingDate: string | null = options.nextBillingDate ?? null
  if (nextBillingDate === null && status !== 'Canceled') {
    if (billingCycle === 'Annual') {
      const [yS, mS, dS] = signupDate.split('-')
      nextBillingDate = `${Number(yS) + 1}-${mS}-${dS}`
    } else {
      const dayNum = Math.min(28, Number(signupDate.split('-')[2]))
      const dayStr = String(dayNum).padStart(2, '0')
      nextBillingDate = dayNum <= 18 ? `2024-07-${dayStr}` : `2024-06-${dayStr}`
    }
  }

  let activities: CustomerActivityItem[]
  if (options.activities) {
    activities = options.activities
  } else if (status === 'Canceled' && canceledDate) {
    activities = [
      {
        id: `${cid}-act-1`,
        title: `Subscription canceled (${churnReason ?? 'Other'})`,
        timestamp: formatShortDate(canceledDate),
      },
      {
        id: `${cid}-act-2`,
        title: `Account created on ${plan} plan`,
        timestamp: formatShortDate(signupDate),
      },
    ]
  } else if (status === 'Past Due' && pastDueDate) {
    activities = [
      {
        id: `${cid}-act-1`,
        title: `Payment retry scheduled ($${mrr})`,
        timestamp: formatShortDate(pastDueDate),
      },
      {
        id: `${cid}-act-2`,
        title: `Onboarded onto ${plan} tier`,
        timestamp: formatShortDate(signupDate),
      },
    ]
  } else {
    const dayClamped = String(Math.min(18, Number(signupDate.split('-')[2]))).padStart(2, '0')
    activities = [
      {
        id: `${cid}-act-1`,
        title:
          billingCycle === 'Annual'
            ? `Annual renewal confirmed ($${(mrr * 12).toLocaleString('en-US')})`
            : `Monthly invoice paid ($${mrr.toLocaleString('en-US')})`,
        timestamp: formatShortDate(
          signupDate >= '2024-05-19' ? signupDate : `2024-06-${dayClamped}`,
        ),
      },
      {
        id: `${cid}-act-2`,
        title: `Provisioned ${seats} seats on ${plan} plan`,
        timestamp: formatShortDate(signupDate),
      },
    ]
  }

  const customer: Customer = {
    id: cid,
    name,
    email,
    initials: computedInitials,
    plan,
    mrr,
    status,
    signupDate,
    billingCycle,
    totalRevenue,
    seats,
    nextBillingDate: status !== 'Canceled' ? nextBillingDate : null,
    paymentMethod,
    mrrHistory: historyPoints,
    recentActivity: activities,
    notes,
  }

  return {
    customer,
    canceledDate,
    churnReason,
    pastDueDate,
    monthlyMrr: monthlyMrrTuple,
  }
}

function seedDataset(): CustomerRecord[] {
  const records: CustomerRecord[] = [
    // --- June 2024 Signups ---
    buildRecord(
      'cust-001',
      'Acme Tech',
      'billing@acme.tech',
      'Pro',
      249,
      'Active',
      '2024-06-18',
      'Monthly',
      12,
      'Visa ending in 4242',
      'Key mid-market engineering customer. Evaluating Business tier for Q3 SSO rollout.',
      {
        initials: 'AT',
        totalRevenue: 249,
        nextBillingDate: '2024-07-18',
        monthlyMrr: [0, 0, 0, 0, 0, 249],
        activities: [
          {
            id: 'act-1',
            title: 'Monthly invoice #1042 paid ($249)',
            timestamp: 'Jun 18, 2024',
          },
          {
            id: 'act-2',
            title: 'Provisioned 12 team seats on Pro plan',
            timestamp: 'Jun 18, 2024',
          },
        ],
      },
    ),
    buildRecord(
      'cust-002',
      'Nova Systems',
      'hello@novasystems.io',
      'Business',
      499,
      'Active',
      '2024-06-16',
      'Annual',
      28,
      'Mastercard ending in 8819',
      'Annual Business contract with strong seat utilization across product & finance teams.',
      {
        initials: 'NS',
        totalRevenue: 5988,
        nextBillingDate: '2025-06-16',
        monthlyMrr: [0, 0, 0, 0, 0, 499],
        activities: [
          {
            id: 'act-3',
            title: 'Annual contract confirmed ($5,988)',
            timestamp: 'Jun 16, 2024',
          },
          {
            id: 'act-4',
            title: 'Enabled SAML SSO integration',
            timestamp: 'Jun 17, 2024',
          },
        ],
      },
    ),
    buildRecord(
      'cust-003',
      'CloudLift',
      'team@cloudlift.co',
      'Pro',
      249,
      'Active',
      '2024-06-14',
      'Monthly',
      10,
      'Amex ending in 1004',
      'Consistent weekly active leadership usage. High NPS respondent.',
      {
        initials: 'CL',
        totalRevenue: 249,
        nextBillingDate: '2024-07-14',
        monthlyMrr: [0, 0, 0, 0, 0, 249],
      },
    ),
    buildRecord(
      'cust-004',
      'Pioneer Dev',
      'contact@pioneer.dev',
      'Starter',
      99,
      'Active',
      '2024-06-12',
      'Monthly',
      4,
      'Visa ending in 7310',
      'Seed-stage developer tools startup growing seat count steadily.',
      {
        initials: 'PD',
        totalRevenue: 99,
        nextBillingDate: '2024-07-12',
        monthlyMrr: [0, 0, 0, 0, 0, 99],
      },
    ),
    buildRecord(
      'cust-005',
      'BrightLayer',
      'hi@brightlayer.com',
      'Pro',
      199,
      'Active',
      '2024-06-10',
      'Monthly',
      8,
      'Visa ending in 5501',
      'Design-led SaaS team tracking cohort retention and expansion MRR.',
      {
        initials: 'BL',
        totalRevenue: 199,
        nextBillingDate: '2024-07-10',
        monthlyMrr: [0, 0, 0, 0, 0, 199],
      },
    ),
    buildRecord(
      'cust-006',
      'DevX Systems',
      'support@devx.com',
      'Business',
      499,
      'Past Due',
      '2024-06-08',
      'Monthly',
      24,
      'Visa ending in 1903 (Expired)',
      'Card expired on June renewal; account owner notified for updated corporate card.',
      {
        initials: 'DX',
        totalRevenue: 499,
        nextBillingDate: '2024-06-22',
        pastDueDate: '2024-06-09',
        monthlyMrr: [0, 0, 0, 0, 0, 499],
        activities: [
          {
            id: 'act-12',
            title: 'Payment retry scheduled (card expired)',
            timestamp: 'Jun 09, 2024',
          },
          {
            id: 'act-13',
            title: 'Dunning notice sent to finance contact',
            timestamp: 'Jun 08, 2024',
          },
        ],
      },
    ),
    buildRecord(
      'cust-029',
      'Quantum Ledger',
      'finance@quantumledger.io',
      'Enterprise',
      1499,
      'Active',
      '2024-06-04',
      'Annual',
      65,
      'Wire / ACH Direct Debit',
      'Multi-entity financial SaaS deployed on Enterprise SLA with dedicated CSM.',
      {
        initials: 'QL',
        totalRevenue: 17988,
        nextBillingDate: '2025-06-04',
        monthlyMrr: [0, 0, 0, 0, 0, 1499],
      },
    ),

    // --- May 2024 Signups ---
    buildRecord(
      'cust-007',
      'TechMove',
      'hello@techmove.io',
      'Starter',
      49,
      'Canceled',
      '2024-05-28',
      'Monthly',
      2,
      'Mastercard ending in 3398',
      'Paused subscription during internal restructuring; candidate for Q4 win-back.',
      {
        initials: 'TM',
        totalRevenue: 49,
        canceledDate: '2024-06-12',
        churnReason: 'Other',
        monthlyMrr: [0, 0, 0, 0, 49, 0],
      },
    ),
    buildRecord(
      'cust-008',
      'Veloce Cloud',
      'finance@velocecloud.com',
      'Business',
      649,
      'Active',
      '2024-05-24',
      'Annual',
      35,
      'ACH Direct Debit',
      'High-growth infrastructure customer with multi-region reporting enabled.',
      {
        initials: 'VC',
        totalRevenue: 7788,
        nextBillingDate: '2025-05-24',
        monthlyMrr: [0, 0, 0, 0, 599, 649],
      },
    ),
    buildRecord(
      'cust-009',
      'Kinetix AI',
      'ops@kinetix.ai',
      'Pro',
      299,
      'Active',
      '2024-05-19',
      'Monthly',
      15,
      'Amex ending in 9120',
      'Fast-growing AI workflow startup; upgraded seat pack in June.',
      {
        initials: 'KA',
        totalRevenue: 548,
        nextBillingDate: '2024-07-19',
        monthlyMrr: [0, 0, 0, 0, 249, 299],
      },
    ),
    buildRecord(
      'cust-010',
      'Harbor Metrics',
      'accounts@harbormetrics.co',
      'Starter',
      79,
      'Active',
      '2024-05-15',
      'Monthly',
      3,
      'Visa ending in 6621',
      'Analytics consultancy monitoring client SaaS benchmarks.',
      {
        initials: 'HM',
        totalRevenue: 158,
        nextBillingDate: '2024-07-15',
        monthlyMrr: [0, 0, 0, 0, 79, 79],
      },
    ),
    buildRecord(
      'cust-011',
      'SignalForge',
      'billing@signalforge.dev',
      'Business',
      549,
      'Active',
      '2024-05-11',
      'Annual',
      30,
      'Visa ending in 3045',
      'Observability vendor on annual Business commitment.',
      {
        initials: 'SF',
        totalRevenue: 6588,
        nextBillingDate: '2025-05-11',
        monthlyMrr: [0, 0, 0, 0, 549, 549],
      },
    ),
    buildRecord(
      'cust-012',
      'LumenStack',
      'team@lumenstack.io',
      'Pro',
      199,
      'Past Due',
      '2024-05-06',
      'Monthly',
      9,
      'Mastercard ending in 7742',
      'Second retry scheduled; CSM reached out to billing admin.',
      {
        initials: 'LS',
        totalRevenue: 199,
        nextBillingDate: '2024-06-21',
        pastDueDate: '2024-06-06',
        monthlyMrr: [0, 0, 0, 0, 199, 199],
      },
    ),

    // --- April 2024 Signups ---
    buildRecord(
      'cust-013',
      'OrbitPay',
      'finance@orbitpay.com',
      'Business',
      799,
      'Active',
      '2024-04-29',
      'Annual',
      42,
      'ACH Direct Debit',
      'Largest fintech account in Business tier; zero churn risk.',
      {
        initials: 'OP',
        totalRevenue: 9588,
        nextBillingDate: '2025-04-29',
        monthlyMrr: [0, 0, 0, 749, 799, 799],
      },
    ),
    buildRecord(
      'cust-014',
      'CedarWorks',
      'hello@cedarworks.co',
      'Starter',
      49,
      'Active',
      '2024-04-22',
      'Monthly',
      2,
      'Visa ending in 2184',
      'Small boutique agency using Starter workspace for monthly KPI reviews.',
      {
        initials: 'CW',
        totalRevenue: 147,
        nextBillingDate: '2024-07-22',
        monthlyMrr: [0, 0, 0, 49, 49, 49],
      },
    ),
    buildRecord(
      'cust-015',
      'PulseGrid',
      'admin@pulsegrid.net',
      'Pro',
      249,
      'Active',
      '2024-04-17',
      'Monthly',
      11,
      'Amex ending in 4412',
      'Energy analytics SaaS monitoring recurring fleet contracts.',
      {
        initials: 'PG',
        totalRevenue: 747,
        nextBillingDate: '2024-07-17',
        monthlyMrr: [0, 0, 0, 249, 249, 249],
      },
    ),
    buildRecord(
      'cust-016',
      'StrataFlow',
      'billing@strataflow.io',
      'Starter',
      99,
      'Canceled',
      '2024-04-10',
      'Monthly',
      4,
      'Visa ending in 8841',
      'Acquired by larger enterprise parent; consolidated onto parent billing.',
      {
        initials: 'ST',
        totalRevenue: 99,
        canceledDate: '2024-05-10',
        churnReason: 'Other',
        monthlyMrr: [0, 0, 0, 99, 0, 0],
      },
    ),
    buildRecord(
      'cust-017',
      'VectorLabs',
      'finance@vectorlabs.ai',
      'Business',
      499,
      'Active',
      '2024-04-03',
      'Monthly',
      22,
      'Mastercard ending in 5190',
      'ML tooling startup tracking cohort retention weekly.',
      {
        initials: 'VL',
        totalRevenue: 1497,
        nextBillingDate: '2024-07-03',
        monthlyMrr: [0, 0, 0, 499, 499, 499],
      },
    ),
    buildRecord(
      'cust-030',
      'Titan Grid',
      'procurement@titangrid.com',
      'Enterprise',
      1999,
      'Active',
      '2024-04-01',
      'Annual',
      85,
      'ACH Direct Debit',
      'Enterprise logistics platform using custom BI exports and dedicated support.',
      {
        initials: 'TG',
        totalRevenue: 23988,
        nextBillingDate: '2025-04-01',
        monthlyMrr: [0, 0, 0, 1799, 1999, 1999],
      },
    ),

    // --- March 2024 Signups ---
    buildRecord(
      'cust-018',
      'Northstar Ops',
      'ops@northstarops.com',
      'Pro',
      199,
      'Active',
      '2024-03-26',
      'Monthly',
      7,
      'Visa ending in 9912',
      'Logistics operations platform with steady Pro tier usage.',
      {
        initials: 'NO',
        totalRevenue: 796,
        nextBillingDate: '2024-06-26',
        monthlyMrr: [0, 0, 199, 199, 199, 199],
      },
    ),
    buildRecord(
      'cust-019',
      'MintLedger',
      'team@mintledger.co',
      'Starter',
      99,
      'Active',
      '2024-03-19',
      'Monthly',
      5,
      'Visa ending in 1157',
      'Bookkeeping SaaS evaluating upgrade to Pro for custom cohort exports.',
      {
        initials: 'ML',
        totalRevenue: 396,
        nextBillingDate: '2024-07-19',
        monthlyMrr: [0, 0, 99, 99, 99, 99],
      },
    ),
    buildRecord(
      'cust-020',
      'Apex Telemetry',
      'billing@apextelemetry.io',
      'Business',
      599,
      'Active',
      '2024-03-11',
      'Annual',
      32,
      'ACH Direct Debit',
      'Global telemetry SaaS with quarterly executive business reviews.',
      {
        initials: 'AX',
        totalRevenue: 7188,
        nextBillingDate: '2025-03-11',
        monthlyMrr: [0, 0, 549, 599, 599, 599],
      },
    ),
    buildRecord(
      'cust-021',
      'RelayDesk',
      'support@relaydesk.com',
      'Pro',
      249,
      'Past Due',
      '2024-03-04',
      'Monthly',
      10,
      'Amex ending in 6008',
      'Billing contact requested PO update before card re-charge.',
      {
        initials: 'RD',
        totalRevenue: 747,
        nextBillingDate: '2024-06-24',
        pastDueDate: '2024-06-04',
        monthlyMrr: [0, 0, 249, 249, 249, 249],
      },
    ),

    // --- February 2024 Signups ---
    buildRecord(
      'cust-022',
      'Cobalt Cloud',
      'hello@cobaltcloud.dev',
      'Starter',
      49,
      'Active',
      '2024-02-24',
      'Monthly',
      2,
      'Visa ending in 3829',
      'Indie SaaS studio running two micro-products.',
      {
        initials: 'CC',
        totalRevenue: 245,
        nextBillingDate: '2024-06-24',
        monthlyMrr: [0, 49, 49, 49, 49, 49],
      },
    ),
    buildRecord(
      'cust-023',
      'Beacon Health',
      'it@beaconhealth.org',
      'Business',
      699,
      'Active',
      '2024-02-15',
      'Annual',
      38,
      'ACH Direct Debit',
      'Healthcare scheduling SaaS on annual Business agreement.',
      {
        initials: 'BH',
        totalRevenue: 8388,
        nextBillingDate: '2025-02-15',
        monthlyMrr: [0, 599, 649, 649, 699, 699],
      },
    ),
    buildRecord(
      'cust-024',
      'Quarry Data',
      'accounts@quarrydata.io',
      'Pro',
      299,
      'Canceled',
      '2024-02-08',
      'Monthly',
      12,
      'Mastercard ending in 2077',
      'Churned after building internal warehouse reporting.',
      {
        initials: 'QD',
        totalRevenue: 598,
        canceledDate: '2024-04-08',
        churnReason: 'Missing features',
        monthlyMrr: [0, 299, 299, 0, 0, 0],
      },
    ),
    buildRecord(
      'cust-031',
      'Aether Security',
      'secops@aethersecurity.io',
      'Enterprise',
      1499,
      'Active',
      '2024-02-02',
      'Annual',
      54,
      'Wire / ACH Direct Debit',
      'Cybersecurity vendor using SOC2 compliance audit reporting.',
      {
        initials: 'AS',
        totalRevenue: 17988,
        nextBillingDate: '2025-02-02',
        monthlyMrr: [0, 1299, 1299, 1499, 1499, 1499],
      },
    ),

    // --- January 2024 Signups ---
    buildRecord(
      'cust-025',
      'DriftLine',
      'team@driftline.app',
      'Starter',
      79,
      'Active',
      '2024-01-29',
      'Monthly',
      3,
      'Visa ending in 4890',
      'Product analytics workspace for mobile subscription apps.',
      {
        initials: 'DL',
        totalRevenue: 414,
        nextBillingDate: '2024-06-29',
        monthlyMrr: [49, 49, 79, 79, 79, 79],
      },
    ),
    buildRecord(
      'cust-026',
      'Meridian Pay',
      'billing@meridianpay.com',
      'Business',
      549,
      'Active',
      '2024-01-21',
      'Annual',
      26,
      'ACH Direct Debit',
      'B2B payments infrastructure customer with strong annual retention.',
      {
        initials: 'MP',
        totalRevenue: 6588,
        nextBillingDate: '2025-01-21',
        monthlyMrr: [449, 499, 499, 549, 549, 549],
      },
    ),
    buildRecord(
      'cust-027',
      'Kestrel Docs',
      'founders@kestreldocs.com',
      'Pro',
      199,
      'Active',
      '2024-01-14',
      'Monthly',
      8,
      'Visa ending in 7033',
      'Developer documentation SaaS with healthy seat expansion.',
      {
        initials: 'KD',
        totalRevenue: 1094,
        nextBillingDate: '2024-07-14',
        monthlyMrr: [149, 149, 199, 199, 199, 199],
      },
    ),
    buildRecord(
      'cust-028',
      'SummitOps',
      'hello@summitops.io',
      'Starter',
      49,
      'Canceled',
      '2024-01-05',
      'Monthly',
      2,
      'Mastercard ending in 1409',
      'Sunset project after pivot; clean billing history.',
      {
        initials: 'SO',
        totalRevenue: 196,
        canceledDate: '2024-05-05',
        churnReason: 'Not using',
        monthlyMrr: [49, 49, 49, 49, 0, 0],
      },
    ),
    buildRecord(
      'cust-032',
      'Vanguard BI',
      'ops@vanguardbi.com',
      'Pro',
      249,
      'Active',
      '2024-01-03',
      'Monthly',
      11,
      'Amex ending in 5502',
      'Self-serve BI vendor tracking expansion ARR.',
      {
        initials: 'VB',
        totalRevenue: 1394,
        nextBillingDate: '2024-07-03',
        monthlyMrr: [199, 199, 249, 249, 249, 249],
      },
    ),
  ]

  const baselineSpecs: Array<
    readonly [
      string,
      string,
      SubscriptionPlan,
      number,
      AccountStatus,
      string,
      BillingCycle,
      number,
      string | null,
      ChurnReason | null,
    ]
  > = [
    ['Helios Cloud', 'finance@helioscloud.io', 'Enterprise', 1499, 'Active', '2023-12-22', 'Annual', 60, null, null],
    ['Cascade AI', 'billing@cascadeai.dev', 'Pro', 299, 'Active', '2023-12-18', 'Monthly', 14, null, null],
    ['Bramble Tech', 'ops@brambletech.co', 'Starter', 99, 'Canceled', '2023-12-12', 'Monthly', 4, '2024-06-15', 'Price'],
    ['Ironclad Data', 'ap@ironcladdata.com', 'Business', 599, 'Active', '2023-12-08', 'Annual', 28, null, null],
    ['Finch Billing', 'team@finchbilling.io', 'Pro', 249, 'Active', '2023-12-03', 'Monthly', 10, null, null],
    ['Solstice SaaS', 'hello@solsticesaas.com', 'Starter', 79, 'Active', '2023-11-27', 'Monthly', 3, null, null],
    ['ClearPath Ops', 'billing@clearpathops.com', 'Business', 549, 'Active', '2023-11-21', 'Annual', 25, null, null],
    ['MetricFlow', 'admin@metricflow.io', 'Pro', 199, 'Canceled', '2023-11-16', 'Monthly', 8, '2024-04-21', 'Price'],
    ['Redwood Dev', 'founders@redwood.dev', 'Starter', 49, 'Active', '2023-11-12', 'Monthly', 2, null, null],
    ['Silverline HQ', 'finance@silverlinehq.com', 'Enterprise', 1299, 'Active', '2023-11-05', 'Annual', 48, null, null],
    ['GridPoint', 'ops@gridpoint.net', 'Pro', 249, 'Active', '2023-10-29', 'Monthly', 11, null, null],
    ['LaunchPad Lab', 'hello@launchpadlab.co', 'Starter', 99, 'Canceled', '2023-10-24', 'Monthly', 4, '2024-03-19', 'Not using'],
    ['Prism Analytics', 'billing@prismanalytics.io', 'Business', 649, 'Active', '2023-10-18', 'Annual', 34, null, null],
    ['Bluejay CRM', 'team@bluejaycrm.com', 'Pro', 299, 'Active', '2023-10-11', 'Monthly', 15, null, null],
    ['Trellis Cloud', 'accounts@trelliscloud.dev', 'Starter', 79, 'Active', '2023-10-04', 'Monthly', 3, null, null],
    ['AnchorStack', 'finance@anchorstack.io', 'Business', 499, 'Active', '2023-09-28', 'Monthly', 22, null, null],
    ['Verge Labs', 'billing@vergelabs.ai', 'Pro', 199, 'Canceled', '2023-09-22', 'Monthly', 7, '2024-02-26', 'Missing features'],
    ['Sparkline Co', 'hello@sparkline.co', 'Starter', 49, 'Active', '2023-09-16', 'Monthly', 2, null, null],
    ['Nexus Freight', 'it@nexusfreight.com', 'Enterprise', 1999, 'Active', '2023-09-09', 'Annual', 90, null, null],
    ['Canopy HR', 'ops@canopyhr.io', 'Pro', 249, 'Active', '2023-09-03', 'Monthly', 10, null, null],
    ['Oakridge Soft', 'billing@oakridgesoft.com', 'Business', 549, 'Active', '2023-08-27', 'Annual', 27, null, null],
    ['SwiftCart', 'team@swiftcart.shop', 'Starter', 99, 'Canceled', '2023-08-21', 'Monthly', 4, '2024-02-11', 'Not using'],
    ['Polaris Sync', 'admin@polarissync.io', 'Pro', 199, 'Active', '2023-08-15', 'Monthly', 9, null, null],
    ['Monolith DB', 'finance@monolithdb.dev', 'Business', 699, 'Active', '2023-08-08', 'Annual', 36, null, null],
    ['Wavefront UX', 'hello@wavefrontux.com', 'Starter', 79, 'Active', '2023-08-02', 'Monthly', 3, null, null],
    ['Nimbus Core', 'billing@nimbuscore.io', 'Pro', 299, 'Active', '2023-07-28', 'Monthly', 14, null, null],
    ['Ember Forge', 'ops@emberforge.dev', 'Starter', 49, 'Canceled', '2023-07-22', 'Monthly', 2, '2024-01-24', 'Price'],
    ['Keystone Ops', 'finance@keystoneops.com', 'Business', 599, 'Active', '2023-07-17', 'Annual', 30, null, null],
    ['Cobalt Mesh', 'team@cobaltmesh.io', 'Pro', 249, 'Active', '2023-07-12', 'Monthly', 12, null, null],
    ['Arbor Systems', 'billing@arborsystems.org', 'Enterprise', 1299, 'Active', '2023-07-08', 'Annual', 50, null, null],
    ['Cinder Mail', 'hello@cindermail.co', 'Starter', 79, 'Active', '2023-07-04', 'Monthly', 3, null, null],
    ['Atlas Revenue', 'finance@atlasrevenue.com', 'Business', 799, 'Active', '2023-06-29', 'Annual', 40, null, null],
    ['Zenith Forms', 'team@zenithforms.io', 'Pro', 199, 'Active', '2023-06-25', 'Monthly', 8, null, null],
    ['PixelForge', 'accounts@pixelforge.app', 'Starter', 99, 'Active', '2023-06-21', 'Monthly', 4, null, null],
    ['Stratos Cloud', 'billing@stratoscloud.net', 'Pro', 249, 'Active', '2023-08-19', 'Monthly', 11, null, null],
    ['Boreal Tech', 'ops@borealtech.ca', 'Business', 499, 'Active', '2023-09-14', 'Annual', 23, null, null],
    ['Crestline AI', 'founders@crestline.ai', 'Pro', 299, 'Active', '2023-10-08', 'Monthly', 13, null, null],
    ['Harborline', 'hello@harborline.co', 'Starter', 49, 'Active', '2023-11-01', 'Monthly', 2, null, null],
    ['Solis Health', 'it@solishealth.org', 'Business', 599, 'Active', '2023-11-29', 'Annual', 29, null, null],
    ['FinGrid', 'finance@fingrid.io', 'Pro', 249, 'Active', '2023-12-15', 'Monthly', 10, null, null],
  ]

  const paymentMethods = [
    'Visa ending in 4111',
    'Mastercard ending in 5544',
    'Amex ending in 3001',
    'ACH Direct Debit',
  ]

  baselineSpecs.forEach(
    (
      [
        name,
        email,
        plan,
        mrr,
        status,
        signupDate,
        cycle,
        seats,
        canceledDate,
        reason,
      ],
      offset,
    ) => {
      const idx = 33 + offset
      const cid = `cust-${String(idx).padStart(3, '0')}`
      const pm = cycle === 'Annual' ? 'ACH Direct Debit' : paymentMethods[idx % 3]
      const note =
        status === 'Canceled'
          ? `Churned customer (${reason}). Retained for cohort win-back outreach.`
          : `Established ${plan} tier account onboarded in 2023 with steady usage.`
      records.push(
        buildRecord(
          cid,
          name,
          email,
          plan,
          mrr,
          status,
          signupDate,
          cycle,
          seats,
          pm,
          note,
          { canceledDate, churnReason: reason },
        ),
      )
    },
  )

  return records
}

export const CUSTOMER_RECORDS: readonly CustomerRecord[] = seedDataset()
