# Dashboard And Unit Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unit-level PM/repair history tables plus analytics-driven dashboard metrics and clickable region map based on the 3-times-per-year PM model.

**Architecture:** Extend the live sheet collection model first so branches and PM logs expose the metadata needed for analytics. Then add pure service-layer analytics for annual completion, active 4-month cycle completion, region summaries, and unit history table rows. Finally wire the dashboard and unit UI to those prepared view models without embedding business logic in components.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Vitest, Testing Library, Google Sheets live loader, existing calm operations UI primitives

---

## File Structure

- Modify: `src/lib/google/sheets-live.ts`
  - Expose `region`, `pmStartMonth`, and `serviceStatus` in live collections
- Modify: `src/lib/services/dashboard-service.ts`
  - Add annual PM completion, active cycle completion, region summaries, and filter helpers
- Modify: `src/lib/services/unit-service.ts`
  - Add cycle labels, 5-row capped table histories, and omission helpers
- Modify: `src/app/dashboard/page.tsx`
  - Compose new dashboard analytics view model and region filtering
- Modify: `src/app/units/[unitId]/page.tsx`
  - Pass richer unit detail into the redesigned unit history surface
- Modify: `src/features/dashboard/summary-cards.tsx`
  - Support percentage cards in addition to raw totals
- Create: `src/features/dashboard/region-map.tsx`
  - Clickable region heatmap with color interpolation and reset support
- Create: `src/features/dashboard/region-legend.tsx`
  - Simple readable legend for the approved color scale
- Modify: `src/features/units/unit-detail.tsx`
  - Render PM and repair history sections below current status cards
- Create: `src/features/units/history-table.tsx`
  - Shared light table component for PM/repair history
- Modify: `tests/unit/dashboard-service.test.ts`
  - Cover annual completion, active cycle completion, region rollups
- Modify: `tests/unit/unit-service.test.ts`
  - Cover capped histories, cycle labels, and omission conditions
- Modify: `tests/unit/unit-detail-component.test.tsx`
  - Cover PM/repair history rendering and omission
- Create: `tests/unit/region-map-component.test.tsx`
  - Cover clickable region rendering and reset
- Modify: `tests/unit/summary-cards.test.tsx`
  - Cover percentage presentation

## Task 1: Extend live sheet collections for analytics inputs

**Files:**
- Modify: `src/lib/google/sheets-live.ts`
- Test: `tests/unit/sheets-live.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { mapSheetRowsToCollections } from "../../src/lib/google/sheets-live";

describe("mapSheetRowsToCollections", () => {
  it("includes region, pmStartMonth, and PM service status in mapped collections", () => {
    const collections = mapSheetRowsToCollections({
      branches: [[
        "branch_code",
        "outlet_name",
        "supplier_name",
        "region",
        "pm_start_month",
      ], [
        "BC01",
        "SAPS",
        "Klangsub Engineer",
        "Central",
        "1",
      ]],
      units: [[
        "unit_id",
        "branch_code",
      ], [
        "BC01-CS-01",
        "BC01",
      ]],
      pmLogs: [[
        "unit_id",
        "service_date",
        "service_status",
      ], [
        "BC01-CS-01",
        "2026-05-21",
        "DONE",
      ]],
      repairLogs: [[
        "unit_id",
        "service_date",
        "issue_detail",
        "repair_status",
      ], [
        "BC01-CS-01",
        "2026-05-21",
        "water leak",
        "DONE",
      ]],
    });

    expect(collections.branches).toEqual([
      {
        branchCode: "BC01",
        outletName: "SAPS",
        supplierName: "Klangsub Engineer",
        region: "Central",
        pmStartMonth: 1,
      },
    ]);
    expect(collections.pmLogs).toEqual([
      {
        unitId: "BC01-CS-01",
        serviceDate: "2026-05-21",
        serviceStatus: "DONE",
      },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/sheets-live.test.ts`
Expected: FAIL because `branches` and `pmLogs` do not yet expose the new analytics fields

- [ ] **Step 3: Write minimal implementation**

