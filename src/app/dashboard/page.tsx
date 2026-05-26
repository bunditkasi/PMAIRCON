import Link from "next/link";
import React from "react";

import { DashboardFilterBar } from "../../features/dashboard/filter-bar";
import { OperationalTable } from "../../features/dashboard/operational-table";
import { PerformanceTable } from "../../features/dashboard/performance-table";
import { RegionMap } from "../../features/dashboard/region-map";
import { SummaryCards } from "../../features/dashboard/summary-cards";
import { AppShell } from "../../features/ui/app-shell";
import { loadAppDataCollections } from "../../lib/services/app-data";
import {
  summarizeDashboard,
  type BranchOperationalRow,
  type UnitOperationalRow,
} from "../../lib/services/dashboard-service";
import { normalizeDashboardFilters } from "../../lib/services/dashboard-filter";

interface DashboardPageProps {
  searchParams?: Promise<{
    year?: string;
    month?: string;
    cycle?: string;
    region?: string;
    supplier?: string;
    senior?: string;
    state?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const collections = await loadAppDataCollections();
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = Number(
    todayParts.find((part) => part.type === "year")?.value ?? "0",
  );
  const month = todayParts.find((part) => part.type === "month")?.value ?? "01";
  const day = todayParts.find((part) => part.type === "day")?.value ?? "01";
  const today = `${year.toString().padStart(4, "0")}-${month}-${day}`;
  const lastUpdatedAt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const filters = normalizeDashboardFilters(params ?? {}, { today });
  const summary = summarizeDashboard(
    {
      branches: collections.branches,
      units: collections.units,
      pmLogs: collections.pmLogs,
      repairLogs: collections.repairLogs,
    },
    {
      today,
      filters,
    },
  );

  return (
    <AppShell
      backHref="/"
      backLabel="Back to home"
      eyebrow="Central dashboard"
      title="Aircon PM monitoring"
      description="Monitor branches, units, and current maintenance activity from one calm command center."
      heroAside={
        <section className="dashboard-meta-card" aria-label="Dashboard metadata">
          <div className="dashboard-meta-card__row">
            <p className="dashboard-meta-card__label">Last update</p>
            <p className="dashboard-meta-card__value">{lastUpdatedAt}</p>
          </div>
          <div className="dashboard-meta-card__row">
            <p className="dashboard-meta-card__label">Prepared by</p>
            <p className="dashboard-meta-card__value">
              MR.D.I.Y Maintenance team
            </p>
          </div>
        </section>
      }
    >
      <DashboardFilterBar
        filters={filters}
        years={collectDashboardYears(collections.pmLogs, filters.year)}
        regions={collectUniqueValues(collections.branches.map((branch) => branch.region))}
        suppliers={collectUniqueValues(collections.branches.map((branch) => branch.supplierName))}
        seniors={collectUniqueValues(collections.branches.map((branch) => branch.seniorName ?? ""))}
        states={collectUniqueValues(collections.branches.map((branch) => branch.state))}
      />

      <SummaryCards summary={summary} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <RegionMap
          activeRegion={summary.activeRegion}
          filterQuery={{
            year: String(filters.year),
            month: filters.month != null ? String(filters.month) : null,
            cycle: filters.month == null && filters.cycle != null ? String(filters.cycle) : null,
            supplier: filters.supplier,
            senior: filters.senior,
            state: filters.state,
            region: filters.region,
          }}
          regions={summary.regions}
        />

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

      <div className="grid gap-4 xl:grid-cols-2">
        <PerformanceTable
          eyebrow="Regional performance"
          title="% PM success by region"
          columns={["Region", "Units", "Required PM", "Completed PM", "Completion %"]}
          rows={summary.regionPerformance.map((row) => [
            row.region,
            String(row.unitsInScope),
            String(row.requiredPmJobs),
            String(row.completedPmJobs),
            `${row.completionPercent}%`,
          ])}
        />

        <PerformanceTable
          eyebrow="Comparison"
          title="Region vs supplier"
          columns={["Region", "Supplier", "Units", "Required PM", "Completion %"]}
          rows={summary.regionSupplierComparison.map((row) => [
            row.region,
            row.supplier,
            String(row.unitsInScope),
            String(row.requiredPmJobs),
            `${row.completionPercent}%`,
          ])}
        />
      </div>

      <OperationalTable
        eyebrow="Operational follow-up"
        title="Branches needing PM attention"
        columns={["Branch", "Region", "Supplier", "Senior", "Due", "Completed", "Overdue", "Action"]}
        rows={summary.branchOperationalRows.map((row) => [
          renderBranchCell(row),
          row.region,
          row.supplier,
          row.senior,
          String(row.dueUnits),
          String(row.completedUnits),
          String(row.overdueUnits),
          <Link
            key={`${row.branchCode}-link`}
            className="font-semibold text-[var(--accent)] hover:underline"
            href={`/branches/${row.branchCode}`}
          >
            Open branch
          </Link>,
        ])}
      />

      <OperationalTable
        eyebrow="Unit follow-up"
        title="Units needing PM attention"
        columns={["Unit", "Region", "Supplier", "Latest PM", "Latest repair", "Repairs after PM", "Action"]}
        rows={summary.unitOperationalRows.map((row) => [
          renderUnitCell(row),
          row.region,
          row.supplier,
          row.latestPmDate ?? "No PM logged",
          row.latestRepairDate ?? "No repair logged",
          String(row.repairsAfterLatestPm),
          <Link
            key={`${row.unitId}-link`}
            className="font-semibold text-[var(--accent)] hover:underline"
            href={`/units/${row.unitId}`}
          >
            Open unit
          </Link>,
        ])}
      />
    </AppShell>
  );
}

function collectUniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right),
  );
}

function collectDashboardYears(
  pmLogs: Array<{ serviceDate: string }>,
  fallbackYear: number,
) {
  const years = new Set<number>([fallbackYear]);

  for (const log of pmLogs) {
    const match = /^(\d{4})-\d{2}-\d{2}$/.exec(log.serviceDate);

    if (!match) {
      continue;
    }

    years.add(Number(match[1]));
  }

  return [...years].sort((left, right) => right - left);
}

function renderBranchCell(row: BranchOperationalRow) {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-[var(--text)]">{row.branchCode}</p>
      <p className="text-xs text-[var(--text-muted)]">{row.outletName}</p>
      {row.state ? (
        <p className="text-xs text-[var(--text-muted)]">{row.state}</p>
      ) : null}
    </div>
  );
}

function renderUnitCell(row: UnitOperationalRow) {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-[var(--text)]">{row.unitId}</p>
      <p className="text-xs text-[var(--text-muted)]">{row.branchCode}</p>
      <p className="text-xs text-[var(--text-muted)]">{row.outletName}</p>
    </div>
  );
}
