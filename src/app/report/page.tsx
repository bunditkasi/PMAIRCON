import React from "react";

import { ReportView } from "../../features/dashboard/report-view";
import { AppShell } from "../../features/ui/app-shell";
import { loadAppDataCollections } from "../../lib/services/app-data";
import { normalizeDashboardFilters } from "../../lib/services/dashboard-filter";
import { summarizeDashboard } from "../../lib/services/dashboard-service";

interface ReportPageProps {
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

export default async function ReportPage({ searchParams }: ReportPageProps) {
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
      eyebrow="Central reporting"
      title="Aircon PM reports"
      description="Filter, compare, and follow up on PM performance without crowding the daily dashboard."
      heroAside={
        <section className="dashboard-meta-card" aria-label="Report metadata">
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
      <ReportView
        filters={filters}
        regions={collectUniqueValues(collections.branches.map((branch) => branch.region))}
        seniors={collectUniqueValues(collections.branches.map((branch) => branch.seniorName ?? ""))}
        states={collectUniqueValues(collections.branches.map((branch) => branch.state))}
        suppliers={collectUniqueValues(collections.branches.map((branch) => branch.supplierName))}
        summary={summary}
        years={collectReportYears(collections.pmLogs, filters.year)}
      />
    </AppShell>
  );
}

function collectUniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right),
  );
}

function collectReportYears(
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
