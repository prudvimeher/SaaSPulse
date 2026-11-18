import { useEffect, useRef, useState } from 'react'
import type { Customer, SortDirection, SortField } from '../types/customer'
import { formatCurrency, formatDate } from '../utils/formatters'
import { CustomerRowMenu } from './CustomerRowMenu'
import { StatusBadge } from './StatusBadge'

interface CustomerTableGridProps {
  customers: Customer[]
  selectedCustomerId: string | null
  sortField: SortField
  sortDirection: SortDirection
  isFetching: boolean
  onSortChange: (field: SortField, direction: SortDirection) => void
  onSelectCustomer: (customerId: string) => void
  onFeedback: (message: string) => void
}

export function CustomerTableGrid({
  customers,
  selectedCustomerId,
  sortField,
  sortDirection,
  isFetching,
  onSortChange,
  onSelectCustomer,
  onFeedback,
}: CustomerTableGridProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
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

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange(field, 'desc')
    }
  }

  const isAnyRowOnPageSelected = customers.some(
    (customer) => customer.id === selectedCustomerId,
  )

  return (
    <div
      className={`overflow-x-auto transition-opacity ${isFetching ? 'opacity-75' : 'opacity-100'}`}
      ref={menuContainerRef}
    >
      <table className="w-full min-w-[660px] border-collapse text-left">
        <thead>
          <tr className="border-y border-[#EAECF0] dark:border-[#1F2937] bg-[#FCFCFD] dark:bg-[#161F33] text-[12px] font-medium text-[#475467] dark:text-[#94A3B8]">
            <th scope="col" className="w-10 py-2.5 pl-5 pr-2">
              <button
                type="button"
                aria-label="Select first visible customer"
                onClick={() => {
                  if (customers[0]) {
                    onSelectCustomer(customers[0].id)
                  }
                }}
                className={`flex h-4 w-4 items-center justify-center rounded border transition-colors cursor-pointer ${
                  isAnyRowOnPageSelected
                    ? 'border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#5B4DF0]'
                    : 'border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#0F172A]'
                }`}
              >
                {isAnyRowOnPageSelected && (
                  <span className="h-1.5 w-1.5 rounded-[1px] bg-[#D0D5DD] dark:bg-[#64748B]" />
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
                className="inline-flex items-center justify-end gap-1 font-medium text-[#475467] dark:text-[#94A3B8] hover:text-[#101828] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                <span>MRR</span>
                {sortField === 'mrr' && (
                  <span
                    aria-hidden="true"
                    className="text-[10px] text-[#5B4DF0] dark:text-[#A5B4FC]"
                  >
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
                className="inline-flex items-center gap-1 font-medium text-[#475467] dark:text-[#94A3B8] hover:text-[#101828] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                <span>Signup Date</span>
                {sortField === 'signupDate' && (
                  <span
                    aria-hidden="true"
                    className="text-[10px] text-[#5B4DF0] dark:text-[#A5B4FC]"
                  >
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
        <tbody className="divide-y divide-[#EAECF0] dark:divide-[#1F2937]">
          {customers.map((customer) => {
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
                    ? 'bg-[#F5F3FF]/80 dark:bg-[#5B4DF0]/15 hover:bg-[#F5F3FF] dark:hover:bg-[#5B4DF0]/20'
                    : 'bg-white dark:bg-[#111827] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B]'
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
                        : 'border-[#D0D5DD] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-[#98A2B3] dark:hover:border-[#64748B]'
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
                          ? 'bg-[#EAE7FE] dark:bg-[#5B4DF0]/25 text-[#4338CA] dark:text-[#C7D2FE]'
                          : 'bg-[#EEF0F6] dark:bg-[#1E293B] text-[#344054] dark:text-[#E2E8F0]'
                      }`}
                      aria-hidden="true"
                    >
                      {customer.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#101828] dark:text-[#F8FAFC] leading-4 truncate">
                        {customer.name}
                      </div>
                      <div className="text-[12px] text-[#667085] dark:text-[#94A3B8] leading-4 mt-0.5 truncate">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3 align-middle">
                  <span className="inline-flex items-center rounded-md border border-[#E4E7EC] dark:border-[#334155] bg-[#F8F9FC] dark:bg-[#1E293B] px-2 py-0.5 text-[11.5px] font-medium text-[#344054] dark:text-[#CBD5E1] whitespace-nowrap">
                    {customer.plan}
                  </span>
                </td>

                <td className="py-3 px-3 align-middle text-right">
                  <span className="text-[13px] font-medium text-[#101828] dark:text-[#F8FAFC] font-tabular whitespace-nowrap">
                    {formatCurrency(customer.mrr)}
                  </span>
                </td>

                <td className="py-3 px-3 align-middle">
                  <StatusBadge status={customer.status} />
                </td>

                <td className="py-3 px-3 align-middle">
                  <span className="text-[13px] text-[#344054] dark:text-[#CBD5E1] font-tabular whitespace-nowrap">
                    {formatDate(customer.signupDate)}
                  </span>
                </td>

                <td
                  className="py-3 pl-2 pr-5 align-middle text-right relative"
                  onClick={(event) => event.stopPropagation()}
                >
                  <CustomerRowMenu
                    customer={customer}
                    isOpen={isMenuOpen}
                    onToggle={() =>
                      setOpenMenuId((prev) =>
                        prev === customer.id ? null : customer.id,
                      )
                    }
                    onClose={() => setOpenMenuId(null)}
                    onInspect={onSelectCustomer}
                    onFeedback={onFeedback}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
