import Link from "next/link";
import React from "react";

import type { DashboardFilters } from "../../lib/services/dashboard-filter";
import type {
  BranchOperationalRow,
  DashboardAnalyticsSummary,
  DashboardSummary,
  UnitOperationalRow,
} from "../../lib/services/dashboard-service";
import { DashboardFilterBar } from "./filter-bar";
import { OperationalTable } from "./operational-table";
import { PerformanceTable } from "./performance-table";
import { RegionMap } from "./region-map";
import { ReportSummaryCards } from "./report-summary-cards";

type ReportSummary = DashboardSummary & DashboardAnalyticsSummary;

interface ReportViewProps {
  filters: DashboardFilters;
  summary: ReportSummary;
  years: number[];
  regions: string[];
  suppliers: string[];
  seniors: string[];
  states: string[];
  showOperational: boolean;
}

export function ReportView({
  filters,
  summary,
  years,
  regions,
  suppliers,
  seniors,
  states,
  showOperational,
}: ReportViewProps) {
  const operationalHref = buildOperationalHref(filters, !showOperational);

  return (
    <>
      <DashboardFilterBar
        actionHref="/report"
        filters={filters}
        regions={regions}
        resetHref="/report"
        seniors={seniors}
        states={states}
        suppliers={suppliers}
        years={years}
      />

      <ReportSummaryCards summary={summary} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <RegionMap
          activeRegion={summary.activeRegion}
          basePath="/report"
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

      <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Operational follow-up
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">
              Branches needing PM attention
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Generate the detailed follow-up tables only when you need them.
            </p>
          </div>
          <Link
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            href={operationalHref}
          >
            {showOperational ? "Hide operational tables" : "Show operational tables"}
          </Link>
        </div>

        {showOperational ? (
          <div className="mt-5 space-y-4">
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
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Detailed branch and unit follow-up tables are hidden until requested.
          </p>
        )}
      </section>
    </>
  );
}

function buildOperationalHref(filters: DashboardFilters, shouldShowOperational: boolean) {
  const params = new URLSearchParams();

  params.set("year", String(filters.year));

  if (filters.month != null) {
    params.set("month", String(filters.month));
  } else if (filters.cycle != null) {
    params.set("cycle", String(filters.cycle));
  }

  if (filters.region) {
    params.set("region", filters.region);
  }

  if (filters.supplier) {
    params.set("supplier", filters.supplier);
  }

  if (filters.senior) {
    params.set("senior", filters.senior);
  }

  if (filters.state) {
    params.set("state", filters.state);
  }

  if (shouldShowOperational) {
    params.set("showOperational", "1");
  }

  return `/report?${params.toString()}`;
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
