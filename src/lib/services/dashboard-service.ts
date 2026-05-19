export interface DashboardSummaryInput {
  branches: Array<{ branchCode: string }>;
  units: Array<{ unitId: string }>;
  pmLogs: Array<{ unitId: string; serviceDate: string }>;
  repairLogs: Array<{ unitId: string; repairStatus: string }>;
}

export interface DashboardSummary {
  totalBranches: number;
  totalUnits: number;
  pmLoggedUnits: number;
  openRepairs: number;
}

export function summarizeDashboard(
  input: DashboardSummaryInput,
): DashboardSummary {
  return {
    totalBranches: input.branches.length,
    totalUnits: input.units.length,
    pmLoggedUnits: new Set(input.pmLogs.map((item) => item.unitId)).size,
    openRepairs: new Set(
      input.repairLogs
        .filter((item) => item.repairStatus !== "DONE")
        .map((item) => item.unitId),
    ).size,
  };
}
