import {
  replacementSchema,
  type ReplacementInput,
} from "../validation/replacement-schema";

export type RecordReplacementInput = ReplacementInput;
export interface ReplacementRecordRollbackToken {
  rowIndex: number;
}

export interface ReplacementUnitRollbackToken {
  rowIndex: number;
}

export interface RecordReplacementDeps {
  createReplacementRecord: (
    payload: ReplacementInput,
  ) => Promise<ReplacementRecordRollbackToken | undefined>;
  deleteReplacementRecord: (
    payload: ReplacementInput,
    rollbackToken?: ReplacementRecordRollbackToken,
  ) => Promise<void>;
  markUnitReplaced: (oldUnitId: string, reason: string) => Promise<void>;
  createNewUnit: (
    payload: ReplacementInput,
  ) => Promise<ReplacementUnitRollbackToken | undefined>;
  deleteNewUnit: (
    payload: ReplacementInput,
    rollbackToken?: ReplacementUnitRollbackToken,
  ) => Promise<void>;
}

export async function recordReplacement(
  deps: RecordReplacementDeps,
  input: RecordReplacementInput,
) {
  const payload = replacementSchema.parse(input);
  const replacementRollbackToken = await deps.createReplacementRecord(payload);
  let newUnitRollbackToken: ReplacementUnitRollbackToken | undefined;

  try {
    newUnitRollbackToken = await deps.createNewUnit(payload);
  } catch (createNewUnitError) {
    try {
      await deps.deleteReplacementRecord(payload, replacementRollbackToken);
    } catch (rollbackError) {
      throw new Error(
        "Failed to create replacement unit and roll back replacement record",
        {
          cause: {
            createNewUnitError,
            rollbackError,
          },
        },
      );
    }

    throw createNewUnitError;
  }

  try {
    await deps.markUnitReplaced(payload.oldUnitId, payload.reason);
  } catch (markUnitReplacedError) {
    try {
      await deps.deleteNewUnit(payload, newUnitRollbackToken);
      await deps.deleteReplacementRecord(payload, replacementRollbackToken);
    } catch (rollbackError) {
      throw new Error(
        "Failed to mark old unit replaced and roll back replacement flow",
        {
          cause: {
            markUnitReplacedError,
            rollbackError,
          },
        },
      );
    }

    throw markUnitReplacedError;
  }

  return {
    oldUnitStatus: "REPLACED" as const,
  };
}
