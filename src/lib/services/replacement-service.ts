import {
  replacementSchema,
  type ReplacementInput,
} from "../validation/replacement-schema";

export type RecordReplacementInput = ReplacementInput;

export interface RecordReplacementDeps {
  createReplacementRecord: (payload: ReplacementInput) => Promise<void>;
  markUnitReplaced: (oldUnitId: string) => Promise<void>;
  createNewUnit: (payload: {
    branchCode: string;
    unitId: string;
  }) => Promise<void>;
}

export async function recordReplacement(
  deps: RecordReplacementDeps,
  input: RecordReplacementInput,
) {
  const payload = replacementSchema.parse(input);

  await deps.createReplacementRecord(payload);
  await deps.markUnitReplaced(payload.oldUnitId);
  await deps.createNewUnit({
    branchCode: payload.branchCode,
    unitId: payload.newUnitId,
  });

  return {
    oldUnitStatus: "REPLACED" as const,
  };
}
