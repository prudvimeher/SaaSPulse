import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type {
  CustomDateRange,
  CustomerGrowthResponse,
  CustomerListParams,
  CustomerListResponse,
  CustomerRetentionResponse,
  CustomerSummaryResponse,
  DateRangeKey,
  ExecutiveOverviewResponse,
  RevenueIntelligenceResponse,
} from '../types/analytics'
import type { Customer } from '../types/customer'
import { apiGet } from './client'

function buildDateParams(
  dateRange: DateRangeKey,
  customRange: CustomDateRange,
): Record<string, string | undefined> {
  if (dateRange === 'Custom Date Range') {
    return {
      date_range: dateRange,
      start_date: customRange.startDate,
      end_date: customRange.endDate,
    }
  }
  return { date_range: dateRange }
}

export function fetchCustomersList(
  params: CustomerListParams,
  signal?: AbortSignal,
): Promise<CustomerListResponse> {
  return apiGet<CustomerListResponse>(
    '/api/customers',
    {
      search: params.search?.trim() || undefined,
      plan: params.plan ?? 'All',
      status: params.status ?? 'All',
      sort_by: params.sortBy ?? 'signupDate',
      sort_dir: params.sortDir ?? 'desc',
      page: params.page ?? 1,
      page_size: params.pageSize ?? 7,
      date_range: params.dateRange,
      start_date:
        params.dateRange === 'Custom Date Range' ? params.startDate : undefined,
      end_date:
        params.dateRange === 'Custom Date Range' ? params.endDate : undefined,
    },
    signal,
  )
}

export function useExecutiveOverviewQuery(
  dateRange: DateRangeKey,
  customRange: CustomDateRange,
) {
  const params = buildDateParams(dateRange, customRange)
  return useQuery({
    queryKey: ['overview', params.date_range, params.start_date, params.end_date],
    queryFn: ({ signal }) =>
      apiGet<ExecutiveOverviewResponse>('/api/overview', params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useRevenueIntelligenceQuery(
  dateRange: DateRangeKey,
  customRange: CustomDateRange,
) {
  const params = buildDateParams(dateRange, customRange)
  return useQuery({
    queryKey: ['revenue', params.date_range, params.start_date, params.end_date],
    queryFn: ({ signal }) =>
      apiGet<RevenueIntelligenceResponse>('/api/revenue', params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useCustomerRetentionQuery(
  dateRange: DateRangeKey,
  customRange: CustomDateRange,
) {
  const params = buildDateParams(dateRange, customRange)
  return useQuery({
    queryKey: ['retention', params.date_range, params.start_date, params.end_date],
    queryFn: ({ signal }) =>
      apiGet<CustomerRetentionResponse>('/api/retention', params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useCustomerGrowthQuery(
  dateRange: DateRangeKey,
  customRange: CustomDateRange,
) {
  const params = buildDateParams(dateRange, customRange)
  return useQuery({
    queryKey: ['growth', params.date_range, params.start_date, params.end_date],
    queryFn: ({ signal }) =>
      apiGet<CustomerGrowthResponse>('/api/growth', params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useCustomerSummaryQuery(
  dateRange: DateRangeKey,
  customRange: CustomDateRange,
) {
  const params = buildDateParams(dateRange, customRange)
  return useQuery({
    queryKey: [
      'customers-summary',
      params.date_range,
      params.start_date,
      params.end_date,
    ],
    queryFn: ({ signal }) =>
      apiGet<CustomerSummaryResponse>('/api/customers/summary', params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useCustomersQuery(params: CustomerListParams) {
  return useQuery({
    queryKey: [
      'customers',
      params.search ?? '',
      params.plan ?? 'All',
      params.status ?? 'All',
      params.sortBy ?? 'signupDate',
      params.sortDir ?? 'desc',
      params.page ?? 1,
      params.pageSize ?? 7,
      params.dateRange ?? null,
      params.startDate ?? null,
      params.endDate ?? null,
    ],
    queryFn: ({ signal }) => fetchCustomersList(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useCustomerDetailQuery(customerId: string | null) {
  return useQuery({
    queryKey: ['customer-detail', customerId],
    queryFn: ({ signal }) =>
      apiGet<Customer>(`/api/customers/${customerId}`, undefined, signal),
    enabled: Boolean(customerId),
  })
}

export function useGlobalCustomerSearchQuery(query: string) {
  const trimmed = query.trim()
  return useQuery({
    queryKey: ['global-customer-search', trimmed],
    queryFn: ({ signal }) =>
      fetchCustomersList({ search: trimmed, page: 1, pageSize: 5 }, signal),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
  })
}
