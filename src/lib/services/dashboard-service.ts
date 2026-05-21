export interface DashboardSummaryInput {
  branches: Array<{
    branchCode: string;
    region: string;
    pmStartMonth: number | null;
  }>;
  units: Array<{ unitId: string; branchCode: string }>;
  pmLogs: Array<{
    unitId: string;
    serviceDate: string;
    serviceStatus: string;
  }>;
  repairLogs: Array<{ unitId: string; repairStatus: string }>;
}

export interface RegionDashboardSummary {
  region: string;
  totalBranches: number;
  totalUnits: number;
  requiredCycleJobs: number;
  completedCycleJobs: number;
  cycleCompletionPercent: number;
}

export interface DashboardSummary {
  totalBranches: number;
  totalUnits: number;
  pmLoggedUnits: number;
  openRepairs: number;
}

export interface DashboardAnalyticsSummary {
  annualCompletionPercent: number;
  currentCycleCompletionPercent: number;
  activeCycleMonth: number;
  activeRegion: string | null;
  regions: RegionDashboardSummary[];
}

interface DashboardSummaryOptions {
  today?: string;
  year?: number;
}

export function summarizeDashboard(
  input: DashboardSummaryInput,
  options: DashboardSummaryOptions = {},
): DashboardSummary & DashboardAnalyticsSummary {
  const todayParts = parseDateParts(options.today);
  const selectedYear = options.year ?? todayParts.year;
  const activeCalendarMonth = todayParts.month;
  const activeCycleMonth = normalizeCycleMonth(todayParts.month);
  const branchesByCode = new Map(
    input.branches.map((branch) => [branch.branchCode, branch] as const),
  );
  const donePmLogs = input.pmLogs.filter((log) => log.serviceStatus === "DONE");

  const activeCycleUnits = input.units.filter((unit) => {
    const branch = branchesByCode.get(unit.branchCode);

    return (
      branch?.pmStartMonth != null &&
      normalizeCycleMonth(branch.pmStartMonth) === activeCycleMonth
    );
  });
  const activeCycleUnitIds = new Set(activeCycleUnits.map((unit) => unit.unitId));
  const completedActiveCycleUnitIds = new Set(
    donePmLogs
      .filter((log) => {
        const serviceDate = parseDateParts(log.serviceDate);

        return (
          serviceDate.year === selectedYear &&
          serviceDate.month === activeCalendarMonth &&
          activeCycleUnitIds.has(log.unitId)
        );
      })
      .map((log) => log.unitId),
  );
  const annualCompletionPercent = roundPercent(
    donePmLogs.filter((log) => parseDateParts(log.serviceDate).year === selectedYear)
      .length,
    input.units.length * 3,
  );
  const currentCycleCompletionPercent = roundPercent(
    completedActiveCycleUnitIds.size,
    activeCycleUnits.length,
  );
  const regions = summarizeRegions({
    branches: input.branches,
    units: input.units,
    activeCycleMonth,
    completedActiveCycleUnitIds,
  });

  return {
    totalBranches: input.branches.length,
    totalUnits: input.units.length,
    pmLoggedUnits: new Set(input.pmLogs.map((item) => item.unitId)).size,
    openRepairs: new Set(
      input.repairLogs
        .filter((item) => item.repairStatus !== "DONE")
        .map((item) => item.unitId),
    ).size,
    annualCompletionPercent,
    currentCycleCompletionPercent,
    activeCycleMonth,
    activeRegion:
      regions.find((region) => region.requiredCycleJobs > 0)?.region ?? null,
    regions,
  };
}

function summarizeRegions(input: {
  branches: DashboardSummaryInput["branches"];
  units: DashboardSummaryInput["units"];
  activeCycleMonth: number;
  completedActiveCycleUnitIds: Set<string>;
}): RegionDashboardSummary[] {
  const unitsByBranchCode = new Map<string, DashboardSummaryInput["units"]>();

  for (const unit of input.units) {
    const units = unitsByBranchCode.get(unit.branchCode);

    if (units) {
      units.push(unit);
      continue;
    }

    unitsByBranchCode.set(unit.branchCode, [unit]);
  }

  const regions = new Map<string, RegionDashboardSummary>();

  for (const branch of input.branches) {
    const regionName = branch.region || "Unassigned";
    const summary = regions.get(regionName) ?? {
      region: regionName,
      totalBranches: 0,
      totalUnits: 0,
      requiredCycleJobs: 0,
      completedCycleJobs: 0,
      cycleCompletionPercent: 0,
    };
    const branchUnits = unitsByBranchCode.get(branch.branchCode) ?? [];
    const isActiveCycleBranch =
      branch.pmStartMonth != null &&
      normalizeCycleMonth(branch.pmStartMonth) === input.activeCycleMonth;

    summary.totalBranches += 1;
    summary.totalUnits += branchUnits.length;
    summary.requiredCycleJobs += isActiveCycleBranch ? branchUnits.length : 0;
    summary.completedCycleJobs += isActiveCycleBranch
      ? branchUnits.filter((unit) => input.completedActiveCycleUnitIds.has(unit.unitId))
          .length
      : 0;
    summary.cycleCompletionPercent = roundPercent(
      summary.completedCycleJobs,
      summary.requiredCycleJobs,
    );

    regions.set(regionName, summary);
  }

  return [...regions.values()].sort((left, right) =>
    left.region.localeCompare(right.region),
  );
}

function normalizeCycleMonth(month: number): number {
  return ((month - 1) % 4) + 1;
}

function parseDateParts(value?: string): { year: number; month: number } {
  if (!value) {
    return parseDateParts(new Date().toISOString().slice(0, 10));
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}

function roundPercent(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 10000) / 100;
}
