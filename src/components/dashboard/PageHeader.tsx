
import {
  CalendarDays,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";

interface PageHeaderProps {
  category: string;
  title: string;
  description: string;
  dateRange?: string;
  comparisonPeriod?: string;
  showComparison?: boolean;
  showFilter?: boolean;
}

export default function PageHeader({
  category,
  title,
  description,
  dateRange = "Last 6 Months",
  comparisonPeriod = "vs. Previous 6 Months",
  showComparison = false,
  showFilter = false,
}: PageHeaderProps) {
  return (
    <section className="page-header">

      <div className="page-header-content">
        <div className="page-header-text">
          <span className="page-category">{category}</span>

          <h1>{title}</h1>

          <p>{description}</p>
        </div>

        <div className="page-header-actions">

          <button
            type="button"
            className="date-range-button"
          >
            <CalendarDays size={19} />

            <span>{dateRange}</span>

            <ChevronDown size={17} />
          </button>

          {showComparison && (
            <span className="comparison-text">
              {comparisonPeriod}
            </span>
          )}

          {showFilter && (
            <button
              type="button"
              className="filter-button"
              aria-label="Filter dashboard"
            >
              <SlidersHorizontal size={20} />
            </button>
          )}

        </div>
      </div>

    </section>
  );
}
