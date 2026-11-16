
# SaaSPulse — Component Data Planning

## 1. Purpose

This document defines the data requirements and state ownership of every major React component in SaaSPulse.

The objectives are to:

- Build reusable React components.
- Separate data from UI presentation.
- Establish clear component responsibilities.
- Avoid unnecessary duplication.
- Prepare the application for future API integration.

### Data Flow Principle

- Props: Data received from parent components.
- Local UI State: Temporary interaction state managed by a component.
- Shared State: State owned by a common parent when multiple components need it.
- Server State: Data eventually retrieved and synchronized through backend APIs.

Initially, dashboard data will come from mock data files.

---

# 2. Shared Layout Components

These components are shared across all five dashboard pages.

## 2.1 Sidebar

**Responsibility:** Display application branding, navigation, favorites, and secondary links.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| logo | string | Props |
| navigationItems | array of objects | Props |
| navigationItem.label | string | Props |
| navigationItem.path | string | Props |
| navigationItem.icon | string | Props |
| favorites | array of objects | Props |
| activePath | string | Props / Router |
| isCollapsed | boolean | Local UI State |

### Local UI State
- Sidebar collapsed or expanded.

### Notes
- Navigation items should be rendered dynamically.
- Active navigation should reflect the current route.
- Navigation should be reusable across all pages.

---

## 2.2 Topbar

**Responsibility:** Display global search, notifications, and user profile information.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| user.name | string | Props |
| user.role | string | Props |
| user.avatar | string | Props |
| notificationCount | number | Props |
| searchPlaceholder | string | Props |

### Local UI State
- Search input value.
- Notification dropdown visibility.
- Profile dropdown visibility.

### Notes
- User information should be provided by the application.
- Search functionality can be connected to global search later.

---

# 3. Shared Dashboard Components

These components are reused across multiple dashboard pages.

## 3.1 PageHeader

**Responsibility:** Display the page title, description, category, and date-range controls.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| category | string | Props |
| title | string | Props |
| description | string | Props |
| dateRange | string | Props |
| comparisonPeriod | string | Props |
| showComparison | boolean | Props |

### Shared / Local UI State
- Selected date range should be owned by the page or a shared parent.
- Date picker visibility can be local UI state.

### Notes
- Every dashboard page should use the same PageHeader component.
- Different pages should provide different titles and descriptions.

---

## 3.2 MetricCard

**Responsibility:** Display one business metric and its performance comparison.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| title | string | Props |
| value | string or number | Props |
| icon | string | Props |
| change | number | Props |
| changeLabel | string | Props |
| trend | string | Props |
| sparklineData | array of numbers | Props |

### Local UI State
- None.

### Notes
- The component should be completely reusable.
- It should not calculate business metrics.
- It should only display the information received through props.
- Currency and percentage formatting should be handled consistently.

---

## 3.3 MetricGrid

**Responsibility:** Display multiple MetricCard components.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| metrics | array of objects | Props |
| metrics.title | string | Props |
| metrics.value | string or number | Props |
| metrics.icon | string | Props |
| metrics.change | number | Props |
| metrics.changeLabel | string | Props |
| metrics.trend | string | Props |
| metrics.sparklineData | array of numbers | Props |

### Local UI State
- None.

### Notes
- Render MetricCard components using array mapping.
- Each metric must have a unique identifier.
- Different dashboard pages provide different metric arrays.

---

## 3.4 ChartPanel

**Responsibility:** Provide a reusable container for different chart visualizations.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| title | string | Props |
| description | string | Props |
| chartType | string | Props |
| chartData | array of objects | Props |
| dataKeys | array of strings | Props |
| legend | array of objects | Props |
| showLegend | boolean | Props |
| showTooltip | boolean | Props |

### Local UI State
- None for the initial static implementation.

### Shared UI State
- Chart-specific selection, such as MRR or ARR, should be owned by the page when it affects other page components.

### Notes
- ChartPanel handles the chart's container and presentation.
- Chart visualization can be implemented using Recharts.
- Support line, bar, and doughnut charts as required by the wireframes.

---

## 3.5 DataTable

**Responsibility:** Display structured tabular data.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| columns | array of objects | Props |
| rows | array of objects | Props |
| rowKey | string | Props |
| showHeader | boolean | Props |
| emptyMessage | string | Props |

### Local UI State
- None for the initial static implementation.

### Shared UI State
- Sorting and pagination should be owned by the component using the table if they affect other UI elements.

### Notes
- Column definitions determine the table structure.
- Rows contain the actual data.
- Reuse this component for subscription plan tables and other simple data tables.
- Customer-specific interactions belong in CustomerTable.

---

## 3.6 InsightsPanel

**Responsibility:** Display important business observations and trends.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| title | string | Props |
| description | string | Props |
| insights | array of objects | Props |
| insights.id | string | Props |
| insights.title | string | Props |
| insights.description | string | Props |
| insights.icon | string | Props |
| insights.trend | string | Props |

### Local UI State
- None.

### Notes
- Reuse across Overview, Revenue, Retention, and Growth pages.
- Insights should initially come from mock data.
- Insight calculations can be introduced later.

---

# 4. Customer Components

## 4.1 CustomerTable

**Responsibility:** Display customer records with search, filtering, sorting, and pagination.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| customers | array of objects | Props |
| customer.id | string | Props |
| customer.name | string | Props |
| customer.email | string | Props |
| customer.plan | string | Props |
| customer.mrr | number | Props |
| customer.status | string | Props |
| customer.signupDate | string | Props |
| availablePlans | array of strings | Props |
| availableStatuses | array of strings | Props |

