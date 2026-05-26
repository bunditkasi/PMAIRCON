# Dashboard Report Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add filterable dashboard reporting for overdue and PM performance while extending the unit page with clearer PM vs repair comparison summaries.

**Architecture:** Extend the existing dashboard and unit analytics services instead of introducing a new reporting backend. Keep filter normalization and reporting calculations in service code, then wire the results into the current dashboard, region map, summary cards, and unit detail components.

**Tech Stack:** Next.js App Router, React server/client components, TypeScript, Vitest, existing Google Sheet-backed loaders, existing calm-operations UI components.

---

## File Structure

### Existing files to modify

- `src/lib/services/dashboard-service.ts`
  - Expand dashboard analytics into a richer report pack with filter-aware KPI, supplier, region, branch, and unit operational outputs.
- `src/lib/services/unit-service.ts`
  - Add PM vs repair comparison summary data for unit detail.
- `src/app/dashboard/page.tsx`
  - Read query filters, normalize them, call expanded dashboard analytics, and compose the new report sections.
- `src/features/dashboard/summary-cards.tsx`
  - Replace current cards with the richer overdue/due/completion/open-repair summary set.
- `src/features/dashboard/region-map.tsx`
  - Preserve the Thailand map while making it work with the richer filter scope and query-string model.
- `src/features/units/unit-detail.tsx`
  - Render the new PM vs repair summary block near the existing history tables.
- `tests/unit/dashboard-service.test.ts`
  - Expand analytics coverage.
- `tests/unit/unit-service.test.ts`
  - Add comparison summary coverage.
- `tests/unit/dashboard-page.test.tsx`
  - Cover query-driven rendering and report sections.
- `tests/unit/unit-detail-component.test.tsx`
  - Cover PM vs repair summary rendering.

### New files to create

- `src/lib/services/dashboard-filter.ts`
  - Normalize dashboard query params into a single reporting scope object.
- `src/features/dashboard/filter-bar.tsx`
  - Render dashboard filter controls and query-string links or form submission.
- `src/features/dashboard/performance-table.tsx`
  - Reusable reporting table for supplier and region performance.
- `src/features/dashboard/operational-table.tsx`
  - Reusable reporting table for branch and unit follow-up rows.
- `tests/unit/dashboard-filter.test.ts`
  - Focused normalization tests.

---

### Task 1: Add dashboard filter normalization

**Files:**
- Create: `src/lib/services/dashboard-filter.ts`
- Test: `tests/unit/dashboard-filter.test.ts`

- [ ] **Step 1: Write the failing filter normalization tests**

```ts
import { describe, expect, it } from "vitest";

import { normalizeDashboardFilters } from "../../src/lib/services/dashboard-filter";

describe("normalizeDashboardFilters", () => {
  it("defaults to the current year and derives the active cycle when month and cycle are missing", () => {
    const filters = normalizeDashboardFilters(
      {},
      { today: "2026-05-26" },
    );

    expect(filters.year).toBe(2026);
    expect(filters.month).toBeNull();
    expect(filters.cycle).toBe(1);
  });

  it("clears cycle when month is provided", () => {
    const filters = normalizeDashboardFilters(
      { year: "2026", month: "6", cycle: "2" },
      { today: "2026-05-26" },
    );

    expect(filters.year).toBe(2026);
    expect(filters.month).toBe(6);
    expect(filters.cycle).toBeNull();
  });

  it("keeps the selected cycle when month is missing", () => {
    const filters = normalizeDashboardFilters(
      { year: "2026", cycle: "3", region: "East", supplier: "SS Air Service" },
      { today: "2026-05-26" },
    );

    expect(filters.cycle).toBe(3);
    expect(filters.month).toBeNull();
    expect(filters.region).toBe("East");
    expect(filters.supplier).toBe("SS Air Service");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/unit/dashboard-filter.test.ts`

Expected: FAIL with module not found for `dashboard-filter`

- [ ] **Step 3: Write the minimal filter normalization implementation**