```ts
export interface LiveSheetCollections {
  branches: Array<{
    branchCode: string;
    outletName: string;
    supplierName: string;
    region: string;
    pmStartMonth: number;
  }>;
  units: Array<{
    unitId: string;
    branchCode: string;
  }>;
  pmLogs: Array<{
    unitId: string;
    serviceDate: string;
    serviceStatus: string;
  }>;
  repairLogs: Array<{
    unitId: string;
    serviceDate: string;
    issueDetail: string;
    repairStatus: string;
  }>;
}

const branches = dedupeByKey(
  rowsToObjects(input.branches)
    .filter((row) => row.branch_code)
    .map((row) => ({
      branchCode: row.branch_code,
      outletName: row.outlet_name,
      supplierName: row.supplier_name,
      region: row.region,
      pmStartMonth: Number(row.pm_start_month || row.month || 0),
    })),
  (branch) => branch.branchCode,
);

pmLogs: rowsToObjects(input.pmLogs)
  .filter((row) => row.unit_id && row.service_date)
  .map((row) => ({
    unitId: row.unit_id,
    serviceDate: row.service_date,
    serviceStatus: row.service_status || "DONE",
  })),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/sheets-live.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/google/sheets-live.ts tests/unit/sheets-live.test.ts
git commit -m "feat: expose live sheet analytics fields"
```

## Task 2: Build dashboard analytics service for annual, active-cycle, and region summaries

**Files:**
- Modify: `src/lib/services/dashboard-service.ts`
- Modify: `tests/unit/dashboard-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { summarizeDashboard } from "../../src/lib/services/dashboard-service";

describe("summarizeDashboard analytics", () => {
  it("calculates annual completion, active cycle completion, and regional summaries", () => {
    const result = summarizeDashboard(
      {
        branches: [
          {
            branchCode: "BC01",
            region: "Central",
            pmStartMonth: 1,
          },
          {
            branchCode: "BE01",
            region: "North",
            pmStartMonth: 2,
          },
        ],
        units: [
          { unitId: "BC01-CS-01", branchCode: "BC01" },
          { unitId: "BC01-CS-02", branchCode: "BC01" },
          { unitId: "BE01-CS-01", branchCode: "BE01" },
        ],
        pmLogs: [
          { unitId: "BC01-CS-01", serviceDate: "2026-01-10", serviceStatus: "DONE" },
          { unitId: "BC01-CS-02", serviceDate: "2026-05-10", serviceStatus: "DONE" },
          { unitId: "BE01-CS-01", serviceDate: "2026-06-10", serviceStatus: "DONE" },
        ],
        repairLogs: [],
      },
      {
        today: "2026-05-21",
        year: 2026,
      },
    );

    expect(result.annualCompletionPercent).toBeCloseTo(33.33, 2);
    expect(result.currentCycleCompletionPercent).toBe(50);
    expect(result.regions).toEqual([
      expect.objectContaining({
        region: "Central",
        cycleCompletionPercent: 50,
      }),
      expect.objectContaining({
        region: "North",
        cycleCompletionPercent: 0,
      }),
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/dashboard-service.test.ts`
Expected: FAIL because the service only returns raw totals today

- [ ] **Step 3: Write minimal implementation**

