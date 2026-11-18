import type { Customer } from '../types/customer'

interface CustomerRowMenuProps {
  customer: Customer
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onInspect: (customerId: string) => void
  onFeedback: (message: string) => void
}

export function CustomerRowMenu({
  customer,
  isOpen,
  onToggle,
  onClose,
  onInspect,
  onFeedback,
}: CustomerRowMenuProps) {
  const handleCopyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      onFeedback(`${label} copied`)
    } catch {
      onFeedback(`${label}: ${value}`)
    }
    onClose()
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Row actions for ${customer.name}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#667085] dark:text-[#94A3B8] hover:bg-[#F2F4F7] dark:hover:bg-[#1E293B] hover:text-[#101828] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
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

      {isOpen && (
        <div
          role="menu"
          className="absolute right-5 top-11 z-20 w-44 rounded-lg border border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#111827] py-1 text-left shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onInspect(customer.id)
              onClose()
            }}
            className="w-full px-3 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] cursor-pointer text-left"
          >
            Inspect customer
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleCopyText(customer.email, 'Email')}
            className="w-full px-3 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] cursor-pointer text-left"
          >
            Copy email address
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleCopyText(customer.id, 'Customer ID')}
            className="w-full px-3 py-1.5 text-xs font-medium text-[#344054] dark:text-[#E2E8F0] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] cursor-pointer text-left"
          >
            Copy customer ID
          </button>
        </div>
      )}
    </>
  )
}
