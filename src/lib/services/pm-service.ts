import { pmSchema, type PmLogInput } from "../validation/pm-schema";

export type SavePmLogInput = PmLogInput;
export interface PmLogRollbackToken {
  rowIndex: number;
}

export interface SavePmLogDeps {
  createPmLog: (
    payload: PmLogInput,
  ) => Promise<PmLogRollbackToken | undefined>;
  deletePmLog: (
    payload: PmLogInput,
    rollbackToken?: PmLogRollbackToken,
  ) => Promise<void>;
  updateUnitLatestPmDate: (unitId: string, serviceDate: string) => Promise<void>;
}

export async function savePmLog(
  deps: SavePmLogDeps,
  input: SavePmLogInput,
) {
  const payload = pmSchema.parse(input);
  const rollbackToken = await deps.createPmLog(payload);

  try {
    await deps.updateUnitLatestPmDate(payload.unitId, payload.serviceDate);
  } catch (updateError) {
    try {
      await deps.deletePmLog(payload, rollbackToken);
    } catch (rollbackError) {
      throw new Error("Failed to update latest PM date and roll back PM log", {
        cause: {
          updateError,
          rollbackError,
        },
      });
    }

    throw updateError;
  }

  return {
    latestPmDate: payload.serviceDate,
  };
}
