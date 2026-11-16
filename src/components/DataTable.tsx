import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  render: (row: T) => ReactNode
  footer?: ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (row: T) => string
  onRowClick?: (row: T) => void
  showFooter?: boolean
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  showFooter = false,
  emptyMessage = 'No records available for the selected period.',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="border-t border-[#EAECF0] px-5 py-10 text-center text-xs text-[#667085]">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[540px] border-collapse text-left">
        <thead>
          <tr className="border-y border-[#EAECF0] bg-[#FCFCFD] text-[12px] font-medium text-[#475467]">
            {columns.map((column, index) => {
              const alignClass =
                column.align === 'right'
                  ? 'text-right'
                  : column.align === 'center'
                    ? 'text-center'
                    : 'text-left'
              const padClass =
                index === 0
                  ? 'pl-5 pr-3'
                  : index === columns.length - 1
                    ? 'pl-3 pr-5'
                    : 'px-3'

              return (
                <th
                  key={column.key}
                  scope="col"
                  className={`py-2.5 font-medium whitespace-nowrap ${alignClass} ${padClass} ${column.className ?? ''}`}
                >
                  {column.header}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#EAECF0]">
          {data.map((row) => (
            <tr
              key={getRowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`bg-white transition-colors ${
                onRowClick ? 'hover:bg-[#F9FAFB] cursor-pointer' : ''
              }`}
            >
              {columns.map((column, index) => {
                const alignClass =
                  column.align === 'right'
                    ? 'text-right'
                    : column.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                const padClass =
                  index === 0
                    ? 'pl-5 pr-3'
                    : index === columns.length - 1
                      ? 'pl-3 pr-5'
                      : 'px-3'

                return (
                  <td
                    key={column.key}
                    className={`py-3 align-middle text-[13px] text-[#344054] ${alignClass} ${padClass} ${column.className ?? ''}`}
                  >
                    {column.render(row)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>

        {showFooter && (
          <tfoot>
            <tr className="border-t border-[#EAECF0] bg-[#FCFCFD] text-[13px] font-semibold text-[#101828]">
              {columns.map((column, index) => {
                const alignClass =
                  column.align === 'right'
                    ? 'text-right'
                    : column.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                const padClass =
                  index === 0
                    ? 'pl-5 pr-3'
                    : index === columns.length - 1
                      ? 'pl-3 pr-5'
                      : 'px-3'

                return (
                  <td
                    key={column.key}
                    className={`py-3 align-middle font-tabular ${alignClass} ${padClass} ${column.className ?? ''}`}
                  >
                    {column.footer ?? null}
                  </td>
                )
              })}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
