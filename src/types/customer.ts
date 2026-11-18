export type SubscriptionPlan = 'Starter' | 'Pro' | 'Business' | 'Enterprise'

export type AccountStatus = 'Active' | 'Past Due' | 'Canceled'

export type BillingCycle = 'Monthly' | 'Annual'

export type SortField = 'signupDate' | 'mrr'

export type SortDirection = 'asc' | 'desc'

export interface RevenueHistoryPoint {
  month: string
  label: string
  value: number
}

export interface CustomerActivityItem {
  id: string
  title: string
  timestamp: string
}

export interface Customer {
  id: string
  name: string
  email: string
  initials: string
  plan: SubscriptionPlan
  mrr: number
  status: AccountStatus
  signupDate: string
  billingCycle: BillingCycle
  totalRevenue: number
  seats: number
  nextBillingDate: string | null
  paymentMethod: string
  mrrHistory: RevenueHistoryPoint[]
  recentActivity: CustomerActivityItem[]
  notes: string
}
