import { ChevronDown, ChevronLeft, ChevronRight, Download, MoreHorizontal, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

export interface CustomerRecord extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrr: number;
  status: string;
  signupDate: string;
}

interface CustomerTableProps {
  customers: CustomerRecord[];
  availablePlans: string[];
  availableStatuses: string[];
  selectedCustomerId?: string;
  onSelectCustomer?: (customer: CustomerRecord) => void;
}

const PAGE_SIZE = 7;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function buildPageNumbers(currentPage: number, pageCount: number): (number | "ellipsis")[] {
  if (pageCount <= 6) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1, 2, 3];
  if (currentPage > 4) {
    pages.push("ellipsis");
  }
  if (currentPage > 3 && currentPage < pageCount - 1) {
    pages.push(currentPage);
  }
  if (pageCount > 3) {
    pages.push("ellipsis", pageCount);
  }
  // Deduplicate
  const seen = new Set<number | string>();
  return pages.filter((p) => {
    const key = p === "ellipsis" ? `ellipsis-${pages.indexOf(p)}` : p;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function CustomerTable({
  customers,
  availablePlans,
  availableStatuses,
  selectedCustomerId,
  onSelectCustomer,
}: CustomerTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState<"signupDate" | "mrr">("signupDate");
  const [currentPage, setCurrentPage] = useState(1);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return customers
      .filter(
        (c) =>
          (!query ||
            c.name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query)) &&
          (selectedPlan === "all" || c.plan === selectedPlan) &&
          (selectedStatus === "all" || c.status === selectedStatus)
      )
      .toSorted((a, b) =>
        sortField === "mrr"
          ? b.mrr - a.mrr
          : new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime()
      );
  }, [customers, searchQuery, selectedPlan, selectedStatus, sortField]);

  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const visibleCustomers = filteredCustomers.slice(pageStart, pageStart + PAGE_SIZE);

  const visibleIds = useMemo(() => new Set(visibleCustomers.map((c) => c.id)), [visibleCustomers]);
  const checkedVisible = visibleCustomers.filter((c) => checkedIds.has(c.id));
  const allChecked = visibleCustomers.length > 0 && checkedVisible.length === visibleCustomers.length;
  const someChecked = checkedVisible.length > 0 && !allChecked;

  // Update indeterminate state
  if (selectAllRef.current) {
    selectAllRef.current.indeterminate = someChecked;
  }

  const updateFilter = (fn: () => void) => {
    fn();
    setCurrentPage(1);
  };

  const toggleAll = () => {
    if (allChecked || someChecked) {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pageNumbers = buildPageNumbers(safePage, pageCount);

  const totalStart = visibleCustomers.length === 0 ? 0 : pageStart + 1;
  const totalEnd = pageStart + visibleCustomers.length;

  return (
    <section className="customer-table-section">
      {/* Header */}
      <div className="ct-header">
        <div className="ct-header-text">
          <h2>Customers</h2>
          <p>A complete list of your customers with subscription and account details.</p>
        </div>
        <button className="ct-export-btn" type="button">
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Toolbar */}
      <div className="ct-toolbar">
        <label className="customer-search">
          <Search size={15} />
          <span className="sr-only">Search customers</span>
          <input
            value={searchQuery}
            onChange={(e) => updateFilter(() => setSearchQuery(e.target.value))}
            placeholder="Search by name or email..."
          />
        </label>

        <div className="ct-dropdown">
          <select
            value={selectedPlan}
            onChange={(e) => updateFilter(() => setSelectedPlan(e.target.value))}
          >
            <option value="all">All Plans</option>
            {availablePlans.map((plan) => (
              <option key={plan} value={plan}>{plan}</option>
            ))}
          </select>
          <ChevronDown size={14} className="ct-dropdown-icon" />
        </div>

        <div className="ct-dropdown">
          <select
            value={selectedStatus}
            onChange={(e) => updateFilter(() => setSelectedStatus(e.target.value))}
          >
            <option value="all">All Statuses</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <ChevronDown size={14} className="ct-dropdown-icon" />
        </div>

        <div className="ct-dropdown">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as "signupDate" | "mrr")}
          >
            <option value="signupDate">Sort: Signup Date</option>
            <option value="mrr">Sort: MRR</option>
          </select>
          <ChevronDown size={14} className="ct-dropdown-icon" />
        </div>
      </div>

      {/* Table */}
      <div className="data-table-scroll">
        <table className="ct-table">
          <thead>
            <tr>
              <th>
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="ct-checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Select all customers"
                />
              </th>
              <th>Customer</th>
              <th>Plan</th>
              <th>MRR</th>
              <th>Status</th>
              <th>Signup Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="data-table-empty">
                  No customers match your search.
                </td>
              </tr>
            ) : (
              visibleCustomers.map((customer) => {
                const isSelected = customer.id === selectedCustomerId;
                const isChecked = checkedIds.has(customer.id);
                const statusClass = customer.status.toLowerCase().replace(" ", "-");
                return (
                  <tr
                    key={customer.id}
                    className={[
                      "ct-row-clickable",
                      isSelected ? "ct-row-selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onSelectCustomer?.(customer)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="ct-checkbox"
                        checked={isChecked}
                        onChange={() => {/* controlled via onClick */}}
                        onClick={(e) => toggleRow(customer.id, e)}
                        aria-label={`Select ${customer.name}`}
                      />
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-avatar">{getInitials(customer.name)}</span>
                        <span>
                          <strong>{customer.name}</strong>
                          <small>{customer.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="table-badge table-badge-plan">{customer.plan}</span>
                    </td>
                    <td>${customer.mrr.toLocaleString()}</td>
                    <td>
                      <span className={`table-badge table-badge-status ${statusClass}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>{customer.signupDate}</td>
                    <td>
                      <button
                        type="button"
                        className="ct-action-btn"
                        aria-label={`Actions for ${customer.name}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <footer className="ct-pagination">
        <span>
          Showing {totalStart}–{totalEnd} of {filteredCustomers.length.toLocaleString()} customers
        </span>
        <div className="ct-pagination-controls">
          <button
            type="button"
            className="ct-page-btn"
            aria-label="Previous page"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft size={15} />
          </button>

          {pageNumbers.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="ct-page-ellipsis">···</span>
            ) : (
              <button
                key={p}
                type="button"
                className={`ct-page-btn${p === safePage ? " ct-page-btn-active" : ""}`}
                onClick={() => setCurrentPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            className="ct-page-btn"
            aria-label="Next page"
            disabled={safePage === pageCount}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </footer>
    </section>
  );
}
