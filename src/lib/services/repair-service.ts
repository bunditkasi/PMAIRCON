import {
  repairSchema,
  type RepairLogInput,
} from "../validation/repair-schema";

export type SaveRepairLogInput = RepairLogInput;

export interface SaveRepairLogDeps {
  createRepairLog: (payload: RepairLogInput) => Promise<void>;
  deleteRepairLog: (payload: RepairLogInput) => Promise<void>;
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

  try {
    await deps.updateUnitLatestIssueSummary(payload.unitId, payload.issueDetail);
  } catch (updateError) {
    try {
      await deps.deleteRepairLog(payload);
    } catch (rollbackError) {
      throw new Error(
        "Failed to update latest issue summary and roll back repair log",
        {
          cause: {
            updateError,
            rollbackError,
          },
        },
      );
    }

    throw updateError;
  }

  return {
    latestIssueSummary: payload.issueDetail,
  };
}
