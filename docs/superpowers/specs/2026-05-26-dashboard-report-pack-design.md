# Dashboard Report Pack Design

## Goal

Expand the PMAIRCON dashboard into a more complete operational reporting surface while improving the unit detail page so central users can compare PM and repair activity more easily.

This report pack adds:

- Dashboard filters for `year`, `month`, `cycle`, `region`, `supplier`, `senior`, and `state`
- Dashboard cards for overdue, due, completion, and open repair KPIs
- Dashboard reporting sections for supplier and regional PM performance
- Dashboard operational tables for branches and units that still need PM attention
- A richer `PM vs Repair` comparison surface on the unit page
- Preservation of the existing Thailand region map as part of the dashboard performance layer

The implementation should preserve the current Google Sheet-backed architecture, keep analytics logic isolated in service code, and avoid pushing business rules into page components.

## Confirmed Business Rules

- PM target is `3 times per year` for each unit
- PM planning follows a `4-month spacing` model, not a standard calendar quarter
- Branch `Month` defines the PM pattern
- Examples:
  - `Month = 1` means `1, 5, 9`
  - `Month = 2` means `2, 6, 10`
  - `Month = 3` means `3, 7, 11`
  - `Month = 4` means `4, 8, 12`
- PM completion percentages are job-based, not average-per-unit percentages
- Dashboard scope should support `current year` plus user-selected `month` or `cycle`
- `Month` and `Cycle` filters are mutually exclusive in the dashboard UI
- The Thailand map stays on the dashboard and remains clickable for regional filtering

## Approach

Chosen approach: `Balanced Pack`

We will extend the dashboard and the unit page in the same implementation cycle while keeping reporting logic in shared analytics services.

Why this approach:

- The requested reporting set spans both management-level and unit-level use cases
- Dashboard-only changes would leave the `PM vs Repair` ask only partially solved
- The unit page already has a history foundation, so enhancing it now is cheaper than returning later
- The reporting logic for overdue, due, and completion can be reused by both dashboard and unit-focused views

## Filter Model

The dashboard should support these filters:

- `year`
- `month`
- `cycle`
- `region`
- `supplier`
- `senior`
- `state`

### Filter behavior

- `year` is always required in the reporting model
- `month` and `cycle` are mutually exclusive
- selecting `month` clears `cycle`
- selecting `cycle` clears `month`
- if neither is selected, the dashboard defaults to the active PM cycle for the current Bangkok date
- all KPI cards, tables, and the Thailand map should recalculate inside the same active filter scope
- filters should be reflected in the URL query string so users can share and bookmark report views

## KPI Definitions

The dashboard summary layer should expose these metrics:

- `Overdue units`
- `Due this month`
- `Due this cycle`
- `Annual PM completion %`
- `Cycle PM completion %`
- `Open repairs`

### Overdue units

Units that should already have a `PM DONE` record for the selected `month` or `cycle`, but do not.

### Due this month

Units whose PM pattern includes the selected month.

If no month is selected, this metric should be based on the current Bangkok month.

### Due this cycle

Units whose PM pattern belongs to the selected cycle.

If no cycle is selected, this metric should be based on the current Bangkok cycle.

### Annual PM completion

Formula:

- annual target jobs = `units in active scope x 3`
- annual completed jobs = count of `PM DONE` logs in selected year and active scope
- `annual completion % = annual completed jobs / annual target jobs`

### Cycle PM completion

Formula:

- cycle target jobs = count of units due in selected cycle and active scope
- cycle completed jobs = count of `PM DONE` logs in that selected cycle and active scope
- `cycle completion % = cycle completed jobs / cycle target jobs`

### Open repairs

Count of repair logs in active scope whose repair status is still open or in progress.

## Dashboard Layout

The dashboard should be organized into four layers.

### 1. Filter bar

Top-level controls:

- `Year`
- `Month`
- `Cycle`
- `Region`
- `Supplier`
- `Senior`
- `State`
- `Reset filters`

### 2. KPI summary

Top cards:

- `Overdue units`
- `Due this month`
- `Due this cycle`
- `Annual PM completion`
- `Cycle PM completion`
- `Open repairs`

### 3. Performance layer

This layer should keep the Thailand region map and pair it with supplier and regional PM reporting.

It should include:

- `Thailand region coverage map`
- `% PM success by supplier`
- `% PM success by region`
- `region vs supplier comparison`

The map should:

- remain visible on the dashboard
- remain clickable
- reflect the active filter scope
- continue using the existing color progression concept for PM completion

### 4. Operational reporting layer

This layer should include report tables for follow-up work.

Required branch-level table:

- `branch_code`
- `outlet_name`
- `region`
- `state`
- `supplier`
- `senior`
- `total_units`
- `due_units`
- `completed_units`
- `overdue_units`
- action link to branch detail

