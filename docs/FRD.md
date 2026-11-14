
# SaaSPulse — Functional Requirements Document (FRD)

**Document Version:** 1.0  
**Status:** Approved for Development  
**Product Name:** SaaSPulse  
**Document Type:** Functional Requirements Document  
**Target Release:** MVP v1.0

---

## 1. Product Overview

### 1.1 Purpose

SaaSPulse is a SaaS business analytics dashboard that provides founders and CEOs with a centralized view of their company's business performance.

The application enables users to monitor recurring revenue, customer growth, customer retention, and subscription performance through interactive metrics, charts, and customer records.

### 1.2 Problem Statement

SaaS founders often rely on multiple platforms and data sources to understand their company's financial and operational performance.

This makes it difficult to:

- Monitor recurring revenue and revenue trends.
- Identify customer churn and retention problems.
- Understand customer acquisition and growth.
- Compare subscription plan performance.
- Access customer information efficiently.

SaaSPulse addresses these problems by consolidating relevant business information into one analytics dashboard.

### 1.3 Product Objectives

- Provide a centralized view of SaaS business performance.
- Help founders monitor recurring revenue.
- Make customer retention problems visible.
- Identify customer growth trends.
- Provide actionable insights through data visualization.
- Simplify customer discovery and analysis.

---

## 2. Target Users

### Primary Users

**SaaS Founders and CEOs**

Users who need to monitor business performance and make decisions regarding revenue, customer acquisition, and retention.

### User Goals

- Understand the company's current financial performance.
- Monitor recurring revenue growth.
- Identify subscription plans with high customer churn.
- Understand customer acquisition trends.
- Find and inspect individual customer records.

---

## 3. Product Scope

### 3.1 Included in MVP

The first release will include:

1. Executive Overview
2. Revenue Intelligence
3. Customer Retention
4. Customer Growth
5. Customer 360
6. Interactive filtering and data visualization
7. Responsive dashboard interface
8. Loading, empty, and error states

The MVP will use a controlled dataset representing a fictional SaaS business.

### 3.2 Excluded from MVP

The following capabilities are outside the initial release:

- User registration and authentication.
- Real payment processing.
- External billing platform integrations.
- Live financial data synchronization.
- Subscription management.
- Automated email notifications.
- Multi-tenant organization management.

---

## 4. Functional Requirements

Requirements are classified according to their implementation priority.

- **P0:** Essential for MVP.
- **P1:** Important functionality to implement after P0.
- **P2:** Optional future enhancement.

### 4.1 Executive Overview

**Objective:** Provide users with an overview of the company's business performance.

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-001 | Display the company's Monthly Recurring Revenue (MRR). | P0 |
| FR-002 | Display the company's Annual Recurring Revenue (ARR). | P0 |
| FR-003 | Display the total number of active customers. | P0 |
| FR-004 | Display the customer churn rate. | P0 |
| FR-005 | Display a revenue performance chart over time. | P0 |
| FR-006 | Display percentage changes in key metrics compared with the previous period. | P0 |
| FR-007 | Allow users to select a reporting date range. | P0 |
| FR-008 | Update dashboard metrics and visualizations when the reporting period changes. | P0 |

### 4.2 Revenue Intelligence

**Objective:** Help users understand revenue performance and recurring revenue trends.

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-009 | Display current Monthly Recurring Revenue (MRR). | P0 |
| FR-010 | Display Annual Recurring Revenue (ARR). | P0 |
| FR-011 | Display revenue growth over time through a chart. | P0 |
| FR-012 | Allow users to filter revenue data by date range. | P0 |
| FR-013 | Display revenue distribution across subscription plans. | P1 |
| FR-014 | Compare revenue performance across different reporting periods. | P1 |
| FR-015 | Display the percentage change in recurring revenue. | P1 |

### 4.3 Customer Retention

**Objective:** Help users understand customer churn and retention performance.

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-016 | Display the overall customer churn rate. | P0 |
| FR-017 | Display the overall customer retention rate. | P0 |
| FR-018 | Display customer churn trends over time. | P0 |
| FR-019 | Compare churn rates across subscription plans. | P1 |
| FR-020 | Identify subscription plans with comparatively high churn. | P1 |

### 4.4 Customer Growth

**Objective:** Help users monitor customer acquisition and growth.

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-021 | Display the total number of new customers during a selected period. | P1 |
| FR-022 | Display the total number of active customers. | P1 |
| FR-023 | Display the total number of lost customers during a selected period. | P1 |
| FR-024 | Visualize customer acquisition trends over time. | P1 |
| FR-025 | Compare customer growth across reporting periods. | P1 |

### 4.5 Customer 360

