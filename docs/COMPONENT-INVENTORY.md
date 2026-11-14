
# SaaSPulse — Component Inventory

## 1. Project Overview

**Project:** SaaSPulse  
**Type:** SaaS Business Analytics Dashboard  
**Purpose:** Provide SaaS founders with a centralized view of revenue, customer growth, and retention.

This document identifies the reusable UI components shared across the five dashboard screens.

---

## 2. Reusable Components

### 1. Sidebar
- **Purpose:** Provide navigation between dashboard sections.
- **Used in:** All five screens.
- **Inputs:**
  - Navigation items
  - Active navigation item
  - Favorite links
  - Navigation destinations

### 2. Topbar
- **Purpose:** Provide global application controls and user information.
- **Used in:** All five screens.
- **Inputs:**
  - Search input
  - Notification status
  - User name
  - User avatar
  - User role

### 3. PageHeader
- **Purpose:** Display the current page title, description, and page-level controls.
- **Used in:** All five screens.
- **Inputs:**
  - Page title
  - Page description
  - Date range selector (where applicable)
  - Comparison period (where applicable)
  - Additional page actions (where applicable)

### 4. MetricCard
- **Purpose:** Display an important business KPI and its performance change.
- **Used in:** All five screens.
- **Inputs:**
  - Metric title
  - Metric value
  - Change percentage or value
  - Comparison description
  - Trend direction
  - Optional trend indicator

### 5. DashboardPanel
- **Purpose:** Provide a consistent container for dashboard content.
- **Used in:** All five screens.
- **Inputs:**
  - Panel title
  - Panel description
  - Optional header action
  - Content (chart, table, or other UI)

### 6. DataTable
- **Purpose:** Display structured business and customer information.
- **Used in:** Revenue Intelligence, Customer Retention, Customer Growth, Customer 360.
- **Inputs:**
  - Column definitions
  - Row data
  - Sorting configuration
  - Pagination configuration
  - Optional row actions

### 7. StatusBadge
- **Purpose:** Visually communicate customer or account status.
- **Used in:** Customer 360, Customer Retention.
- **Inputs:**
  - Status label
  - Status type
  - Visual variant

### 8. InsightItem
- **Purpose:** Highlight important business observations and changes.
- **Used in:** Executive Overview, Revenue Intelligence, Customer Retention, Customer Growth.
- **Inputs:**
  - Insight title
  - Insight description
  - Optional icon
  - Insight type

---

## 3. Page-Specific Components

These components are initially specific to individual screens. They do not need separate reusable abstractions yet.

| Component | Screen |
|---|---|
| RevenueBreakdown | Revenue Intelligence |
| SubscriptionPlanPerformance | Revenue Intelligence |
| CustomerDetailPanel | Customer 360 |
| CustomerFilterBar | Customer 360 |
| CustomerDistribution | Customer Growth |
| CustomerGrowthByPlan | Customer Growth |
| ChurnByPlan | Customer Retention |

---

## 4. Component Hierarchy
```text
DashboardLayout
│
├── Sidebar
│
└── MainLayout
    │
    ├── Topbar
    │
    └── PageContent
        │
        ├── PageHeader
        │
        ├── MetricCard × 4
        │
        └── DashboardPanel
            │
            ├── Charts
            ├── DataTable
            └── InsightItem
```
Page-specific components are rendered inside the relevant page content.

---

## 5. Design Principles

1. Reuse components when they share a genuine responsibility.
2. Avoid creating abstractions for one-time UI elements.
3. Keep page-specific business logic separate from shared UI.
4. Maintain consistent spacing, typography, and visual styles.
5. Ensure components support responsive layouts.
6. Provide appropriate loading, empty, and error states.

---

## 6. Completion Criteria

- [x] Reviewed all five dashboard wireframes.
- [x] Identified shared UI components.
- [x] Identified page-specific components.
- [x] Defined component responsibilities.
- [x] Documented required inputs.
- [x] Established a conceptual component hierarchy.

**Status:** Phase 1 — Product Definition and Engineering Design completed.
