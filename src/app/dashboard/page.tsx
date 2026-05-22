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
  const collections = await loadAppDataCollections();
  const activeRegion = resolveActiveRegion(collections.branches, params?.region);
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
  const unitTypeCountsByBranch = summarizeUnitTypesByBranch(collections.units);

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
              details={unitTypeCountsByBranch.get(branch.branchCode) ?? []}
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

function resolveActiveRegion(
  branches: Array<{ region: string }>,
  requestedRegion?: string,
) {
  const normalizedRequestedRegion = requestedRegion?.trim().toLowerCase();

  if (!normalizedRequestedRegion) {
    return null;
  }

  const matchedBranch = branches.find(
    (branch) => branch.region.trim().toLowerCase() === normalizedRequestedRegion,
  );

  return matchedBranch?.region ?? null;
}

function summarizeUnitTypesByBranch(
  units: Array<{ unitId: string; branchCode: string }>,
) {
  const countsByBranch = new Map<string, Map<string, number>>();

  for (const unit of units) {
    const unitType = extractUnitType(unit.unitId, unit.branchCode);

    if (!unitType) {
      continue;
    }

    const branchCounts = countsByBranch.get(unit.branchCode) ?? new Map<string, number>();
    branchCounts.set(unitType, (branchCounts.get(unitType) ?? 0) + 1);
    countsByBranch.set(unit.branchCode, branchCounts);
  }

  return new Map(
    [...countsByBranch.entries()].map(([branchCode, branchCounts]) => [
      branchCode,
      [...branchCounts.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([label, value]) => ({ label, value })),
    ]),
  );
}

function extractUnitType(unitId: string, branchCode: string) {
  const prefix = `${branchCode}-`;

  if (!unitId.startsWith(prefix)) {
    return null;
  }

  const segments = unitId.slice(prefix.length).split("-");
  const unitType = segments[0]?.trim().toUpperCase();

  if (!unitType || !/^[A-Z]{2,4}$/.test(unitType)) {
    return null;
  }

  return unitType;
}
