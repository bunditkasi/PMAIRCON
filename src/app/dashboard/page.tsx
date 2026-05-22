import React from "react";
import { RegionMap } from "../../features/dashboard/region-map";
import { SummaryCards } from "../../features/dashboard/summary-cards";
import { AppShell } from "../../features/ui/app-shell";
import { RecordLinkRow } from "../../features/ui/record-link-row";
import { SectionCard } from "../../features/ui/section-card";
import { loadAppDataCollections } from "../../lib/services/app-data";
import { summarizeDashboard } from "../../lib/services/dashboard-service";

interface DashboardPageProps {
  searchParams?: Promise<{
    region?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const activeRegion = params?.region?.trim() || null;
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
  const summary = summarizeDashboard(
    {
      branches: collections.branches,
      units: collections.units,
      pmLogs: collections.pmLogs,
      repairLogs: collections.repairLogs.map((log) => ({
        unitId: log.unitId,
        repairStatus: log.repairStatus ?? "IN_PROGRESS",
      })),
    },
    {
      today,
      year,
      activeRegion,
    },
  );
  const branchDirectory = collections.branches
    .filter((branch) => !activeRegion || branch.region === activeRegion)
    .sort((left, right) => left.branchCode.localeCompare(right.branchCode));

  return (
    <AppShell
      backHref="/"
      backLabel="Back to home"
      eyebrow="Central dashboard"
      title="Aircon PM monitoring"
      description="Monitor branches, units, and current maintenance activity from one calm command center."
    >
      <SummaryCards summary={summary} />
      <RegionMap
        activeRegion={activeRegion}
        regions={summary.regions}
      />

      {activeRegion ? (
        <p className="text-sm text-[var(--text-muted)]">
          Showing branches in {activeRegion}
        </p>
      ) : null}

      <SectionCard
        aside={`${branchDirectory.length} branches`}
        eyebrow="Branch directory"
        title="Open a branch"
      >
        <div className="grid max-h-[32rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
          {branchDirectory.map((branch) => (
            <RecordLinkRow
              key={branch.branchCode}
              href={`/branches/${branch.branchCode}`}
              meta={`Supplier: ${branch.supplierName || "Not assigned"}`}
              subtitle={branch.outletName}
              title={branch.branchCode}
            />
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