### Local UI State
- Search query.
- Selected subscription plan filter.
- Selected account status filter.
- Sorting field.
- Sorting direction.
- Current page.
- Selected customer ID.

### Notes
- Search should support customer name and email.
- Filters should work together.
- Sorting should support subscription value and signup date.
- Pagination should update the displayed records.
- Customer selection should be communicated to the parent page.

---

## 4.2 CustomerDetails

**Responsibility:** Display detailed information about the selected customer.

### Data Requirements

| Property | Data Type | Source |
|---|---|---|
| customer.id | string | Props |
| customer.name | string | Props |
| customer.email | string | Props |
| customer.avatar | string | Props |
| customer.status | string | Props |
| customer.plan | string | Props |
| customer.mrr | number | Props |
| customer.signupDate | string | Props |
| customer.totalRevenue | number | Props |
| revenueHistory | array of objects | Props |
| activityHistory | array of objects | Props |
| notes | array of objects | Props |

### Local UI State
- Active details tab (Overview, Subscription, Billing, Activity, Notes).
- More-options dropdown visibility.

### Notes
- Customer information should come from the selected customer.
- The parent Customers page should manage which customer is selected.
- CustomerDetails should not maintain a separate copy of customer information.

---

# 5. Page-Level Component Composition

Page components organize reusable components and provide their respective data.

## 5.1 Overview Page

**Components:**
- PageHeader
- MetricGrid
- ChartPanel (Revenue Performance)
- ChartPanel (Revenue by Subscription Plan)
- DataTable (Recent Customers)
- InsightsPanel

**Data Required:**
- MRR
- ARR
- Total customers
- Churn rate
- Revenue history
- Revenue by subscription plan
- Recent customers
- Business insights

**State Ownership:**
- Selected date range.
- Comparison period, if interactive.

---

## 5.2 Revenue Page

**Components:**
- PageHeader
- MetricGrid
- ChartPanel (MRR & ARR Trend)
- ChartPanel (Revenue Breakdown)
- DataTable (Subscription Plan Performance)
- InsightsPanel

**Data Required:**
- MRR
- ARR
- Revenue growth
- Average revenue per customer
- Monthly MRR and ARR history
- Revenue distribution by plan
- Subscription plan performance
- Revenue insights

**State Ownership:**
- Selected date range.
- Selected chart metric (MRR or ARR).

---

## 5.3 Retention Page

**Components:**
- PageHeader
- MetricGrid
- ChartPanel (Churn Rate Trend)
- ChartPanel (Churn by Subscription Plan)
- DataTable (Recently Churned Customers)
- InsightsPanel

**Data Required:**
- Churn rate
- Retention rate
- Lost customers
- New customers
- Monthly churn history
- Churn by subscription plan
- Recently churned customer records
- Retention insights

**State Ownership:**
- Selected date range.
- Selected chart metric (Churn Rate or Retention Rate).

---

## 5.4 Growth Page

**Components:**
- PageHeader
- MetricGrid
- ChartPanel (Customer Growth Trend)
- ChartPanel (Customer Distribution)
- DataTable (Growth by Subscription Plan)
- InsightsPanel

**Data Required:**
- New customers
- Active customers
- Lost customers
- Net customer growth
- Monthly customer growth history
- Customer distribution by status
- Growth by subscription plan
- Growth insights

**State Ownership:**
- Selected date range.

---

## 5.5 Customers Page

**Components:**
- PageHeader
- MetricGrid
- CustomerTable
- CustomerDetails

**Data Required:**
- Total customers
- New customers
- Lost customers
- Average subscription value
- Customer records
- Selected customer details
- Customer revenue history

**State Ownership:**
- Selected date range.
- Selected customer ID.
- CustomerTable interaction state.
- CustomerDetails active tab.

---

# 6. State Ownership Summary

| State | Initial Owner | Reason |
|---|---|---|
| Sidebar collapsed | Sidebar | Only affects Sidebar |
| Search input | Topbar | Initially limited to Topbar |
| Profile dropdown | Topbar | Only affects Topbar |
| Date range | Dashboard page | Can affect multiple page components |
| Metric data | Page | Passed to MetricGrid |
| Chart data | Page | Passed to ChartPanel |
| Chart selection | Page | May affect chart and related information |
| Table sorting | CustomerTable | Initially limited to table |
| Table pagination | CustomerTable | Initially limited to table |
| Customer selection | Customers Page | Shared between table and details |
| Active customer tab | CustomerDetails | Only affects details panel |

---

# 7. Data Management Principles

1. Keep mock data separate from component presentation.
2. Pass required data through props.
3. Keep component-local interaction state local.
4. Lift state when multiple components need the same information.
5. Avoid duplicating the same business data across components.
6. Use unique identifiers when rendering lists.
7. Use TypeScript to define data structures.
8. Do not calculate business metrics inside presentation components.
9. Introduce API integration later without unnecessarily changing component responsibilities.
10. Keep the initial architecture simple; introduce additional abstractions only when justified.

---

# 8. Implementation Scope

For Phase 2, Step 2:

- Build the shared Sidebar and Topbar.
- Build PageHeader.
- Build MetricCard and MetricGrid.
- Build ChartPanel.
- Build DataTable.
- Build InsightsPanel.
- Compose the five dashboard pages.
- Use mock data.
- Make the interface responsive.

CustomerTable and CustomerDetails can be implemented as part of the Customer 360 page.

### Explicitly Out of Scope

- Backend integration.
- Authentication.
- Real-time updates.
- API fetching.
- Complex global state management.
- Business metric calculations from production data.

These will be introduced in later phases.

---

**End of Component Data Planning**