**Objective:** Allow users to search, filter, and inspect individual customer information.

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-026 | Display a list of customer records. | P0 |
| FR-027 | Display customer names and email addresses. | P0 |
| FR-028 | Display each customer's subscription plan. | P0 |
| FR-029 | Display each customer's account status. | P0 |
| FR-030 | Allow users to search customers by name or email address. | P0 |
| FR-031 | Allow users to filter customers by subscription plan. | P0 |
| FR-032 | Allow users to filter customers by account status. | P0 |
| FR-033 | Allow users to sort customers by subscription value. | P1 |
| FR-034 | Allow users to sort customers by signup date. | P1 |
| FR-035 | Allow users to inspect individual customer information. | P1 |
| FR-036 | Display an appropriate message when no customers match the selected search or filters. | P0 |

### 4.6 Interface and Interaction States

**Objective:** Ensure that the application communicates its current state clearly.

| ID | Functional Requirement | Priority |
|---|---|---|
| FR-037 | Display a loading state while dashboard data is being retrieved. | P0 |
| FR-038 | Display an appropriate error message when data retrieval fails. | P0 |
| FR-039 | Display an empty state when no relevant data is available. | P0 |
| FR-040 | Allow users to retry a failed data request. | P1 |
| FR-041 | Preserve the selected filters while navigating between relevant dashboard views. | P1 |

---

## 5. Detailed Functional Specifications

This section defines the expected behavior of important requirements in greater detail.

### 5.1 FR-001: Display Monthly Recurring Revenue

**Description:**

The application must calculate and display the company's Monthly Recurring Revenue (MRR) using active recurring subscriptions.

**Expected Behavior:**

- The dashboard must display the current MRR.
- Only active recurring subscriptions should contribute to MRR.
- The displayed amount must reflect the selected reporting date.
- The amount must be formatted consistently as currency.
- The dashboard must handle situations where no active subscriptions exist.

**Acceptance Criteria:**

1. Given active recurring subscriptions exist, when the dashboard loads, then their normalized monthly values must be reflected in MRR.
2. Given a subscription is inactive, then it must not contribute to current MRR.
3. Given no active recurring subscriptions exist, then MRR must display zero.
4. Given the selected reporting date changes, then MRR must reflect the subscriptions active at the relevant date.
5. The displayed MRR must match the underlying subscription dataset.

### 5.2 FR-006: Compare Metrics With Previous Period

**Description:**

The application must display percentage changes in key business metrics compared with the immediately preceding equivalent reporting period.

**Expected Behavior:**

- The application must identify the current reporting period.
- It must identify the preceding period of equal duration.
- It must calculate the percentage change for comparable metrics.
- It must indicate whether the metric increased, decreased, or remained unchanged.
- It must handle cases where the previous period has a zero value.

**Acceptance Criteria:**

1. Given a current period and previous period with valid values, then the percentage change must be calculated correctly.
2. Given the current value exceeds the previous value, then the interface must indicate an increase.
3. Given the current value is below the previous value, then the interface must indicate a decrease.
4. Given both values are equal, then the interface must indicate no change.
5. Given the previous period has a zero value, then the application must avoid displaying an invalid percentage.

### 5.3 FR-030: Search Customers

**Description:**

Users must be able to search for customers using their names or email addresses.

**Expected Behavior:**

- The customer list must respond to search input.
- Matching should be case-insensitive.
- Partial name and email matches should be supported.
- Search results must respect other active filters.
- The application must display an empty state when no records match.
- Clearing the search must restore the results permitted by the remaining filters.

**Acceptance Criteria:**

1. Given a customer exists, when the user enters their name, then matching records must appear.
2. Given a customer exists, when the user enters their email address, then matching records must appear.
3. Search must work regardless of letter casing.
4. Given no records match the query, then an appropriate empty state must appear.
5. Given the search input is cleared, then the customer list must return to its previously filtered state.

### 5.4 FR-031: Filter Customers by Subscription Plan

**Description:**

Users must be able to filter customer records according to their subscription plans.

**Expected Behavior:**

- Users must be able to select a subscription plan.
- The customer list must display only customers subscribed to the selected plan.
- The selected plan must be visibly identifiable.
- The user must be able to clear the filter.
- The customer search must continue working alongside the plan filter.

**Acceptance Criteria:**

1. Given a subscription plan is selected, then only customers belonging to that plan must appear.
2. Given no customers belong to the selected plan, then an empty state must appear.
3. Given the plan filter is cleared, then all customers permitted by the other active filters must appear.
4. Combining search and plan filtering must produce the correct results.

---

## 6. Business Rules

The application must follow the following business rules when processing dashboard data.

