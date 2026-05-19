import {
  repairSchema,
  type RepairLogInput,
} from "../validation/repair-schema";

export type SaveRepairLogInput = RepairLogInput;

export interface SaveRepairLogDeps {
  createRepairLog: (payload: RepairLogInput) => Promise<void>;
  updateUnitLatestIssueSummary: (
    unitId: string,
    summary: string,
  ) => Promise<void>;
}

export async function saveRepairLog(
  deps: SaveRepairLogDeps,
  input: SaveRepairLogInput,
) {
  const payload = repairSchema.parse(input);

  await deps.createRepairLog(payload);
  await deps.updateUnitLatestIssueSummary(payload.unitId, payload.issueDetail);

  return {
    latestIssueSummary: payload.issueDetail,
  };
}
