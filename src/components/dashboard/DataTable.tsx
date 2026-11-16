import type { ReactNode } from "react";

export interface DataTableColumn<Row extends Record<string, unknown>> {
  key: keyof Row & string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (row: Row) => ReactNode;
}

interface DataTableProps<Row extends Record<string, unknown>> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: keyof Row & string;
  showHeader: boolean;
  emptyMessage: string;
  title?: string;
  description?: string;
  onRowClick?: (row: Row) => void;
  selectedRowKey?: string;
}

export default function DataTable<Row extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  showHeader,
  emptyMessage,
  title,
  description,
  onRowClick,
  selectedRowKey,
}: DataTableProps<Row>) {
  return (
    <section className="data-table-panel">
      {(title || description) && (
        <header className="data-table-header">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </header>
      )}

      <div className="data-table-scroll">
        <table className="data-table">
          {showHeader && (
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={`table-align-${column.align ?? "left"}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="data-table-empty" colSpan={columns.length}>{emptyMessage}</td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = String(row[rowKey]);

                return (
                  <tr
                    key={key}
                    className={`${onRowClick ? "data-table-row-clickable" : ""} ${selectedRowKey === key ? "data-table-row-selected" : ""}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((column) => {
                      const value = row[column.key];

                      return (
                        <td key={column.key} className={`table-align-${column.align ?? "left"}`}>
                          {column.render?.(row) ?? (typeof value === "string" || typeof value === "number" ? value : null)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