Recommended unit-level follow-up table in the same report pack:

- `unit_id`
- `branch_code`
- `outlet_name`
- `region`
- `supplier`
- `latest_pm_date`
- `latest_repair_date`
- `repairs_after_latest_pm`
- PM status summary
- action link to unit detail

This second table is important because the user explicitly wants reporting that reaches the machine level, not only the branch level.

## Dashboard Reporting Sections

### Supplier performance report

This table should show:

- `supplier`
- `units in scope`
- `required PM jobs`
- `completed PM jobs`
- `completion %`

### Region performance report

This table should show:

- `region`
- `units in scope`
- `required PM jobs`
- `completed PM jobs`
- `completion %`

### Region vs supplier comparison

This should provide a compact comparison surface for answering:

- which suppliers are underperforming inside a specific region
- which regions are lagging regardless of supplier

This can initially be a grouped table rather than a heatmap if that keeps implementation simpler while preserving readability.

## Unit Page Design

The current unit page already shows:

- latest PM
- latest repair
- PM history
- repair history

This report pack should enhance the unit page with a dedicated `PM vs Repair` interpretation layer.

### Keep current upper cards

Retain:

- `Latest PM`
- `Latest repair`
- `Record replacement`

### Keep history tables

Retain the two side-by-side history tables:

- `PM history`
- `Repair history`

### Add comparison summary

Below or above the history tables, add a compact comparison summary such as:

- `Repairs after latest PM: X`
- `No repair recorded after latest PM`
- `Latest PM to latest repair gap`

The purpose is to help central users decide quickly whether a unit still produces repair activity after recent PM work.

### Comparison interpretation rules

- compare repair events against the latest successful PM date
- count only repairs after the latest successful PM for the main summary
- if no successful PM exists, show the repair history normally but avoid misleading after-PM conclusions

## Analytics Model

The reporting implementation should use a layered analytics model rather than page-level ad hoc calculations.

### 1. Filter normalization layer

Normalize query params into a single reporting scope object:

- `year`
- `month | null`
- `cycle | null`
- `region | null`
- `supplier | null`
- `senior | null`
- `state | null`

This layer should:

- enforce mutual exclusivity between `month` and `cycle`
- derive the active cycle when neither is supplied
- centralize all default behavior

### 2. Analytics layer

Consume:

- `branches`
- `units`
- `pmLogs`
- `repairLogs`

Expected outputs:

- `summary`
- `supplierPerformance`
- `regionPerformance`
- `regionSupplierComparison`
- `branchOperationalRows`
- `unitOperationalRows`
- `unitHistoryComparisons`

Core logic responsibilities:

- map `unit -> branch -> region/supplier/senior/state`
- resolve due months and due cycles from branch `Month`
- count completed PM jobs from `service_status = DONE`
- detect overdue units
- detect repairs after latest PM

### 3. Presentation layer

Consume analytics outputs and render:

- filter bar
- KPI cards
- Thailand map
- performance tables
- branch operational table
- unit operational table
- unit page PM vs Repair summary

Page components should remain thin composition layers.

## Data Dependencies

This feature should continue using the current Google Sheet-backed data model.

Required branch fields:

- `branch_code`
- `outlet_name`
- `region`
- `state`
- `senior_name`
- `supplier_name`
- `pm_start_month`

Required unit fields:

- `unit_id`
- `branch_code`

Required PM log fields:

- `unit_id`
- `service_date`
- `service_status`

Required repair log fields:

- `unit_id`
- `service_date`
- `issue_detail`
- `repair_status`

If any live data loader path does not currently expose the above fields into dashboard collections, it should be extended in the service layer rather than patched inside components.

## Error Handling And Empty States

- If filters produce no matching scope, show zero-state cards and empty reporting tables with clear copy
- If a supplier, region, senior, or state filter no longer matches current data, normalize to no active filter rather than throwing
- If a unit has no successful PM yet, the `PM vs Repair` summary should explain that comparison is limited
- If a region has zero scoped data, the map should continue to render that region at `0%`

## Testing Strategy

Required test groups:

- filter normalization behavior
- due / overdue / completion calculations
- supplier and region aggregations
- branch and unit operational row generation
- unit `PM vs Repair` comparison summaries
- dashboard query-param driven rendering behavior

The goal is to make the analytics layer trustworthy before adding more report types later.

## Implementation Notes

- Preserve the current calm operations design language
- Keep the Thailand map in the dashboard rather than replacing it
- Prefer staged enhancement of existing dashboard and unit services over creating a separate reporting backend
- Keep the scope focused on current-year reporting with selectable month or cycle, while allowing year selection for controlled comparison
