import { pmSchema, type PmLogInput } from "../validation/pm-schema";

export type SavePmLogInput = PmLogInput;

export interface SavePmLogDeps {
  createPmLog: (payload: PmLogInput) => Promise<void>;
  deletePmLog: (payload: PmLogInput) => Promise<void>;
  updateUnitLatestPmDate: (unitId: string, serviceDate: string) => Promise<void>;
}

export async function savePmLog(
  deps: SavePmLogDeps,
  input: SavePmLogInput,
) {
  const payload = pmSchema.parse(input);

  await deps.createPmLog(payload);

  try {
    await deps.updateUnitLatestPmDate(payload.unitId, payload.serviceDate);
  } catch (updateError) {
    try {
      await deps.deletePmLog(payload);
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
