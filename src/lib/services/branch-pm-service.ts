import { PM_SERVICE_STATUS, pmSchema, type PmLogInput } from "../validation/pm-schema";

export interface SaveBranchPmInput {
  branchCode: string;
  unitIds: string[];
  serviceDate: string;
  technicianName: string;
  supplierName: string;
  serviceStatus: typeof PM_SERVICE_STATUS;
}

export interface SaveBranchPmDeps {
  saveUnitPmLog: (
    payload: PmLogInput,
  ) => Promise<{ latestPmDate: string; status: "saved" | "duplicate" }>;
}

export async function saveBranchPmLogs(
  deps: SaveBranchPmDeps,
  input: SaveBranchPmInput,
) {
  const normalizedUnitIds = Array.from(
    new Set(
      input.unitIds
        .map((unitId) => unitId.trim())
        .filter(Boolean),
    ),
  );

  if (normalizedUnitIds.length === 0) {
    throw new Error("This branch does not have any units to submit PM for");
  }

  let savedCount = 0;
  let duplicateCount = 0;

  for (const unitId of normalizedUnitIds) {
    const payload = pmSchema.parse({
      branchCode: input.branchCode,
      unitId,
      serviceDate: input.serviceDate,
      technicianName: input.technicianName,
      supplierName: input.supplierName,
      serviceStatus: input.serviceStatus,
    });

    const result = await deps.saveUnitPmLog(payload);

    if (result.status === "duplicate") {
      duplicateCount += 1;
      continue;
    }

    savedCount += 1;
  }

  return {
    branchCode: input.branchCode,
    serviceDate: input.serviceDate,
    totalUnits: normalizedUnitIds.length,
    savedCount,
    duplicateCount,
    status: savedCount > 0 ? "saved" as const : "duplicate" as const,
  };
}
