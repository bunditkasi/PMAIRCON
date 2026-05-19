import { pmSchema, type PmLogInput } from "../validation/pm-schema";

export type SavePmLogInput = PmLogInput;

export interface SavePmLogDeps {
  createPmLog: (payload: PmLogInput) => Promise<void>;
  updateUnitLatestPmDate: (unitId: string, serviceDate: string) => Promise<void>;
}

export async function savePmLog(
  deps: SavePmLogDeps,
  input: SavePmLogInput,
) {
  const payload = pmSchema.parse(input);

  await deps.createPmLog(payload);
  await deps.updateUnitLatestPmDate(payload.unitId, payload.serviceDate);

  return {
    latestPmDate: payload.serviceDate,
  };
}
