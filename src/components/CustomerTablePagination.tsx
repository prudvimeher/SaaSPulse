interface CustomerTablePaginationProps {
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
}

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

export function CustomerTablePagination({
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: CustomerTablePaginationProps) {
  const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  const startItem = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, totalCount)
  const pageItems = getPageItems(safePage, Math.max(1, totalPages))

  return (
    <div className="px-5 py-3.5 border-t border-[#EAECF0] dark:border-[#1F2937] flex flex-wrap items-center justify-between gap-3">
      <p className="text-[12.5px] text-[#667085] dark:text-[#94A3B8] font-tabular">
        {totalCount === 0
          ? 'Showing 0 of 0 customers'
          : `Showing ${startItem}–${endItem} of ${totalCount} customers`}
      </p>

      <nav aria-label="Customer table pagination" className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#475467] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
              className="inline-flex h-8 w-7 items-center justify-center text-xs text-[#667085] dark:text-[#94A3B8]"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item}`}
              aria-current={safePage === item ? 'page' : undefined}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-medium font-tabular transition-colors cursor-pointer ${
                safePage === item
                  ? 'border-[#5B4DF0] bg-[#5B4DF0] text-white shadow-xs'
                  : 'border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#344054] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B]'
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(Math.max(1, totalPages), safePage + 1))}
          disabled={safePage >= Math.max(1, totalPages)}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EC] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#475467] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
  )
}