```ts
export interface DashboardFilters {
  year: number;
  month: number | null;
  cycle: number | null;
  region: string | null;
  supplier: string | null;
  senior: string | null;
  state: string | null;
}

export function normalizeDashboardFilters(
  raw: Record<string, string | undefined>,
  options: { today: string },
): DashboardFilters {
  const today = parseDateParts(options.today);
  const year = normalizeYear(raw.year, today.year);
  const month = normalizeMonth(raw.month);
  const cycle = month === null ? normalizeCycle(raw.cycle, today.month) : null;

  return {
    year,
    month,
    cycle,
    region: normalizeText(raw.region),
    supplier: normalizeText(raw.supplier),
    senior: normalizeText(raw.senior),
    state: normalizeText(raw.state),
  };
}

function normalizeYear(value: string | undefined, fallback: number) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 2000 ? year : fallback;
}

function normalizeMonth(value: string | undefined) {
  const month = Number(value);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
}

function normalizeCycle(value: string | undefined, fallbackMonth: number) {
  const cycle = Number(value);

  if (Number.isInteger(cycle) && cycle >= 1 && cycle <= 4) {
    return cycle;
  }

  return ((fallbackMonth - 1) % 4) + 1;
}

function normalizeText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseDateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- tests/unit/dashboard-filter.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/dashboard-filter.ts tests/unit/dashboard-filter.test.ts
git commit -m "feat: add dashboard filter normalization"
```

### Task 2: Expand dashboard analytics for report pack outputs

**Files:**
- Modify: `src/lib/services/dashboard-service.ts`
- Test: `tests/unit/dashboard-service.test.ts`

- [ ] **Step 1: Write failing analytics tests for overdue, supplier, and branch outputs**

```ts
import { describe, expect, it } from "vitest";

import { summarizeDashboard } from "../../src/lib/services/dashboard-service";

describe("summarizeDashboard", () => {
  it("builds overdue and due metrics for a selected month scope", () => {
    const summary = summarizeDashboard(
      {
        branches: [
          {
            branchCode: "B001",
            region: "East",
            state: "Chonburi",
            seniorName: "Know",
            supplierName: "SS Air Service",
            pmStartMonth: 1,
            outletName: "ABCD",
          },
        ],
        units: [
          { unitId: "B001-CT-01", branchCode: "B001" },
          { unitId: "B001-CT-02", branchCode: "B001" },
        ],
        pmLogs: [
          {
            unitId: "B001-CT-01",
            serviceDate: "2026-05-20",
            serviceStatus: "DONE",
          },
        ],
        repairLogs: [],
      },
      {
        today: "2026-05-26",
        filters: { year: 2026, month: 5, cycle: null, region: null, supplier: null, senior: null, state: null },
      },
    );

    expect(summary.overdueUnits).toBe(1);
    expect(summary.dueThisMonth).toBe(2);
    expect(summary.branchOperationalRows[0]?.overdueUnits).toBe(1);
  });

  it("builds supplier performance inside the active scope", () => {
    const summary = summarizeDashboard(/* fixture omitted for brevity */);

    expect(summary.supplierPerformance[0]).toMatchObject({
      supplier: "SS Air Service",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/unit/dashboard-service.test.ts`

Expected: FAIL because the new properties are missing from `summarizeDashboard`

- [ ] **Step 3: Expand dashboard analytics types and implementation**

```ts
export interface DashboardFilterScope {
  year: number;
  month: number | null;
  cycle: number | null;
  region: string | null;
  supplier: string | null;
  senior: string | null;
  state: string | null;
}

export interface SupplierPerformanceRow {
  supplier: string;
  unitsInScope: number;
  requiredPmJobs: number;
  completedPmJobs: number;
  completionPercent: number;
}

export interface BranchOperationalRow {
  branchCode: string;
  outletName: string;
  region: string;
  state: string;
  supplier: string;
  senior: string;
  totalUnits: number;
  dueUnits: number;
  completedUnits: number;
  overdueUnits: number;
}

export interface UnitOperationalRow {
  unitId: string;
  branchCode: string;
  outletName: string;
  region: string;
  supplier: string;
  latestPmDate: string | null;
  latestRepairDate: string | null;
  repairsAfterLatestPm: number;
  pmStatusSummary: string;
}

export interface DashboardReportSummary {
  overdueUnits: number;
  dueThisMonth: number;
  dueThisCycle: number;
  annualCompletionPercent: number;
  cycleCompletionPercent: number;
  openRepairs: number;
  supplierPerformance: SupplierPerformanceRow[];
  branchOperationalRows: BranchOperationalRow[];
  unitOperationalRows: UnitOperationalRow[];
}
```

Implement the analytics by:

- normalizing branch metadata into a scoped branch set
- calculating due units from selected `month` or `cycle`
- counting completed PM logs with `serviceStatus === "DONE"`
- building supplier, region, branch, and unit rows from the scoped units
- preserving the existing region summary array used by the map