### 6.1 Revenue Rules

1. MRR must represent the sum of normalized monthly recurring revenue from active subscriptions.
2. ARR must equal MRR multiplied by 12.
3. Annual and quarterly subscription amounts must be normalized into monthly values before calculating MRR.
4. One-time payments must not contribute to recurring revenue.
5. Revenue calculations must use a consistent currency.
6. Historical reporting must use subscription activity applicable to the selected reporting date.

### 6.2 Customer Rules

1. An active customer is a customer with an active subscription.
2. A lost customer is a customer whose subscription has been terminated.
3. New customers must be counted according to their signup date.
4. Customer records must have unique identifiers.
5. A customer must belong to a valid subscription plan.

### 6.3 Reporting Rules

1. Reporting periods must use clearly defined start and end dates.
2. Previous-period comparisons must use an equivalent preceding duration.
3. Date filters must apply consistently to all relevant dashboard metrics.
4. Missing data must not be interpreted as a valid zero without an explicit business rule.

---

## 7. Data Requirements

The application will initially use a controlled dataset representing a fictional SaaS business.

### 7.1 Customer Data

Each customer record must support the following information:

| Field | Description |
|---|---|
| Customer ID | Unique customer identifier |
| Name | Customer's full name |
| Email | Customer's email address |
| Subscription Plan | Customer's current plan |
| Account Status | Current subscription status |
| Subscription Value | Recurring subscription amount |
| Signup Date | Date the customer registered |
| Subscription Start Date | Date the subscription became active |
| Subscription End Date | Date the subscription ended, if applicable |

### 7.2 Subscription Data

Each subscription record must support:

| Field | Description |
|---|---|
| Subscription ID | Unique subscription identifier |
| Customer ID | Associated customer |
| Plan ID | Associated subscription plan |
| Billing Interval | Monthly, quarterly, or annual |
| Subscription Amount | Amount charged per billing interval |
| Status | Active, canceled, or other supported status |
| Start Date | Subscription start date |
| End Date | Subscription end date, if applicable |

### 7.3 Subscription Plans

The initial dataset will support multiple subscription plans, such as:

- Basic
- Pro
- Enterprise

Each plan must have an identifiable name and recurring price.

---

## 8. Requirement Dependencies

Some requirements depend on other requirements being implemented first.

| Requirement | Dependency |
|---|---|
| FR-001: MRR | Subscription data and subscription status |
| FR-002: ARR | MRR calculation |
| FR-005: Revenue Chart | Historical revenue data |
| FR-006: Period Comparison | Current and previous period data |
| FR-016: Churn Rate | Customer and subscription history |
| FR-017: Retention Rate | Customer and subscription history |
| FR-019: Plan Churn Comparison | Subscription plan and churn data |
| FR-030: Customer Search | Customer records |
| FR-031: Plan Filtering | Customer and subscription plan data |

---

## 9. MVP Acceptance Criteria

The MVP will be considered functionally complete when:

- Users can access the executive overview.
- MRR, ARR, active customers, and churn rate are displayed correctly.
- Revenue trends are visualized.
- Reporting date filters update relevant dashboard information.
- Customer retention information is available.
- Users can search and filter customer records.
- Dashboard data matches the underlying dataset.
- Loading, empty, and error states are handled.
- The application is usable across desktop, tablet, and mobile screen sizes.

---

## 10. Assumptions and Constraints

### Assumptions

- The initial application uses fictional SaaS business data.
- The dataset contains sufficient historical information for reporting.
- Subscription amounts are available in a consistent currency.
- Subscription records contain the information needed to calculate recurring revenue and churn.
- The application is initially intended for a single fictional SaaS business.

### Constraints

- Authentication is outside the initial MVP.
- External billing integrations are not included.
- Real payment processing is not included.
- All displayed metrics must be derived from the controlled dataset.
- The initial release focuses on analytics and customer inspection rather than subscription management.

---

## 11. Future Enhancements

The following features may be considered for later releases:

- User authentication and role-based access.
- Integration with Stripe and other billing platforms.
- Multiple business workspaces.
- Custom dashboard widgets.
- Exporting reports as CSV or PDF.
- Automated anomaly detection.
- AI-powered business insights.
- Email reports and notifications.

---

## 12. Document Approval

| Role | Responsibility | Status |
|---|---|---|
| Product Owner | Review product requirements | Pending |
| Frontend Engineer | Review interface requirements | Pending |
| Backend Engineer | Review data requirements | Pending |
| QA Engineer | Review acceptance criteria | Pending |

---

**End of Document**

**Document:** SaaSPulse Functional Requirements Document  
**Version:** 1.0
