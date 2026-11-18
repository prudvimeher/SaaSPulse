from typing import Literal, Optional
from pydantic import BaseModel

SubscriptionPlan = Literal['Starter', 'Pro', 'Business', 'Enterprise']
AccountStatus = Literal['Active', 'Past Due', 'Canceled']
BillingCycle = Literal['Monthly', 'Annual']
SortField = Literal['signupDate', 'mrr']
SortDirection = Literal['asc', 'desc']
TrendDirection = Literal['up', 'down']
ChurnReason = Literal['Price', 'Not using', 'Missing features', 'Other']
InsightIcon = Literal['trendUp', 'trendDown', 'users', 'layers', 'chart']


class RevenueHistoryPointSchema(BaseModel):
    month: str
    label: str
    value: int


class CustomerActivityItemSchema(BaseModel):
    id: str
    title: str
    timestamp: str


class CustomerSchema(BaseModel):
    id: str
    name: str
    email: str
    initials: str
    plan: SubscriptionPlan
    mrr: int
    status: AccountStatus
    signupDate: str
    billingCycle: BillingCycle
    totalRevenue: int
    seats: int
    nextBillingDate: Optional[str] = None
    paymentMethod: str
    mrrHistory: list[RevenueHistoryPointSchema]
    recentActivity: list[CustomerActivityItemSchema]
    notes: str


class CustomerListResponseSchema(BaseModel):
    items: list[CustomerSchema]
    total: int
    page: int
    pageSize: int
    totalPages: int


class TrendPointSchema(BaseModel):
    month: str
    fullLabel: str
    mrr: int
    arr: int


class PlanBreakdownSliceSchema(BaseModel):
    plan: str
    amount: int
    percentage: float
    color: str
    countLabel: Optional[str] = None


class RecentCustomerRowSchema(BaseModel):
    id: str
    name: str
    initials: str
    plan: SubscriptionPlan
    mrr: int
    status: AccountStatus
    signedUp: str


class InsightDataSchema(BaseModel):
    id: str
    icon: InsightIcon
    title: str
    description: str


class PlanPerformanceRowSchema(BaseModel):
    plan: SubscriptionPlan
    color: str
    customers: int
    mrr: int
    arr: int
    momGrowth: str
    sharePercent: str


class ChurnTrendPointSchema(BaseModel):
    month: str
    fullLabel: str
    churnRate: float
    retentionRate: float


class PlanChurnRowSchema(BaseModel):
    plan: SubscriptionPlan
    color: str
    churnRate: float
    customers: int


class ChurnedCustomerRowSchema(BaseModel):
    id: str
    name: str
    initials: str
    plan: SubscriptionPlan
    mrr: int
    activeFor: str
    churnedOn: str
    churnedDate: str
    reason: ChurnReason


class GrowthTrendPointSchema(BaseModel):
    month: str
    fullLabel: str
    newCustomers: int
    lostCustomers: int
    netGrowth: int


class PlanGrowthRowSchema(BaseModel):
    plan: SubscriptionPlan
    color: str
    startCustomers: int
    newCustomers: int
    lostCustomers: int
    endCustomers: int
    netGrowth: int
    growthPercent: str


class ExecutiveOverviewResponseSchema(BaseModel):
    mrr: int
    arr: int
    totalCustomers: int
    churnRate: float
    mrrChange: str
    mrrTrend: TrendDirection
    customersChange: str
    customersTrend: TrendDirection
    churnChange: str
    churnTrendDirection: TrendDirection
    mrrSparkline: list[int]
    arrSparkline: list[int]
    customersSparkline: list[int]
    churnSparkline: list[float]
    revenueSeries: list[TrendPointSchema]
    planSlices: list[PlanBreakdownSliceSchema]
    recentCustomers: list[RecentCustomerRowSchema]
    insights: list[InsightDataSchema]
    comparisonLabel: str
    limitationNote: Optional[str] = None
    startDate: str
    endDate: str


class RevenueIntelligenceResponseSchema(BaseModel):
    mrr: int
    arr: int
    revenueGrowth: str
    revenueGrowthChange: str
    revenueGrowthTrend: TrendDirection
    mrrChange: str
    mrrTrend: TrendDirection
    arpu: float
    arpuChange: str
    arpuTrend: TrendDirection
    mrrSparkline: list[int]
    arrSparkline: list[int]
    growthSparkline: list[float]
    arpuSparkline: list[float]
    revenueSeries: list[TrendPointSchema]
    planSlices: list[PlanBreakdownSliceSchema]
    planPerformance: list[PlanPerformanceRowSchema]
    insights: list[InsightDataSchema]
    comparisonLabel: str
    limitationNote: Optional[str] = None
    startDate: str
    endDate: str


class CustomerRetentionResponseSchema(BaseModel):
    churnRate: float
    retentionRate: float
    lostCustomers: int
    newCustomers: int
    churnChange: str
    churnTrendDirection: TrendDirection
    retentionChange: str
    retentionTrendDirection: TrendDirection
    lostChange: str
    lostTrendDirection: TrendDirection
    newChange: str
    newTrendDirection: TrendDirection
    churnSparkline: list[float]
    retentionSparkline: list[float]
    lostSparkline: list[int]
    newSparkline: list[int]
    churnTrend: list[ChurnTrendPointSchema]
    churnByPlan: list[PlanChurnRowSchema]
    recentlyChurned: list[ChurnedCustomerRowSchema]
    insights: list[InsightDataSchema]
    comparisonLabel: str
    limitationNote: Optional[str] = None
    startDate: str
    endDate: str


class CustomerGrowthResponseSchema(BaseModel):
    newCustomers: int
    activeCustomers: int
    lostCustomers: int
    netGrowth: int
    totalCustomers: int
    newChange: str
    newTrendDirection: TrendDirection
    activeChange: str
    activeTrendDirection: TrendDirection
    lostChange: str
    lostTrendDirection: TrendDirection
    netChange: str
    netTrendDirection: TrendDirection
    newSparkline: list[int]
    activeSparkline: list[int]
    lostSparkline: list[int]
    netSparkline: list[int]
    growthTrend: list[GrowthTrendPointSchema]
    distributionSlices: list[PlanBreakdownSliceSchema]
    planGrowth: list[PlanGrowthRowSchema]
    insights: list[InsightDataSchema]
    comparisonLabel: str
    limitationNote: Optional[str] = None
    startDate: str
    endDate: str


class CustomerSummaryResponseSchema(BaseModel):
    totalCustomers: int
    newCustomers: int
    lostCustomers: int
    avgSubscriptionValue: float
    totalChange: str
    totalTrend: TrendDirection
    newChange: str
    newTrend: TrendDirection
    lostChange: str
    lostTrend: TrendDirection
    avgValueChange: str
    avgValueTrend: TrendDirection
    totalSparkline: list[int]
    newSparkline: list[int]
    lostSparkline: list[int]
    avgValueSparkline: list[float]
    comparisonLabel: str
    limitationNote: Optional[str] = None
    startDate: str
    endDate: str