- [ ] **Step 4: Run the analytics tests**

Run: `npm.cmd test -- tests/unit/dashboard-service.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/dashboard-service.ts tests/unit/dashboard-service.test.ts
git commit -m "feat: expand dashboard analytics report pack"
```

### Task 3: Add PM vs repair comparison summaries to unit service

**Files:**
- Modify: `src/lib/services/unit-service.ts`
- Test: `tests/unit/unit-service.test.ts`

- [ ] **Step 1: Write failing unit comparison tests**

```ts
import { describe, expect, it } from "vitest";

import { assembleUnitDetail } from "../../src/lib/services/unit-service";

describe("assembleUnitDetail", () => {
  it("counts repairs after the latest successful PM", () => {
    const detail = assembleUnitDetail(
      { unitId: "B001-CT-01", branchCode: "B001", pmStartMonth: 1 },
      [
        { unitId: "B001-CT-01", serviceDate: "2026-05-10", serviceStatus: "DONE" },
      ],
      [
        {
          unitId: "B001-CT-01",
          serviceDate: "2026-05-15",
          issueDetail: "Water leak",
          repairStatus: "DONE",
        },
      ],
    );

    expect(detail.pmRepairSummary.repairsAfterLatestPm).toBe(1);
    expect(detail.pmRepairSummary.message).toContain("Repairs after latest PM");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/unit/unit-service.test.ts`

Expected: FAIL because `pmRepairSummary` does not exist

- [ ] **Step 3: Add the comparison summary to the unit service**

```ts
export interface UnitPmRepairSummary {
  repairsAfterLatestPm: number;
  latestPmDate: string | null;
  latestRepairDate: string | null;
  message: string;
}

function buildPmRepairSummary(
  pmHistory: UnitPmRecord[],
  repairHistory: UnitRepairRecord[],
): UnitPmRepairSummary {
  const latestSuccessfulPm = pmHistory.find((item) => (item.serviceStatus ?? "DONE") === "DONE") ?? null;
  const latestRepair = repairHistory[0] ?? null;

  if (!latestSuccessfulPm) {
    return {
      repairsAfterLatestPm: 0,
      latestPmDate: null,
      latestRepairDate: latestRepair?.serviceDate ?? null,
      message: "No successful PM recorded yet. Repair history is shown without after-PM comparison.",
    };
  }

  const latestPmTimestamp = parseServiceDate(latestSuccessfulPm.serviceDate);
  const repairsAfterLatestPm = repairHistory.filter((item) => {
    const repairTimestamp = parseServiceDate(item.serviceDate);
    return latestPmTimestamp !== null && repairTimestamp !== null && repairTimestamp > latestPmTimestamp;
  }).length;

  return {
    repairsAfterLatestPm,
    latestPmDate: latestSuccessfulPm.serviceDate,
    latestRepairDate: latestRepair?.serviceDate ?? null,
    message:
      repairsAfterLatestPm > 0
        ? `Repairs after latest PM: ${repairsAfterLatestPm}`
        : "No repair recorded after latest PM",
  };
}
```

Return `pmRepairSummary` from `assembleUnitDetail`.

- [ ] **Step 4: Run the unit service tests**

Run: `npm.cmd test -- tests/unit/unit-service.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/unit-service.ts tests/unit/unit-service.test.ts
git commit -m "feat: add unit pm repair comparison summary"
```

### Task 4: Add dashboard filter bar and richer summary cards

**Files:**
- Create: `src/features/dashboard/filter-bar.tsx`
- Modify: `src/features/dashboard/summary-cards.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Test: `tests/unit/dashboard-page.test.tsx`

- [ ] **Step 1: Write failing dashboard page tests for filters and KPI cards**

```tsx
import { render, screen } from "@testing-library/react";

import DashboardPage from "../../src/app/dashboard/page";

