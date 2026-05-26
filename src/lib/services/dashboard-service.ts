import type { DashboardFilters } from "./dashboard-filter";

export interface DashboardSummaryInput {
  branches: Array<{
    branchCode: string;
    outletName?: string;
    region: string;
    state?: string;
    seniorName?: string;
    supplierName?: string;
    pmStartMonth: number | null;
  }>;
  units: Array<{ unitId: string; branchCode: string }>;
  pmLogs: Array<{
    unitId: string;
    serviceDate: string;
    serviceStatus: string;
  }>;
  repairLogs: Array<{
    unitId: string;
    repairStatus: string;
    serviceDate?: string;
    issueDetail?: string;
  }>;
}

export interface RegionDashboardSummary {
  region: string;
  totalBranches: number;
  totalUnits: number;
  requiredCycleJobs: number;
  completedCycleJobs: number;
  annualCompletionPercent: number;
  currentCycleCompletionPercent: number;
  cycleCompletionPercent: number;
}

export interface SupplierPerformanceRow {
  supplier: string;
  unitsInScope: number;
  requiredPmJobs: number;
  completedPmJobs: number;
  completionPercent: number;
}

export interface RegionPerformanceRow {
  region: string;
  unitsInScope: number;
  requiredPmJobs: number;
  completedPmJobs: number;
  completionPercent: number;
}

