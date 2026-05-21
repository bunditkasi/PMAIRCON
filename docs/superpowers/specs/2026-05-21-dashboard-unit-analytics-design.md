# Dashboard And Unit Analytics Design

## Goal

Add a richer unit history surface and a more operational dashboard for the PMAIRCON web app.

This design adds:

- Unit page history tables for the latest 5 PM records
- Unit page history tables for the latest 5 repair records
- Annual PM completion percentage
- Current PM cycle completion percentage
- Interactive Thailand region map on the dashboard
- Region-based filtering from the map into the branch directory

The implementation should preserve the current Google Sheet-backed architecture and keep analytics logic isolated in service code so the reporting model can grow later without rewriting the UI.

## Confirmed Business Rules

- PM target is `3 times per year` for each unit
- PM cycle pattern is based on `Month`
- The PM pattern is a `4-month spacing` model, not a standard 3-month quarter model
- Examples:
  - `Month = 1` means `1, 5, 9`
  - `Month = 2` means `2, 6, 10`
  - `Month = 3` means `3, 7, 11`
  - `Month = 4` means `4, 8, 12`
- Dashboard percentages should use `count of completed jobs` against `count of required jobs`
- This means the completion model is based on total PM jobs, not averaging per-unit percentages
- Region map should be clickable and filter the dashboard

## Approach

Chosen approach: `Analytics First`

We will introduce a dedicated analytics layer before expanding the UI. The dashboard and unit page will both consume derived reporting data from this layer.

Why this approach:

- PM completion logic has non-trivial business rules
- The same logic will power top metrics, regional map colors, and filtered branch lists
- It reduces the risk of inconsistent numbers appearing in different screens
- It creates a good foundation for later reporting such as supplier, senior, and yearly trend analysis

## Unit Page Design

### Existing section

Keep the current upper section:

- Latest PM card
- Latest repair card
- Record replacement action

### New lower history section

Below the status cards, add a two-column history area:

- Left side: `PM history`
- Right side: `Repair history`

Each side should render only when it has data.

If a side has no data, it should be omitted completely rather than showing an empty table.

### PM history table

Show the latest 5 PM records sorted from newest to oldest.

Columns:

- Service date
- Service status
- Cycle label

Cycle label should be derived from the date and displayed in a readable form such as:

- `2026 รอบ 1`
- `2026 รอบ 2`
- `2026 รอบ 3`

The exact cycle number should follow the unit’s PM pattern rather than the calendar quarter.

### Repair history table

Show the latest 5 repair records sorted from newest to oldest.

Columns:

- Service date
- Issue detail
- Repair status

`issueDetail` is the primary visible field for the repair event because it best reflects the real symptom seen by the central team.

### Responsive behavior

- Desktop: two columns side by side
- Tablet/mobile: stacked vertically
- Tables should remain visually light and readable, consistent with the existing calm operations theme

## Dashboard Design

### Top metrics

The summary area should include:

- Total branches
- Total units
- Annual PM completion percentage
- Current cycle PM completion percentage

These should either replace or sit alongside the current summary cards depending on available space, but the PM percentages are required.

### Regional map

Add a Thailand region map section that uses branch `Region` values to show PM completion by region.

The map should:

- Use region-level grouping, not province-level grouping
- Be clickable
- Filter the branch directory below
- Visually communicate operational progress through fill color

### Color scale

Map colors should interpolate along this progression:

- `0%` = red
- `30%` = pink
- `50%` = yellow
- `70%` = blue
- `80%` = light green
- `100%` = dark green

Interpolation should be smooth rather than hard-stepped.

### Branch directory filtering

Below the map, the branch directory should respond to the selected region.

Behavior:

- Default: all branches
- On region click: show only branches in that region
- Show the active region filter visibly
- Provide a clear reset action

## Analytics Model

## Annual completion

Annual PM completion is calculated as:

- target jobs for year = `total units x 3`
- completed jobs for year = count of `PM_Logs` where:
  - `service_status = DONE`
  - `service_date` is inside the selected year

Formula:

- `annual completion % = completed jobs for year / target jobs for year`

## Current cycle completion

Current cycle completion is based on the active 4-month PM pattern, not on standard calendar quarters.

For each branch or unit, `Month` defines one of four PM patterns:

- `1 => 1, 5, 9`
- `2 => 2, 6, 10`
- `3 => 3, 7, 11`
- `4 => 4, 8, 12`

For the current month, the analytics layer should determine which PM pattern is active and then count only the jobs that belong to that pattern.

Formula:

- `current cycle completion % = completed jobs in active cycle / required jobs in active cycle`

Required jobs in active cycle means all units assigned to that pattern.

Completed jobs in active cycle means PM logs with:

- `service_status = DONE`
- matching active cycle month set
- same reporting year

## Regional completion

Regional analytics should aggregate from:

- `branch_code -> region`
- branch `Month`
- unit membership under each branch
- PM logs connected to those units

For each region, calculate:

- annual completion percentage
- current cycle completion percentage

The map should use `current cycle completion percentage` as its primary color driver because it best reflects live operations.

## Unit history

Unit history logic should:

- sort PM logs newest first
- sort repair logs newest first
- limit each side to 5 records

This logic should remain in service code so the component only receives prepared rows.

## Empty state rules

- No PM history: do not show PM history table
- No repair history: do not show repair history table
- No region data: treat as `0%`

## Data Dependencies

This feature should reuse current Google Sheet data and not require a new storage backend.

Required source data:

- `Branches`
  - `branch_code`
  - `region`
  - `pm_start_month` or equivalent normalized `Month`
- `Units`
  - `unit_id`
  - `branch_code`
- `PM_Logs`
  - `unit_id`
  - `service_date`
  - `service_status`
- `Repair_Logs`
  - `unit_id`
  - `service_date`
  - `issue_detail`
  - `repair_status`

If the live sheet loader does not currently expose region or PM month into dashboard-level collections, it should be extended.

## Architecture Changes

Add a new analytics-oriented service layer rather than embedding calculations in page components.

Expected shape:

- extend dashboard service with PM completion and regional summary logic
- extend unit service with prepared history row slices and cycle labels
- add a dedicated dashboard map component
- add dedicated unit history table components or small reusable table primitives

The page components should remain thin and mostly responsible for composition.

## Testing Strategy

### Dashboard service tests

Add tests for:

- annual completion percentage
- current cycle completion percentage
- region grouping
- region filtering behavior inputs
- color band interpolation selection

### Unit service tests

Add tests for:

- PM history limited to 5
- repair history limited to 5
- newest-first ordering
- empty history omission conditions
- cycle label generation

### Component tests

Add tests for:

- unit history tables rendering only when data exists
- replacement action still visible
- dashboard map section rendering
- region filter badge/reset behavior

### Browser verification

After implementation, verify:

- unit page layout on desktop and mobile
- dashboard metrics readability
- map click interaction
- filtered branch list behavior
- color progression legibility

## Out Of Scope For This Slice

The following remain outside this design:

- province-level map breakdown
- Google Drive image upload enhancements
- printable QR asset generation
- supplier ranking analytics
- yearly trend charts
- multi-year dashboard filters unless needed for implementation stability

## Acceptance Criteria

- Unit page shows latest 5 PM records when PM history exists
- Unit page shows latest 5 repair records when repair history exists
- Missing history sections are omitted cleanly
- Dashboard shows annual PM completion percentage
- Dashboard shows current cycle PM completion percentage
- Dashboard shows clickable Thailand region map
- Clicking a region filters the branch directory
- Region colors reflect completion using the approved color progression
- Percentages follow the confirmed `3 times per year` and `4-month cycle` business rules
