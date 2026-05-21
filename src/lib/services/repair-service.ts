import {
  repairSchema,
  type RepairLogInput,
} from "../validation/repair-schema";

export type SaveRepairLogInput = RepairLogInput;
export interface RepairLogRollbackToken {
  rowIndex: number;
}

export interface SaveRepairLogDeps {
  createRepairLog: (
    payload: RepairLogInput,
  ) => Promise<RepairLogRollbackToken | undefined>;
  deleteRepairLog: (
    payload: RepairLogInput,
    rollbackToken?: RepairLogRollbackToken,
  ) => Promise<void>;
  updateUnitLatestIssueSummary: (
    unitId: string,
    serviceDate: string,
    summary: string,
  ) => Promise<void>;
}

export async function saveRepairLog(
  deps: SaveRepairLogDeps,
  input: SaveRepairLogInput,
) {
  const payload = repairSchema.parse(input);
  const rollbackToken = await deps.createRepairLog(payload);

  try {
    await deps.updateUnitLatestIssueSummary(
      payload.unitId,
      payload.serviceDate,
      payload.issueDetail,
    );
  } catch (updateError) {
    try {
      await deps.deleteRepairLog(payload, rollbackToken);
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