it("renders filter controls and overdue KPI labels", async () => {
  const view = await DashboardPage({
    searchParams: Promise.resolve({ year: "2026", month: "5", region: "East" }),
  });

  render(view);

  expect(screen.getByLabelText("Year")).toBeInTheDocument();
  expect(screen.getByLabelText("Month")).toBeInTheDocument();
  expect(screen.getByText("Overdue units")).toBeInTheDocument();
  expect(screen.getByText("Due this month")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/unit/dashboard-page.test.tsx`

Expected: FAIL because the filter bar and KPI labels are not rendered

- [ ] **Step 3: Implement the filter bar and new summary cards**

```tsx
export function DashboardFilterBar({
  filters,
  years,
  regions,
  suppliers,
  seniors,
  states,
}: DashboardFilterBarProps) {
  return (
    <SectionCard eyebrow="Report filters" title="Filter reporting scope">
      <form action="/dashboard" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Year" htmlFor="year">
          <select id="year" name="year" defaultValue={String(filters.year)}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Month" htmlFor="month">
          <select id="month" name="month" defaultValue={filters.month ?? ""}>
            <option value="">All months</option>
          </select>
        </FormField>
        <FormField label="Cycle" htmlFor="cycle">
          <select id="cycle" name="cycle" defaultValue={filters.cycle ?? ""}>
            <option value="">Active cycle</option>
          </select>
        </FormField>
        <FormField label="Region" htmlFor="region">
          <select id="region" name="region" defaultValue={filters.region ?? ""}>
            <option value="">All regions</option>
          </select>
        </FormField>
      </form>
    </SectionCard>
  );
}
```

Update `SummaryCards` to render:

- `Overdue units`
- `Due this month`
- `Due this cycle`
- `Annual PM completion`
- `Cycle PM completion`
- `Open repairs`

Wire both components into `dashboard/page.tsx`.

- [ ] **Step 4: Run the dashboard page tests**

Run: `npm.cmd test -- tests/unit/dashboard-page.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/filter-bar.tsx src/features/dashboard/summary-cards.tsx src/app/dashboard/page.tsx tests/unit/dashboard-page.test.tsx
git commit -m "feat: add dashboard filters and overdue summary cards"
```

### Task 5: Add supplier, region, and operational report sections

**Files:**
- Create: `src/features/dashboard/performance-table.tsx`
- Create: `src/features/dashboard/operational-table.tsx`
- Modify: `src/features/dashboard/region-map.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Test: `tests/unit/dashboard-page.test.tsx`

- [ ] **Step 1: Write failing dashboard tests for report sections**

```tsx
it("renders supplier and branch reporting sections", async () => {
  const view = await DashboardPage({
    searchParams: Promise.resolve({ year: "2026", cycle: "1" }),
  });

  render(view);

  expect(screen.getByText("% PM success by supplier")).toBeInTheDocument();
  expect(screen.getByText("% PM success by region")).toBeInTheDocument();
  expect(screen.getByText("Branches needing PM attention")).toBeInTheDocument();
  expect(screen.getByText("Units needing PM attention")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/unit/dashboard-page.test.tsx`

Expected: FAIL because the new report sections do not exist

- [ ] **Step 3: Render performance and operational sections**

```tsx
<div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
  <RegionMap activeRegion={filters.region} regions={summary.regions} />
  <PerformanceTable
    eyebrow="Supplier performance"
    title="% PM success by supplier"
    columns={["Supplier", "Units", "Required PM", "Completed PM", "Completion %"]}
    rows={summary.supplierPerformance.map((row) => [
      row.supplier,
      String(row.unitsInScope),
      String(row.requiredPmJobs),
      String(row.completedPmJobs),
      `${row.completionPercent}%`,
    ])}
  />
</div>

<OperationalTable
  eyebrow="Operational follow-up"
  title="Branches needing PM attention"
  rows={summary.branchOperationalRows}
/>
```

Update `RegionMap` links so they preserve the current non-region query filters while toggling region.

- [ ] **Step 4: Run the dashboard tests**

Run: `npm.cmd test -- tests/unit/dashboard-page.test.tsx tests/unit/region-map-component.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/performance-table.tsx src/features/dashboard/operational-table.tsx src/features/dashboard/region-map.tsx src/app/dashboard/page.tsx tests/unit/dashboard-page.test.tsx
git commit -m "feat: add dashboard performance and operational report sections"
```

### Task 6: Add PM vs repair summary to the unit detail page

**Files:**
- Modify: `src/features/units/unit-detail.tsx`
- Test: `tests/unit/unit-detail-component.test.tsx`

- [ ] **Step 1: Write the failing unit detail component test**

```tsx
import { render, screen } from "@testing-library/react";

import { UnitDetail } from "../../src/features/units/unit-detail";

it("renders the PM vs repair summary message", () => {
  render(
    <UnitDetail
      detail={{
        unit: { unitId: "B001-CT-01", branchCode: "B001" },
        latestPm: null,
        latestRepair: null,
        pmHistory: [],
        repairHistory: [],
        pmTableRows: [],
        repairTableRows: [],
        hasPmHistoryTable: false,
        hasRepairHistoryTable: false,
        pmRepairSummary: {
          repairsAfterLatestPm: 1,
          latestPmDate: "2026-05-10",
          latestRepairDate: "2026-05-15",
          message: "Repairs after latest PM: 1",
        },
      }}
    />,
  );

  expect(screen.getByText("PM vs repair")).toBeInTheDocument();
  expect(screen.getByText("Repairs after latest PM: 1")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/unit/unit-detail-component.test.tsx`

Expected: FAIL because the new summary block is not rendered

- [ ] **Step 3: Add the PM vs repair summary block**

```tsx
<section className="mt-6 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-muted)]/60 p-4">
  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
    PM vs repair
  </h3>
  <p className="mt-3 text-base font-semibold text-[var(--text)]">
    {detail.pmRepairSummary.message}
  </p>
  <div className="mt-2 grid gap-2 text-sm text-[var(--text-muted)] md:grid-cols-2">
    <p>Latest PM: {detail.pmRepairSummary.latestPmDate ?? "No successful PM"}</p>
    <p>Latest repair: {detail.pmRepairSummary.latestRepairDate ?? "No repair logged"}</p>
  </div>
</section>
```

- [ ] **Step 4: Run the unit detail tests**

Run: `npm.cmd test -- tests/unit/unit-detail-component.test.tsx tests/unit/unit-service.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/units/unit-detail.tsx tests/unit/unit-detail-component.test.tsx src/lib/services/unit-service.ts tests/unit/unit-service.test.ts
git commit -m "feat: add pm vs repair summary to unit detail"
```

### Task 7: Run end-to-end verification for the report pack

**Files:**
- Modify: `tests/unit/dashboard-page.test.tsx`
- Modify: `tests/unit/dashboard-service.test.ts`
- Modify: `tests/unit/unit-service.test.ts`
- Modify: `tests/unit/unit-detail-component.test.tsx`

- [ ] **Step 1: Add final coverage for empty states and filter combinations**

```ts
it("shows zero-safe reporting when filters match no scope", () => {
  const summary = summarizeDashboard(/* fixture */, {
    today: "2026-05-26",
    filters: {
      year: 2026,
      month: null,
      cycle: 1,
      region: "Unknown",
      supplier: null,
      senior: null,
      state: null,
    },
  });

  expect(summary.totalBranches).toBe(0);
  expect(summary.overdueUnits).toBe(0);
  expect(summary.branchOperationalRows).toHaveLength(0);
});
```

- [ ] **Step 2: Run the focused report pack tests**

Run: `npm.cmd test -- tests/unit/dashboard-filter.test.ts tests/unit/dashboard-service.test.ts tests/unit/dashboard-page.test.tsx tests/unit/unit-service.test.ts tests/unit/unit-detail-component.test.tsx`

Expected: PASS

- [ ] **Step 3: Run lint, type-check, and production build**

Run: `npm.cmd run lint`
Expected: PASS

Run: `npx.cmd tsc --noEmit`
Expected: PASS

Run: `npm.cmd run build`
Expected: PASS

- [ ] **Step 4: Commit the final report pack integration**

```bash
git add src/lib/services/dashboard-filter.ts src/lib/services/dashboard-service.ts src/lib/services/unit-service.ts src/app/dashboard/page.tsx src/features/dashboard/filter-bar.tsx src/features/dashboard/performance-table.tsx src/features/dashboard/operational-table.tsx src/features/dashboard/summary-cards.tsx src/features/dashboard/region-map.tsx src/features/units/unit-detail.tsx tests/unit/dashboard-filter.test.ts tests/unit/dashboard-service.test.ts tests/unit/dashboard-page.test.tsx tests/unit/unit-service.test.ts tests/unit/unit-detail-component.test.tsx
git commit -m "feat: add dashboard report pack"
```

## Self-Review

- Spec coverage:
  - filters: Task 1 and Task 4
  - KPI definitions: Task 2 and Task 4
  - Thailand map retention: Task 5
  - supplier/region reporting: Task 2 and Task 5
  - branch/unit operational reporting: Task 2 and Task 5
  - PM vs repair unit summary: Task 3 and Task 6
- Placeholder scan:
  - no `TBD`, `TODO`, or deferred implementation notes remain in tasks
- Type consistency:
  - `DashboardFilters`, `supplierPerformance`, `branchOperationalRows`, `unitOperationalRows`, and `pmRepairSummary` are named consistently across the plan