```ts
export interface DashboardSummaryInput {
  branches: Array<{
    branchCode: string;
    region: string;
    pmStartMonth: number;
  }>;
  units: Array<{ unitId: string; branchCode: string }>;
  pmLogs: Array<{
    unitId: string;
    serviceDate: string;
    serviceStatus: string;
  }>;
  repairLogs: Array<{ unitId: string; repairStatus: string }>;
}

export interface DashboardSummary {
  totalBranches: number;
  totalUnits: number;
  pmLoggedUnits: number;
  openRepairs: number;
  annualCompletionPercent: number;
  currentCycleCompletionPercent: number;
  activeCycleMonth: number;
  activeRegion: string | null;
  regions: Array<{
    region: string;
    unitCount: number;
    annualCompletionPercent: number;
    cycleCompletionPercent: number;
  }>;
}

function normalizeCycleMonth(month: number) {
  return ((month - 1) % 4) + 1;
}

function roundPercent(value: number) {
  return Number(value.toFixed(2));
}

export function summarizeDashboard(
  input: DashboardSummaryInput,
  options: {
    today: string;
    year: number;
    activeRegion?: string | null;
  },
): DashboardSummary {
  const today = new Date(`${options.today}T00:00:00.000Z`);
  const activeCycleMonth = normalizeCycleMonth(today.getUTCMonth() + 1);
  const unitsByBranch = new Map(
    input.units.map((unit) => [unit.unitId, unit.branchCode]),
  );
  const targetJobsForYear = input.units.length * 3;
  const completedJobsForYear = input.pmLogs.filter((log) => {
    return (
      log.serviceStatus === "DONE" &&
      new Date(`${log.serviceDate}T00:00:00.000Z`).getUTCFullYear() === options.year
    );
  }).length;

  const branchesInScope = options.activeRegion
    ? input.branches.filter((branch) => branch.region === options.activeRegion)
    : input.branches;
  const branchCodeSet = new Set(branchesInScope.map((branch) => branch.branchCode));
  const cycleUnits = input.units.filter((unit) => {
    const branch = input.branches.find((item) => item.branchCode === unit.branchCode);
    return branch && normalizeCycleMonth(branch.pmStartMonth) === activeCycleMonth;
  });
  const cycleUnitsInScope = cycleUnits.filter((unit) => branchCodeSet.has(unit.branchCode));
  const completedCycleJobs = input.pmLogs.filter((log) => {
    const branchCode = unitsByBranch.get(log.unitId);
    const branch = input.branches.find((item) => item.branchCode === branchCode);
    if (!branch || !branchCodeSet.has(branch.branchCode) || log.serviceStatus !== "DONE") {
      return false;
    }
    const serviceDate = new Date(`${log.serviceDate}T00:00:00.000Z`);
    return (
      serviceDate.getUTCFullYear() === options.year &&
      normalizeCycleMonth(serviceDate.getUTCMonth() + 1) === activeCycleMonth &&
      normalizeCycleMonth(branch.pmStartMonth) === activeCycleMonth
    );
  }).length;

  return {
    totalBranches: branchesInScope.length,
    totalUnits: input.units.filter((unit) => branchCodeSet.has(unit.branchCode)).length,
    pmLoggedUnits: new Set(input.pmLogs.map((item) => item.unitId)).size,
    openRepairs: new Set(
      input.repairLogs
        .filter((item) => item.repairStatus !== "DONE")
        .map((item) => item.unitId),
    ).size,
    annualCompletionPercent: roundPercent(
      targetJobsForYear === 0 ? 0 : (completedJobsForYear / targetJobsForYear) * 100,
    ),
    currentCycleCompletionPercent: roundPercent(
      cycleUnitsInScope.length === 0 ? 0 : (completedCycleJobs / cycleUnitsInScope.length) * 100,
    ),
    activeCycleMonth,
    activeRegion: options.activeRegion ?? null,
    regions: buildRegionSummaries(input, options.year, activeCycleMonth),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/dashboard-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/dashboard-service.ts tests/unit/dashboard-service.test.ts
git commit -m "feat: add dashboard analytics summaries"
```

## Task 3: Extend unit service with capped history rows and PM cycle labels

**Files:**
- Modify: `src/lib/services/unit-service.ts`
- Modify: `tests/unit/unit-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { assembleUnitDetail } from "../../src/lib/services/unit-service";

describe("assembleUnitDetail history tables", () => {
  it("caps PM and repair tables to the latest 5 rows and adds cycle labels", () => {
    const detail = assembleUnitDetail(
      { unitId: "BC01-CT-01", branchCode: "BC01", pmStartMonth: 1 },
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-09-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-05-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-01-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2025-09-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2025-05-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2025-01-01", serviceStatus: "DONE" },
      ],
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-04-20", issueDetail: "fan noise", repairStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-03-01", issueDetail: "water leak", repairStatus: "IN_PROGRESS" },
      ],
    );

    expect(detail.pmTableRows).toHaveLength(5);
    expect(detail.pmTableRows[0]).toEqual({
      serviceDate: "2026-09-01",
      serviceStatus: "DONE",
      cycleLabel: "2026 รอบ 3",
    });
    expect(detail.repairTableRows).toEqual([
      {
        serviceDate: "2026-04-20",
        issueDetail: "fan noise",
        repairStatus: "DONE",
      },
      {
        serviceDate: "2026-03-01",
        issueDetail: "water leak",
        repairStatus: "IN_PROGRESS",
      },
    ]);
    expect(detail.hasPmHistoryTable).toBe(true);
    expect(detail.hasRepairHistoryTable).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/unit-service.test.ts`