export interface RegionSupplierComparisonRow {
  region: string;
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

export interface DashboardSummary {
  totalBranches: number;
  totalUnits: number;
  pmLoggedUnits: number;
  openRepairs: number;
  overdueUnits: number;
  dueThisMonth: number;
  dueThisCycle: number;
}

export interface DashboardAnalyticsSummary {
  annualCompletionPercent: number;
  currentCycleCompletionPercent: number;
  cycleCompletionPercent: number;
  activeCycleMonth: number;
  activeRegion: string | null;
  regions: RegionDashboardSummary[];
  supplierPerformance: SupplierPerformanceRow[];
  regionPerformance: RegionPerformanceRow[];
  regionSupplierComparison: RegionSupplierComparisonRow[];
  branchOperationalRows: BranchOperationalRow[];
  unitOperationalRows: UnitOperationalRow[];
}

interface DashboardSummaryOptions {
  today?: string;
  year?: number;
  activeRegion?: string | null;
  filters?: DashboardFilters;
  includeOperationalRows?: boolean;
}

export function summarizeDashboard(
  input: DashboardSummaryInput,
  options: DashboardSummaryOptions = {},
): DashboardSummary & DashboardAnalyticsSummary {
  const todayParts = parseDateParts(options.today);
  const filters = options.filters ?? {
    year: options.year ?? todayParts.year,
    month: null,
    cycle: normalizeCycleMonth(todayParts.month),
    region: options.activeRegion ?? null,
    supplier: null,
    senior: null,
    state: null,
  };
  const selectedYear = filters.year;
  const selectedMonth = filters.month;
  const activeCycleMonth =
    filters.cycle ?? normalizeCycleMonth(selectedMonth ?? todayParts.month);
  const activeRegion = filters.region ?? null;
  const branchesByCode = new Map(
    input.branches.map((branch) => [branch.branchCode, branch] as const),
  );
  const unitsById = new Map(input.units.map((unit) => [unit.unitId, unit] as const));
  const scopedBranches = input.branches.filter((branch) =>
    matchesBranchFilters(branch, filters),
  );
  const scopedBranchCodes = new Set(scopedBranches.map((branch) => branch.branchCode));
  const scopedUnits = input.units.filter((unit) => scopedBranchCodes.has(unit.branchCode));
  const scopedUnitIds = new Set(scopedUnits.map((unit) => unit.unitId));
  const scopedRepairLogs = input.repairLogs.filter((log) => scopedUnitIds.has(log.unitId));
  const scopedPmLogs = input.pmLogs.filter((log) => scopedUnitIds.has(log.unitId));
  const donePmLogs = input.pmLogs.filter((log) => log.serviceStatus === "DONE");
  const scopedDonePmLogs = scopedPmLogs.filter((log) => log.serviceStatus === "DONE");
  const dueThisMonthUnits = scopedUnits.filter((unit) => {
    const branch = branchesByCode.get(unit.branchCode);

    return (
      branch?.pmStartMonth != null &&
      branchIncludesMonth(branch.pmStartMonth, selectedMonth ?? todayParts.month)
    );
  });
  const dueThisCycleUnits = scopedUnits.filter((unit) => {
    const branch = branchesByCode.get(unit.branchCode);

    return (
      branch?.pmStartMonth != null &&
      normalizeCycleMonth(branch.pmStartMonth) === activeCycleMonth
    );
  });
  const activePeriodDueUnits = selectedMonth == null ? dueThisCycleUnits : dueThisMonthUnits;
  const activePeriodDueUnitIds = new Set(activePeriodDueUnits.map((unit) => unit.unitId));
  const completedActivePeriodLogs = donePmLogs.filter((log) => {
    const serviceDate = parseDateParts(log.serviceDate);

    return (
      serviceDate.year === selectedYear &&
      matchesActivePeriod(serviceDate.month, selectedMonth, activeCycleMonth) &&
      activePeriodDueUnitIds.has(log.unitId)
    );
  });
  const completedActivePeriodUnitIds = new Set(
    completedActivePeriodLogs.map((log) => log.unitId),
  );
  const annualCompletionPercent = roundPercent(
    scopedDonePmLogs.filter(
      (log) => parseDateParts(log.serviceDate).year === selectedYear,
    ).length,
    scopedUnits.length * 3,
  );
  const currentCycleCompletionPercent = roundPercent(
    completedActivePeriodLogs.length,
    activePeriodDueUnits.length,
  );
  const overdueUnits = activePeriodDueUnits.filter(
    (unit) => !completedActivePeriodUnitIds.has(unit.unitId),
  ).length;
  const includeOperationalRows = options.includeOperationalRows ?? true;

  return {
    totalBranches: scopedBranches.length,
    totalUnits: scopedUnits.length,
    pmLoggedUnits: new Set(scopedPmLogs.map((item) => item.unitId)).size,
    openRepairs: new Set(
      scopedRepairLogs
        .filter((item) => item.repairStatus !== "DONE")
        .map((item) => item.unitId),
    ).size,
    overdueUnits,
    dueThisMonth: dueThisMonthUnits.length,
    dueThisCycle: dueThisCycleUnits.length,
    annualCompletionPercent,
    currentCycleCompletionPercent,
    cycleCompletionPercent: currentCycleCompletionPercent,
    activeCycleMonth,
    activeRegion,
    regions: summarizeRegions({
      branches: input.branches,
      units: input.units,
      donePmLogs,
      unitsById,
      branchesByCode,
      selectedYear,
      selectedMonth,
      activeCycleMonth,
      completedActivePeriodLogs,
      filters,
    }),
    supplierPerformance: summarizeSupplierPerformance({
      branchesByCode,
      scopedBranches,
      scopedUnits,
      selectedYear,
      selectedMonth,
      activeCycleMonth,
      donePmLogs,
    }),
    regionPerformance: summarizeRegionPerformance({
      branchesByCode,
      scopedBranches,
      scopedUnits,
      selectedYear,
      selectedMonth,
      activeCycleMonth,
      donePmLogs,
    }),
    regionSupplierComparison: summarizeRegionSupplierComparison({
      branchesByCode,
      scopedBranches,
      scopedUnits,
      selectedYear,
      selectedMonth,
      activeCycleMonth,
      donePmLogs,
    }),
    branchOperationalRows: includeOperationalRows
      ? summarizeBranchOperationalRows({
          scopedBranches,
          scopedUnits,
          selectedYear,
          selectedMonth,
          activeCycleMonth,
          donePmLogs,
        })
      : [],
    unitOperationalRows: includeOperationalRows
      ? summarizeUnitOperationalRows({
          branchesByCode,
          scopedUnits,
          pmLogs: scopedPmLogs,
          repairLogs: scopedRepairLogs,
        })
      : [],
  };
}

function summarizeRegions(input: {
  branches: DashboardSummaryInput["branches"];
  units: DashboardSummaryInput["units"];
  donePmLogs: DashboardSummaryInput["pmLogs"];
  unitsById: Map<string, DashboardSummaryInput["units"][number]>;
  branchesByCode: Map<string, DashboardSummaryInput["branches"][number]>;
  selectedYear: number;
  selectedMonth: number | null;
  activeCycleMonth: number;
  completedActivePeriodLogs: DashboardSummaryInput["pmLogs"];
  filters: DashboardFilters;
}): RegionDashboardSummary[] {
  const unitsByBranchCode = new Map<string, DashboardSummaryInput["units"]>();

  for (const unit of input.units) {
    const existingUnits = unitsByBranchCode.get(unit.branchCode);

    if (existingUnits) {
      existingUnits.push(unit);
      continue;
    }

    unitsByBranchCode.set(unit.branchCode, [unit]);
  }

  const annualCompletedJobsByRegion = new Map<string, number>();
  const activePeriodCompletedJobsByRegion = new Map<string, number>();

  for (const log of input.donePmLogs) {
    const serviceDate = parseDateParts(log.serviceDate);
    const unit = input.unitsById.get(log.unitId);

    if (!unit) {
      continue;
    }

    const branch = input.branchesByCode.get(unit.branchCode);

    if (!branch || !matchesBranchFilters(branch, input.filters)) {
      continue;
    }

    const regionName = branch.region || "Unassigned";

    if (serviceDate.year === input.selectedYear) {
      annualCompletedJobsByRegion.set(
        regionName,
        (annualCompletedJobsByRegion.get(regionName) ?? 0) + 1,
      );
    }
  }

  for (const log of input.completedActivePeriodLogs) {
    const unit = input.unitsById.get(log.unitId);

    if (!unit) {
      continue;
    }

    const branch = input.branchesByCode.get(unit.branchCode);

    if (!branch || !matchesBranchFilters(branch, input.filters)) {
      continue;
    }

    const regionName = branch.region || "Unassigned";
    activePeriodCompletedJobsByRegion.set(
      regionName,
      (activePeriodCompletedJobsByRegion.get(regionName) ?? 0) + 1,
    );
  }

  const regions = new Map<string, RegionDashboardSummary>();

  for (const branch of input.branches) {
    if (!matchesBranchFilters(branch, input.filters)) {
      continue;
    }

    const regionName = branch.region || "Unassigned";
    const branchUnits = unitsByBranchCode.get(branch.branchCode) ?? [];
    const requiredPeriodJobs = branchUnits.filter(() =>
      branch.pmStartMonth != null &&
      (input.selectedMonth == null
        ? normalizeCycleMonth(branch.pmStartMonth) === input.activeCycleMonth
        : branchIncludesMonth(branch.pmStartMonth, input.selectedMonth)),
    ).length;
    const summary = regions.get(regionName) ?? {
      region: regionName,
      totalBranches: 0,
      totalUnits: 0,
      requiredCycleJobs: 0,
      completedCycleJobs: 0,
      annualCompletionPercent: 0,
      currentCycleCompletionPercent: 0,
      cycleCompletionPercent: 0,
    };

    summary.totalBranches += 1;
    summary.totalUnits += branchUnits.length;
    summary.requiredCycleJobs += requiredPeriodJobs;
    regions.set(regionName, summary);
  }

  for (const summary of regions.values()) {
    summary.completedCycleJobs =
      activePeriodCompletedJobsByRegion.get(summary.region) ?? 0;
    summary.annualCompletionPercent = roundPercent(
      annualCompletedJobsByRegion.get(summary.region) ?? 0,
      summary.totalUnits * 3,
    );
    summary.currentCycleCompletionPercent = roundPercent(
      summary.completedCycleJobs,
      summary.requiredCycleJobs,
    );
    summary.cycleCompletionPercent = summary.currentCycleCompletionPercent;
  }

  return [...regions.values()].sort((left, right) =>
    left.region.localeCompare(right.region),
  );
}

function summarizeSupplierPerformance(input: {
  branchesByCode: Map<string, DashboardSummaryInput["branches"][number]>;
  scopedBranches: DashboardSummaryInput["branches"];
  scopedUnits: DashboardSummaryInput["units"];
  selectedYear: number;
  selectedMonth: number | null;
  activeCycleMonth: number;
  donePmLogs: DashboardSummaryInput["pmLogs"];
}): SupplierPerformanceRow[] {
  const rows = new Map<string, SupplierPerformanceRow>();
  const scopedBranchCodes = new Set(input.scopedBranches.map((branch) => branch.branchCode));
  const branchUnitMap = buildBranchUnitMap(input.scopedUnits);

  for (const branch of input.scopedBranches) {
    const supplier = branch.supplierName || "Not assigned";
    const branchUnits = branchUnitMap.get(branch.branchCode) ?? [];
    const row = rows.get(supplier) ?? {
      supplier,
      unitsInScope: 0,
      requiredPmJobs: 0,
      completedPmJobs: 0,
      completionPercent: 0,
    };

    row.unitsInScope += branchUnits.length;
    row.requiredPmJobs += branchUnits.filter(() =>
      branch.pmStartMonth != null &&
      (input.selectedMonth == null
        ? normalizeCycleMonth(branch.pmStartMonth) === input.activeCycleMonth
        : branchIncludesMonth(branch.pmStartMonth, input.selectedMonth)),
    ).length;
    rows.set(supplier, row);
  }

  for (const log of input.donePmLogs) {
    const unit = input.scopedUnits.find((item) => item.unitId === log.unitId);

    if (!unit || !scopedBranchCodes.has(unit.branchCode)) {
      continue;
    }

    const branch = input.branchesByCode.get(unit.branchCode);

    if (!branch) {
      continue;
    }

    const serviceDate = parseDateParts(log.serviceDate);

    if (
      serviceDate.year !== input.selectedYear ||
      !matchesActivePeriod(
        serviceDate.month,
        input.selectedMonth,
        input.activeCycleMonth,
      )
    ) {
      continue;
    }

    const supplier = branch.supplierName || "Not assigned";
    const row = rows.get(supplier);

    if (!row) {
      continue;
    }

    row.completedPmJobs += 1;
  }

  return [...rows.values()]
    .map((row) => ({
      ...row,
      completionPercent: roundPercent(row.completedPmJobs, row.requiredPmJobs),
    }))
    .sort((left, right) => left.supplier.localeCompare(right.supplier));
}

function summarizeRegionPerformance(input: {
  branchesByCode: Map<string, DashboardSummaryInput["branches"][number]>;
  scopedBranches: DashboardSummaryInput["branches"];
  scopedUnits: DashboardSummaryInput["units"];
  selectedYear: number;
  selectedMonth: number | null;
  activeCycleMonth: number;
  donePmLogs: DashboardSummaryInput["pmLogs"];
}): RegionPerformanceRow[] {
  const rows = new Map<string, RegionPerformanceRow>();
  const scopedBranchCodes = new Set(input.scopedBranches.map((branch) => branch.branchCode));
  const branchUnitMap = buildBranchUnitMap(input.scopedUnits);

  for (const branch of input.scopedBranches) {
    const region = branch.region || "Unassigned";
    const branchUnits = branchUnitMap.get(branch.branchCode) ?? [];
    const row = rows.get(region) ?? {
      region,
      unitsInScope: 0,
      requiredPmJobs: 0,
      completedPmJobs: 0,
      completionPercent: 0,
    };

    row.unitsInScope += branchUnits.length;
    row.requiredPmJobs += branchUnits.filter(() =>
      branch.pmStartMonth != null &&
      (input.selectedMonth == null
        ? normalizeCycleMonth(branch.pmStartMonth) === input.activeCycleMonth
        : branchIncludesMonth(branch.pmStartMonth, input.selectedMonth)),
    ).length;
    rows.set(region, row);
  }

  for (const log of input.donePmLogs) {
    const unit = input.scopedUnits.find((item) => item.unitId === log.unitId);

    if (!unit || !scopedBranchCodes.has(unit.branchCode)) {
      continue;
    }

    const branch = input.branchesByCode.get(unit.branchCode);

    if (!branch) {
      continue;
    }

    const serviceDate = parseDateParts(log.serviceDate);

    if (
      serviceDate.year !== input.selectedYear ||
      !matchesActivePeriod(
        serviceDate.month,
        input.selectedMonth,
        input.activeCycleMonth,
      )
    ) {
      continue;
    }

    const region = branch.region || "Unassigned";
    const row = rows.get(region);

    if (!row) {
      continue;
    }

    row.completedPmJobs += 1;
  }

  return [...rows.values()]
    .map((row) => ({
      ...row,
      completionPercent: roundPercent(row.completedPmJobs, row.requiredPmJobs),
    }))
    .sort((left, right) => left.region.localeCompare(right.region));
}

function summarizeRegionSupplierComparison(input: {
  branchesByCode: Map<string, DashboardSummaryInput["branches"][number]>;
  scopedBranches: DashboardSummaryInput["branches"];
  scopedUnits: DashboardSummaryInput["units"];
  selectedYear: number;
  selectedMonth: number | null;
  activeCycleMonth: number;
  donePmLogs: DashboardSummaryInput["pmLogs"];
}): RegionSupplierComparisonRow[] {
  const rows = new Map<string, RegionSupplierComparisonRow>();
  const scopedBranchCodes = new Set(input.scopedBranches.map((branch) => branch.branchCode));
  const branchUnitMap = buildBranchUnitMap(input.scopedUnits);

  for (const branch of input.scopedBranches) {
    const region = branch.region || "Unassigned";
    const supplier = branch.supplierName || "Not assigned";
    const key = `${region}::${supplier}`;
    const branchUnits = branchUnitMap.get(branch.branchCode) ?? [];
    const row = rows.get(key) ?? {
      region,
      supplier,
      unitsInScope: 0,
      requiredPmJobs: 0,
      completedPmJobs: 0,
      completionPercent: 0,
    };

    row.unitsInScope += branchUnits.length;
    row.requiredPmJobs += branchUnits.filter(() =>
      branch.pmStartMonth != null &&
      (input.selectedMonth == null
        ? normalizeCycleMonth(branch.pmStartMonth) === input.activeCycleMonth
        : branchIncludesMonth(branch.pmStartMonth, input.selectedMonth)),
    ).length;
    rows.set(key, row);
  }

  for (const log of input.donePmLogs) {
    const unit = input.scopedUnits.find((item) => item.unitId === log.unitId);

    if (!unit || !scopedBranchCodes.has(unit.branchCode)) {
      continue;
    }

    const branch = input.branchesByCode.get(unit.branchCode);

    if (!branch) {
      continue;
    }

    const serviceDate = parseDateParts(log.serviceDate);

    if (
      serviceDate.year !== input.selectedYear ||
      !matchesActivePeriod(
        serviceDate.month,
        input.selectedMonth,
        input.activeCycleMonth,
      )
    ) {
      continue;
    }

    const region = branch.region || "Unassigned";
    const supplier = branch.supplierName || "Not assigned";
    const row = rows.get(`${region}::${supplier}`);

    if (!row) {
      continue;
    }

    row.completedPmJobs += 1;
  }

  return [...rows.values()]
    .map((row) => ({
      ...row,
      completionPercent: roundPercent(row.completedPmJobs, row.requiredPmJobs),
    }))
    .sort((left, right) =>
      left.region === right.region
        ? left.supplier.localeCompare(right.supplier)
        : left.region.localeCompare(right.region),
    );
}

function summarizeBranchOperationalRows(input: {
  scopedBranches: DashboardSummaryInput["branches"];
  scopedUnits: DashboardSummaryInput["units"];
  selectedYear: number;
  selectedMonth: number | null;
  activeCycleMonth: number;
  donePmLogs: DashboardSummaryInput["pmLogs"];
}): BranchOperationalRow[] {
  const branchUnitMap = buildBranchUnitMap(input.scopedUnits);
  const completedUnitIds = new Set(
    input.donePmLogs
      .filter((log) => {
        const serviceDate = parseDateParts(log.serviceDate);

        return (
          serviceDate.year === input.selectedYear &&
          matchesActivePeriod(
            serviceDate.month,
            input.selectedMonth,
            input.activeCycleMonth,
          )
        );
      })
      .map((log) => log.unitId),
  );

  return input.scopedBranches
    .map((branch) => {
      const branchUnits = branchUnitMap.get(branch.branchCode) ?? [];
      const dueUnits = branchUnits.filter(() =>
        branch.pmStartMonth != null &&
        (input.selectedMonth == null
          ? normalizeCycleMonth(branch.pmStartMonth) === input.activeCycleMonth
          : branchIncludesMonth(branch.pmStartMonth, input.selectedMonth)),
      );
      const completedUnits = dueUnits.filter((unit) => completedUnitIds.has(unit.unitId));

      return {
        branchCode: branch.branchCode,
        outletName: branch.outletName ?? branch.branchCode,
        region: branch.region || "Unassigned",
        state: branch.state ?? "",
        supplier: branch.supplierName || "Not assigned",
        senior: branch.seniorName || "Not assigned",
        totalUnits: branchUnits.length,
        dueUnits: dueUnits.length,
        completedUnits: completedUnits.length,
        overdueUnits: dueUnits.length - completedUnits.length,
      };
    })
    .sort(
      (left, right) =>
        right.overdueUnits - left.overdueUnits ||
        left.branchCode.localeCompare(right.branchCode),
    );
}

function summarizeUnitOperationalRows(input: {
  branchesByCode: Map<string, DashboardSummaryInput["branches"][number]>;
  scopedUnits: DashboardSummaryInput["units"];
  pmLogs: DashboardSummaryInput["pmLogs"];
  repairLogs: DashboardSummaryInput["repairLogs"];
}): UnitOperationalRow[] {
  return input.scopedUnits
    .map((unit) => {
      const branch = input.branchesByCode.get(unit.branchCode);
      const pmHistory = input.pmLogs
        .filter((log) => log.unitId === unit.unitId && log.serviceStatus === "DONE")
        .sort(sortLogsByDateDesc);
      const repairHistory = input.repairLogs
        .filter((log) => log.unitId === unit.unitId && log.serviceDate)
        .sort(sortLogsByDateDesc);
      const latestPmDate = pmHistory[0]?.serviceDate ?? null;
      const latestRepairDate = repairHistory[0]?.serviceDate ?? null;
      const latestPmTimestamp = latestPmDate
        ? parseDayTimestamp(latestPmDate)
        : null;
      const repairsAfterLatestPm =
        latestPmTimestamp === null
          ? 0
          : repairHistory.filter((log) => {
              if (!log.serviceDate) {
                return false;
              }

              const repairTimestamp = parseDayTimestamp(log.serviceDate);
              return repairTimestamp !== null && repairTimestamp > latestPmTimestamp;
            }).length;

      return {
        unitId: unit.unitId,
        branchCode: unit.branchCode,
        outletName: branch?.outletName ?? unit.branchCode,
        region: branch?.region || "Unassigned",
        supplier: branch?.supplierName || "Not assigned",
        latestPmDate,
        latestRepairDate,
        repairsAfterLatestPm,
        pmStatusSummary: latestPmDate ? "PM logged" : "No PM logged",
      };
    })
    .sort(
      (left, right) =>
        right.repairsAfterLatestPm - left.repairsAfterLatestPm ||
        left.unitId.localeCompare(right.unitId),
    );
}

function matchesBranchFilters(
  branch: DashboardSummaryInput["branches"][number],
  filters: DashboardFilters,
) {
  if (filters.region && branch.region !== filters.region) {
    return false;
  }

  if (filters.supplier && (branch.supplierName ?? "") !== filters.supplier) {
    return false;
  }

  if (filters.senior && (branch.seniorName ?? "") !== filters.senior) {
    return false;
  }

  if (filters.state && (branch.state ?? "") !== filters.state) {
    return false;
  }

  return true;
}

function buildBranchUnitMap(units: DashboardSummaryInput["units"]) {
  const unitsByBranchCode = new Map<string, DashboardSummaryInput["units"]>();

  for (const unit of units) {
    const existingUnits = unitsByBranchCode.get(unit.branchCode);

    if (existingUnits) {
      existingUnits.push(unit);
      continue;
    }

    unitsByBranchCode.set(unit.branchCode, [unit]);
  }

  return unitsByBranchCode;
}

function branchIncludesMonth(pmStartMonth: number, month: number) {
  const normalizedStart = ((pmStartMonth - 1) % 12 + 12) % 12 + 1;
  return (month - normalizedStart + 12) % 4 === 0;
}

function matchesActivePeriod(
  serviceMonth: number,
  selectedMonth: number | null,
  selectedCycle: number,
) {
  if (selectedMonth != null) {
    return serviceMonth === selectedMonth;
  }

  return normalizeCycleMonth(serviceMonth) === selectedCycle;
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

function parseDayTimestamp(value?: string) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function sortLogsByDateDesc<T extends { serviceDate?: string }>(left: T, right: T) {
  return (right.serviceDate ?? "").localeCompare(left.serviceDate ?? "");
}

function roundPercent(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 10000) / 100;
}
