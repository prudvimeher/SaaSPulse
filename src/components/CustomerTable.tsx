import { useEffect, useState } from 'react'
import type {
  AccountStatus,
  Customer,
  SortDirection,
  SortField,
  SubscriptionPlan,
} from '../types/customer'
import { CustomerTableGrid } from './CustomerTableGrid'
import { CustomerTablePagination } from './CustomerTablePagination'
import { CustomerTableToolbar } from './CustomerTableToolbar'

interface CustomerTableProps {
  customers: Customer[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize?: number
  searchQuery: string
  planFilter: 'All' | SubscriptionPlan
  statusFilter: 'All' | AccountStatus
  sortField: SortField
  sortDirection: SortDirection
  onSearchChange: (value: string) => void
  onPlanChange: (value: 'All' | SubscriptionPlan) => void
  onStatusChange: (value: 'All' | AccountStatus) => void
  onSortChange: (field: SortField, direction: SortDirection) => void
  onPageChange: (page: number) => void
  onResetFilters: () => void
  onExportCsv: () => Promise<number>
  selectedCustomerId: string | null
  onSelectCustomer: (customerId: string) => void
  isLoading?: boolean
  isFetching?: boolean
  errorMessage?: string | null
  onRetry?: () => void
}

export function CustomerTable({
  customers,
  totalCount,
  currentPage,
  totalPages,
  pageSize = 7,
  searchQuery,
  planFilter,
  statusFilter,
  sortField,
  sortDirection,
  onSearchChange,
  onPlanChange,
  onStatusChange,
  onSortChange,
  onPageChange,
  onResetFilters,
  onExportCsv,
  selectedCustomerId,
  onSelectCustomer,
  isLoading = false,
  isFetching = false,
  errorMessage = null,
  onRetry,
}: CustomerTableProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (!feedbackMessage) return
    const timer = window.setTimeout(() => {
      setFeedbackMessage(null)
    }, 2200)
    return () => window.clearTimeout(timer)
  }, [feedbackMessage])

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    planFilter !== 'All' ||
    statusFilter !== 'All'

  const handleExportClick = async () => {
    if (totalCount === 0 || isExporting) return
    setIsExporting(true)
    try {
      const exportedCount = await onExportCsv()
      setFeedbackMessage(`Exported ${exportedCount} customers`)
    } catch {
      setFeedbackMessage('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section
      aria-label="Customers directory"
      className="bg-white dark:bg-[#111827] border border-[#E6E8EF] dark:border-[#1F2937] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col min-w-0 transition-colors"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className="mt-0.5 text-[#475467] dark:text-[#94A3B8] shrink-0"
            aria-hidden="true"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[#101828] dark:text-[#F8FAFC] leading-5">
              Customers
            </h2>
            <p className="text-[12.5px] text-[#667085] dark:text-[#94A3B8] mt-0.5 leading-4">
              A complete list of your customers with subscription and account details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {feedbackMessage && (
            <span
              role="status"
              className="text-xs font-medium text-[#4F46E5] dark:text-[#A5B4FC] bg-[#F5F3FF] dark:bg-[#5B4DF0]/20 px-2.5 py-1 rounded-md"
            >
              {feedbackMessage}
            </span>
          )}
          <button
            type="button"
            onClick={() => void handleExportClick()}
            disabled={totalCount === 0 || isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            <svg
              className="h-3.5 w-3.5 text-[#475467] dark:text-[#94A3B8]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <CustomerTableToolbar
        searchQuery={searchQuery}
        planFilter={planFilter}
        statusFilter={statusFilter}
        sortField={sortField}
        sortDirection={sortDirection}
        onSearchChange={onSearchChange}
        onPlanChange={onPlanChange}
        onStatusChange={onStatusChange}
        onSortChange={onSortChange}
      />

      {/* Table, Loading, Error, or Empty State */}
      {errorMessage ? (
        <div
          role="alert"
          className="border-t border-[#EAECF0] dark:border-[#1F2937] px-6 py-12 text-center"
        >
          <p className="text-sm font-semibold text-[#B42318] dark:text-[#FCA5A5]">
            Unable to load customers
          </p>
          <p className="mt-1 text-xs text-[#667085] dark:text-[#94A3B8]">
            {errorMessage}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#111827] px-3.5 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      ) : isLoading ? (
        <div
          aria-busy="true"
          className="border-t border-[#EAECF0] dark:border-[#1F2937] divide-y divide-[#EAECF0] dark:divide-[#1F2937] animate-pulse"
        >
          {Array.from({ length: pageSize }, (_, idx) => (
            <div key={idx} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#EAECF0] dark:bg-[#1E293B]" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded bg-[#EAECF0] dark:bg-[#1E293B]" />
                  <div className="h-2.5 w-36 rounded bg-[#F2F4F7] dark:bg-[#161F33]" />
                </div>
              </div>
              <div className="h-4 w-16 rounded bg-[#EAECF0] dark:bg-[#1E293B]" />
            </div>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="border-t border-[#EAECF0] dark:border-[#1F2937] px-6 py-16 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F2F4F7] dark:bg-[#1E293B] text-[#667085] dark:text-[#94A3B8]">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[#101828] dark:text-[#F8FAFC]">
            No matching customers found
          </h3>
          <p className="mt-1 text-xs text-[#667085] dark:text-[#94A3B8] max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No customer records match your current search or filter selection.'
              : 'There are no customer records available to display for the selected period.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-4 inline-flex items-center rounded-lg border border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#111827] px-3.5 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <CustomerTableGrid
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          sortField={sortField}
          sortDirection={sortDirection}
          isFetching={isFetching}
          onSortChange={onSortChange}
          onSelectCustomer={onSelectCustomer}
          onFeedback={setFeedbackMessage}
        />
      )}

      {/* Pagination Footer */}
      <CustomerTablePagination
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </section>
  )
}
