import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  AccountStatus,
  Customer,
  SortDirection,
  SortField,
  SubscriptionPlan,
} from '../types/customer'
import { formatCurrency, formatDate } from '../utils/formatters'
import { StatusBadge } from './StatusBadge'

interface CustomerTableProps {
  customers: Customer[]
  selectedCustomerId: string | null
  onSelectCustomer: (customerId: string) => void
}

const PAGE_SIZE = 7

const PLAN_OPTIONS: readonly ('All' | SubscriptionPlan)[] = [
  'All',
  'Starter',
  'Pro',
  'Business',
]

const STATUS_OPTIONS: readonly ('All' | AccountStatus)[] = [
  'All',
  'Active',
  'Past Due',
  'Canceled',
]

type SortOptionValue = `${SortField}:${SortDirection}`

function getPageItems(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 'ellipsis', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages]
}

export function CustomerTable({
  customers,
  selectedCustomerId,
  onSelectCustomer,
}: CustomerTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState<'All' | SubscriptionPlan>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | AccountStatus>('All')
  const [sortField, setSortField] = useState<SortField>('signupDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const menuContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!openMenuId) return

    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenuId])

  useEffect(() => {
    if (!feedbackMessage) return
    const timer = window.setTimeout(() => {
      setFeedbackMessage(null)
    }, 2200)
    return () => window.clearTimeout(timer)
  }, [feedbackMessage])

  const filteredAndSortedCustomers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = customers.filter((customer) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.email.toLowerCase().includes(normalizedQuery)

      const matchesPlan =
        planFilter === 'All' || customer.plan === planFilter

      const matchesStatus =
        statusFilter === 'All' || customer.status === statusFilter

      return matchesSearch && matchesPlan && matchesStatus
    })

    const sorted = [...filtered].sort((a, b) => {
      const factor = sortDirection === 'asc' ? 1 : -1

      if (sortField === 'mrr') {
        if (a.mrr !== b.mrr) {
          return (a.mrr - b.mrr) * factor
        }
        return a.name.localeCompare(b.name)
      }

      const dateCompare = a.signupDate.localeCompare(b.signupDate)
      if (dateCompare !== 0) {
        return dateCompare * factor
      }
      return a.name.localeCompare(b.name)
    })

    return sorted
  }, [customers, searchQuery, planFilter, statusFilter, sortField, sortDirection])

  const totalCount = filteredAndSortedCustomers.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedCustomers = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE
    return filteredAndSortedCustomers.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredAndSortedCustomers, safePage])

  const startItem = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const endItem = Math.min(safePage * PAGE_SIZE, totalCount)
  const pageItems = getPageItems(safePage, totalPages)

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    planFilter !== 'All' ||
    statusFilter !== 'All'

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handlePlanChange = (value: 'All' | SubscriptionPlan) => {
    setPlanFilter(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: 'All' | AccountStatus) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleSortSelectChange = (value: SortOptionValue) => {
    const [field, direction] = value.split(':') as [SortField, SortDirection]
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setPlanFilter('All')
    setStatusFilter('All')
    setCurrentPage(1)
  }

  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Plan', 'MRR', 'Status', 'Signup Date']
    const rows = filteredAndSortedCustomers.map((customer) => [
      customer.id,
      `"${customer.name.replace(/"/g, '""')}"`,
      `"${customer.email.replace(/"/g, '""')}"`,
      customer.plan,
      String(customer.mrr),
      customer.status,
      customer.signupDate,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'saaspulse-customers.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setFeedbackMessage(`Exported ${filteredAndSortedCustomers.length} customers`)
  }

  const handleCopyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setFeedbackMessage(`${label} copied`)
    } catch {
      setFeedbackMessage(`${label}: ${value}`)
    }
    setOpenMenuId(null)
  }

  const isAnyRowOnPageSelected = paginatedCustomers.some(
    (customer) => customer.id === selectedCustomerId,
  )

  return (
    <section
      aria-label="Customers directory"
      className="bg-white border border-[#E6E8EF] rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col min-w-0"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 text-[#475467] shrink-0" aria-hidden="true">
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
            <h2 className="text-[15px] font-semibold text-[#101828] leading-5">
              Customers
            </h2>
            <p className="text-[12.5px] text-[#667085] mt-0.5 leading-4">
              A complete list of your customers with subscription and account details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {feedbackMessage && (
            <span
              role="status"
              className="text-xs font-medium text-[#4F46E5] bg-[#F5F3FF] px-2.5 py-1 rounded-md"
            >
              {feedbackMessage}
            </span>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredAndSortedCustomers.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-3 py-1.5 text-xs font-medium text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            <svg
              className="h-3.5 w-3.5 text-[#475467]"
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
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="px-5 pb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search customers by name or email"
            className="w-full h-9 rounded-lg border border-[#E4E7EC] bg-[#F9FAFB] pl-9 pr-8 text-[13px] text-[#101828] placeholder:text-[#667085] focus:bg-white focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              aria-label="Clear customer search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#667085] hover:text-[#101828] hover:bg-[#EAECF0] transition-colors cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Filter */}
          <div className="relative">
            <select
              aria-label="Filter by subscription plan"
              value={planFilter}
              onChange={(event) =>
                handlePlanChange(event.target.value as 'All' | SubscriptionPlan)
              }
              className="h-9 appearance-none rounded-lg border border-[#E4E7EC] bg-white pl-3 pr-8 text-[13px] font-medium text-[#344054] hover:border-[#D0D5DD] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors cursor-pointer"
            >
              {PLAN_OPTIONS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan === 'All' ? 'All Plans' : plan}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              aria-label="Filter by account status"
              value={statusFilter}
              onChange={(event) =>
                handleStatusChange(event.target.value as 'All' | AccountStatus)
              }
              className="h-9 appearance-none rounded-lg border border-[#E4E7EC] bg-white pl-3 pr-8 text-[13px] font-medium text-[#344054] hover:border-[#D0D5DD] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors cursor-pointer"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Sort Select */}
          <div className="relative">
            <select
              aria-label="Sort customers"
              value={`${sortField}:${sortDirection}`}
              onChange={(event) =>
                handleSortSelectChange(event.target.value as SortOptionValue)
              }
              className="h-9 appearance-none rounded-lg border border-[#E4E7EC] bg-white pl-3 pr-8 text-[13px] font-medium text-[#344054] hover:border-[#D0D5DD] focus:border-[#5B4DF0] focus:outline-none focus:ring-2 focus:ring-[#5B4DF0]/15 transition-colors cursor-pointer"
            >
              <option value="signupDate:desc">Sort: Signup Date</option>
              <option value="signupDate:asc">Sort: Oldest Signup</option>
              <option value="mrr:desc">Sort: Highest MRR</option>
              <option value="mrr:asc">Sort: Lowest MRR</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table or Empty State */}
      {paginatedCustomers.length === 0 ? (
        <div className="border-t border-[#EAECF0] px-6 py-16 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F2F4F7] text-[#667085]">
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
          <h3 className="text-sm font-semibold text-[#101828]">
            No matching customers found
          </h3>
          <p className="mt-1 text-xs text-[#667085] max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No customer records match your current search or filter selection.'
              : 'There are no customer records available to display.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto" ref={menuContainerRef}>
          <table className="w-full min-w-[660px] border-collapse text-left">
            <thead>
              <tr className="border-y border-[#EAECF0] bg-[#FCFCFD] text-[12px] font-medium text-[#475467]">
                <th scope="col" className="w-10 py-2.5 pl-5 pr-2">
                  <button
                    type="button"
                    aria-label="Select first visible customer"
                    onClick={() => {
                      if (paginatedCustomers[0]) {
                        onSelectCustomer(paginatedCustomers[0].id)
                      }
                    }}
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors cursor-pointer ${
                      isAnyRowOnPageSelected
                        ? 'border-[#D0D5DD] bg-white text-[#5B4DF0]'
                        : 'border-[#D0D5DD] bg-white'
                    }`}
                  >
                    {isAnyRowOnPageSelected && (
                      <span className="h-1.5 w-1.5 rounded-[1px] bg-[#D0D5DD]" />
                    )}
                  </button>
                </th>
                <th scope="col" className="py-2.5 px-3 font-medium">
                  Customer
                </th>
                <th scope="col" className="py-2.5 px-3 font-medium">
                  Plan
                </th>
                <th scope="col" className="py-2.5 px-3 font-medium text-right">
                  <button
                    type="button"
                    onClick={() => handleColumnSort('mrr')}
                    className="inline-flex items-center justify-end gap-1 font-medium text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
                  >
                    <span>MRR</span>
                    {sortField === 'mrr' && (
                      <span aria-hidden="true" className="text-[10px] text-[#5B4DF0]">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                </th>
                <th scope="col" className="py-2.5 px-3 font-medium">
                  Status
                </th>
                <th scope="col" className="py-2.5 px-3 font-medium">
                  <button
                    type="button"
                    onClick={() => handleColumnSort('signupDate')}
                    className="inline-flex items-center gap-1 font-medium text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
                  >
                    <span>Signup Date</span>
                    {sortField === 'signupDate' && (
                      <span aria-hidden="true" className="text-[10px] text-[#5B4DF0]">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                </th>
                <th scope="col" className="w-12 py-2.5 pl-2 pr-5 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {paginatedCustomers.map((customer) => {
                const isSelected = customer.id === selectedCustomerId
                const isMenuOpen = openMenuId === customer.id

                return (
                  <tr
                    key={customer.id}
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => onSelectCustomer(customer.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelectCustomer(customer.id)
                      }
                    }}
                    className={`group transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5B4DF0] ${
                      isSelected
                        ? 'bg-[#F5F3FF]/80 hover:bg-[#F5F3FF]'
                        : 'bg-white hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <td
                      className="py-3 pl-5 pr-2 align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={`Select ${customer.name}`}
                        onClick={() => onSelectCustomer(customer.id)}
                        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#5B4DF0] bg-[#5B4DF0] text-white'
                            : 'border-[#D0D5DD] bg-white hover:border-[#98A2B3]'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-tight ${
                            isSelected
                              ? 'bg-[#EAE7FE] text-[#4338CA]'
                              : 'bg-[#EEF0F6] text-[#344054]'
                          }`}
                          aria-hidden="true"
                        >
                          {customer.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[#101828] leading-4 truncate">
                            {customer.name}
                          </div>
                          <div className="text-[12px] text-[#667085] leading-4 mt-0.5 truncate">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <span className="inline-flex items-center rounded-md border border-[#E4E7EC] bg-[#F8F9FC] px-2 py-0.5 text-[11.5px] font-medium text-[#344054] whitespace-nowrap">
                        {customer.plan}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-middle text-right">
                      <span className="text-[13px] font-medium text-[#101828] font-tabular whitespace-nowrap">
                        {formatCurrency(customer.mrr)}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <StatusBadge status={customer.status} />
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <span className="text-[13px] text-[#344054] font-tabular whitespace-nowrap">
                        {formatDate(customer.signupDate)}
                      </span>
                    </td>

                    <td
                      className="py-3 pl-2 pr-5 align-middle text-right relative"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        aria-label={`Row actions for ${customer.name}`}
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        onClick={() =>
                          setOpenMenuId((prev) =>
                            prev === customer.id ? null : customer.id,
                          )
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828] transition-colors cursor-pointer"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <circle cx="5" cy="12" r="1.75" />
                          <circle cx="12" cy="12" r="1.75" />
                          <circle cx="19" cy="12" r="1.75" />
                        </svg>
                      </button>

                      {isMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-5 top-11 z-20 w-44 rounded-lg border border-[#E4E7EC] bg-white py-1 text-left shadow-lg"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              onSelectCustomer(customer.id)
                              setOpenMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#F9FAFB] cursor-pointer text-left"
                          >
                            Inspect customer
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() =>
                              void handleCopyText(customer.email, 'Email')
                            }
                            className="w-full px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#F9FAFB] cursor-pointer text-left"
                          >
                            Copy email address
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() =>
                              void handleCopyText(customer.id, 'Customer ID')
                            }
                            className="w-full px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#F9FAFB] cursor-pointer text-left"
                          >
                            Copy customer ID
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-[#EAECF0] flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-[#667085] font-tabular">
          {totalCount === 0
            ? 'Showing 0 of 0 customers'
            : `Showing ${startItem}–${endItem} of ${totalCount} customers`}
        </p>

        <nav aria-label="Customer table pagination" className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage <= 1}
            aria-label="Previous page"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {pageItems.map((item, idx) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex h-8 w-7 items-center justify-center text-xs text-[#667085]"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setCurrentPage(item)}
                aria-label={`Page ${item}`}
                aria-current={safePage === item ? 'page' : undefined}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-medium font-tabular transition-colors cursor-pointer ${
                  safePage === item
                    ? 'border-[#5B4DF0] bg-[#5B4DF0] text-white shadow-xs'
                    : 'border-[#E4E7EC] bg-white text-[#344054] hover:bg-[#F9FAFB]'
                }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage >= totalPages}
            aria-label="Next page"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </nav>
      </div>
    </section>
  )
}