Expected: FAIL because the detail model does not expose table rows or omission flags yet

- [ ] **Step 3: Write minimal implementation**

```ts
export interface UnitRecord {
  unitId: string;
  branchCode: string;
  pmStartMonth?: number;
}

export interface UnitPmRecord {
  unitId: string;
  serviceDate: string;
  serviceStatus?: string;
}

export interface UnitRepairRecord {
  unitId: string;
  serviceDate: string;
  issueDetail: string;
  repairStatus?: string;
}

function buildPmCycleLabel(serviceDate: string, pmStartMonth = 1) {
  const [yearText, monthText] = serviceDate.split("-");
  const month = Number(monthText);
  const offset = ((month - pmStartMonth + 12) % 12) / 4;
  const cycleNumber = Number.isFinite(offset) ? Math.floor(offset) + 1 : 1;
  return `${yearText} รอบ ${cycleNumber}`;
}

export interface UnitDetail {
  unit: UnitRecord;
  latestPm: UnitPmRecord | null;
  latestRepair: UnitRepairRecord | null;
  pmHistory: UnitPmRecord[];
  repairHistory: UnitRepairRecord[];
  pmTableRows: Array<{
    serviceDate: string;
    serviceStatus: string;
    cycleLabel: string;
  }>;
  repairTableRows: Array<{
    serviceDate: string;
    issueDetail: string;
    repairStatus: string;
  }>;
  hasPmHistoryTable: boolean;
  hasRepairHistoryTable: boolean;
}

const pmTableRows = pmHistory.slice(0, 5).map((item) => ({
  serviceDate: item.serviceDate,
  serviceStatus: item.serviceStatus ?? "DONE",
  cycleLabel: buildPmCycleLabel(item.serviceDate, unit.pmStartMonth ?? 1),
}));

const repairTableRows = repairHistory.slice(0, 5).map((item) => ({
  serviceDate: item.serviceDate,
  issueDetail: item.issueDetail,
  repairStatus: item.repairStatus ?? "PENDING",
}));

return {
  unit: { ...unit },
  latestPm: pmHistory[0] ?? null,
  latestRepair: repairHistory[0] ?? null,
  pmHistory,
  repairHistory,
  pmTableRows,
  repairTableRows,
  hasPmHistoryTable: pmTableRows.length > 0,
  hasRepairHistoryTable: repairTableRows.length > 0,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/unit-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/unit-service.ts tests/unit/unit-service.test.ts
git commit -m "feat: add unit history analytics rows"
```

## Task 4: Build dashboard region map and richer summary cards

**Files:**
- Create: `src/features/dashboard/region-map.tsx`
- Create: `src/features/dashboard/region-legend.tsx`
- Modify: `src/features/dashboard/summary-cards.tsx`
- Modify: `src/features/ui/metric-card.tsx`
- Create: `tests/unit/region-map-component.test.tsx`
- Modify: `tests/unit/summary-cards.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegionMap } from "../../src/features/dashboard/region-map";

describe("RegionMap", () => {
  it("renders clickable regions and highlights the active filter", () => {
    render(
      <RegionMap
        activeRegion="Central"
        regions={[
          {
            region: "Central",
            cycleCompletionPercent: 70,
            annualCompletionPercent: 55,
            unitCount: 100,
          },
          {
            region: "North",
            cycleCompletionPercent: 30,
            annualCompletionPercent: 40,
            unitCount: 80,
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: /central/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset region filter/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/region-map-component.test.tsx tests/unit/summary-cards.test.tsx`
Expected: FAIL because the map and percentage card formatting do not exist

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/ui/metric-card.tsx
interface MetricCardProps {
  label: string;
  value: number | string;
  accent?: "default" | "success";
}

export function MetricCard({ label, value, accent = "default" }: MetricCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${accent === "success" ? "text-emerald-700" : "text-[var(--text)]"}`}>
        {value}
      </p>
    </article>
  );
}
```

```tsx
// src/features/dashboard/summary-cards.tsx
const cardItems = [
  { label: "Total branches", value: summary.totalBranches },
  { label: "Total units", value: summary.totalUnits },
  { label: "PM annual completion", value: `${summary.annualCompletionPercent}%`, accent: "success" as const },
  { label: "PM current cycle", value: `${summary.currentCycleCompletionPercent}%`, accent: "success" as const },
];
```

```tsx
// src/features/dashboard/region-map.tsx
function colorForPercent(percent: number) {
  if (percent <= 0) return "#d73027";
  if (percent <= 30) return "#f49ac2";
  if (percent <= 50) return "#f3d34a";
  if (percent <= 70) return "#6cb8ff";
  if (percent <= 80) return "#9ad88c";
  return "#2a7f3f";
}

export function RegionMap({
  regions,
  activeRegion,
}: {
  regions: Array<{
    region: string;
    cycleCompletionPercent: number;
    annualCompletionPercent: number;
    unitCount: number;
  }>;
  activeRegion: string | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {regions.map((region) => (
            <button
              key={region.region}
              className="rounded-[1.25rem] border border-[var(--border)] p-4 text-left"
              data-active={activeRegion === region.region}
              style={{ backgroundColor: colorForPercent(region.cycleCompletionPercent) }}
              type="button"
            >
              <span className="block text-sm font-semibold text-slate-950">{region.region}</span>
              <span className="mt-2 block text-xs text-slate-800">
                {region.cycleCompletionPercent}% cycle
              </span>
            </button>
          ))}
        </div>
      </div>
      <button className="rounded-[1.25rem] border border-[var(--border)] px-4 py-3 text-sm" type="button">
        Reset region filter
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/region-map-component.test.tsx tests/unit/summary-cards.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/region-map.tsx src/features/dashboard/region-legend.tsx src/features/dashboard/summary-cards.tsx src/features/ui/metric-card.tsx tests/unit/region-map-component.test.tsx tests/unit/summary-cards.test.tsx
git commit -m "feat: add dashboard region map surface"
```

## Task 5: Wire dashboard page and unit detail page to the new analytics view models

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/units/[unitId]/page.tsx`
- Modify: `src/features/units/unit-detail.tsx`
- Create: `src/features/units/history-table.tsx`
- Modify: `tests/unit/unit-detail-component.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UnitDetail } from "../../src/features/units/unit-detail";

describe("UnitDetail history layout", () => {
  it("renders PM and repair tables when history exists", () => {
    render(
      <UnitDetail
        detail={{
          unit: { unitId: "BC01-CS-01", branchCode: "BC01", pmStartMonth: 1 },
          latestPm: { unitId: "BC01-CS-01", serviceDate: "2026-05-21", serviceStatus: "DONE" },
          latestRepair: {
            unitId: "BC01-CS-01",
            serviceDate: "2026-05-19",
            issueDetail: "Water leak",
            repairStatus: "DONE",
          },
          pmHistory: [],
          repairHistory: [],
          pmTableRows: [
            { serviceDate: "2026-05-21", serviceStatus: "DONE", cycleLabel: "2026 รอบ 2" },
          ],
          repairTableRows: [
            { serviceDate: "2026-05-19", issueDetail: "Water leak", repairStatus: "DONE" },
          ],
          hasPmHistoryTable: true,
          hasRepairHistoryTable: true,
        }}
      />,
    );

    expect(screen.getByText("PM history")).toBeInTheDocument();
    expect(screen.getByText("Repair history")).toBeInTheDocument();
    expect(screen.getByText("2026 รอบ 2")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/unit-detail-component.test.tsx`
Expected: FAIL because the page only shows current status cards today

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/units/history-table.tsx
export function HistoryTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
      <div className="mt-4 overflow-hidden rounded-[1rem] border border-[var(--border)]">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`} className="border-t border-[var(--border)]">
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${rowIndex}-${cellIndex}`} className="px-4 py-3 text-[var(--text)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

```tsx
// src/features/units/unit-detail.tsx
{detail.hasPmHistoryTable || detail.hasRepairHistoryTable ? (
  <div className="mt-6 grid gap-4 xl:grid-cols-2">
    {detail.hasPmHistoryTable ? (
      <HistoryTable
        title="PM history"
        columns={["Service date", "Status", "Cycle"]}
        rows={detail.pmTableRows.map((row) => [
          row.serviceDate,
          row.serviceStatus,
          row.cycleLabel,
        ])}
      />
    ) : null}
    {detail.hasRepairHistoryTable ? (
      <HistoryTable
        title="Repair history"
        columns={["Service date", "Issue", "Status"]}
        rows={detail.repairTableRows.map((row) => [
          row.serviceDate,
          row.issueDetail,
          row.repairStatus,
        ])}
      />
    ) : null}
  </div>
) : null}
```

```tsx
// src/app/dashboard/page.tsx
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
const summary = summarizeDashboard(collections, {
  today,
  year: new Date(today).getUTCFullYear(),
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/unit-detail-component.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/units/[unitId]/page.tsx src/features/units/unit-detail.tsx src/features/units/history-table.tsx tests/unit/unit-detail-component.test.tsx
git commit -m "feat: add unit history tables and dashboard analytics wiring"
```

## Task 6: Add dashboard region filter state and final verification

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/features/dashboard/region-map.tsx`
- Modify: `src/features/dashboard/summary-cards.tsx`
- Modify: `tests/unit/region-map-component.test.tsx`
- Modify: `tests/unit/summary-cards.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPage from "../../src/app/dashboard/page";

describe("Dashboard page analytics", () => {
  it("shows active region filter copy when a region is selected", async () => {
    const page = await DashboardPage({
      searchParams: Promise.resolve({ region: "Central" }),
    } as never);

    render(page);

    expect(screen.getByText("Showing branches in Central")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/region-map-component.test.tsx tests/unit/summary-cards.test.tsx`
Expected: FAIL because the dashboard page does not yet honor region query state

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/app/dashboard/page.tsx
interface DashboardPageProps {
  searchParams?: Promise<{ region?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : {};
  const activeRegion = params.region?.trim() || null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
  const summary = summarizeDashboard(
    {
      branches: collections.branches,
      units: collections.units,
      pmLogs: collections.pmLogs,
      repairLogs: collections.repairLogs,
    },
    {
      today,
      year: new Date(today).getUTCFullYear(),
      activeRegion,
    },
  );

  const branchDirectory = collections.branches
    .filter((branch) => !activeRegion || branch.region === activeRegion)
    .sort((left, right) => left.branchCode.localeCompare(right.branchCode));

  return (
    <AppShell ...>
      <SummaryCards summary={summary} />
      <RegionMap activeRegion={activeRegion} regions={summary.regions} />
      {activeRegion ? (
        <p className="text-sm text-[var(--text-muted)]">Showing branches in {activeRegion}</p>
      ) : null}
    </AppShell>
  );
}
```

```tsx
// src/features/dashboard/region-map.tsx
<Link
  href={activeRegion === region.region ? "/dashboard" : `/dashboard?region=${encodeURIComponent(region.region)}`}
>
  ...
</Link>
```

- [ ] **Step 4: Run full verification**

Run:

```bash
npm test -- tests/unit/sheets-live.test.ts tests/unit/dashboard-service.test.ts tests/unit/unit-service.test.ts tests/unit/summary-cards.test.tsx tests/unit/region-map-component.test.tsx tests/unit/unit-detail-component.test.tsx
npx tsc --noEmit
npm run lint
npm run build
```

Expected:

- PASS for the listed test files
- PASS for `tsc`
- PASS for lint
- PASS for build

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/features/dashboard/region-map.tsx src/features/dashboard/summary-cards.tsx tests/unit/region-map-component.test.tsx tests/unit/summary-cards.test.tsx
git commit -m "feat: add dashboard region filtering and completion metrics"
```

## Plan Self-Review

### Spec coverage

- Unit page PM history table: covered by Tasks 3 and 5
- Unit page repair history table: covered by Tasks 3 and 5
- Hide missing history sections: covered by Task 3 and Task 5
- Annual PM completion percentage: covered by Task 2 and Task 6
- Current cycle PM completion percentage: covered by Task 2 and Task 6
- Region map with approved progress colors: covered by Task 4
- Clickable region filter: covered by Task 6
- Region-based branch list filtering: covered by Task 6
- Analytics-first architecture: covered by Tasks 1, 2, and 3

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation markers remain
- Each task names exact files, commands, and test intent
- Code steps include concrete snippets rather than abstract directions

### Type consistency

- `pmStartMonth` is used consistently across live collections, dashboard analytics, and unit cycle labeling
- `serviceStatus` stays attached to PM logs
- `repairStatus` stays attached to repair logs
- `activeRegion` is the consistent filter key from service to page to map
