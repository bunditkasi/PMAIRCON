import type { BuildingCode, UnitId } from "../domain/types";

export interface ReplacementInput {
  oldUnitId: UnitId;
  branchCode: BuildingCode;
  decisionDate: string;
  reason: string;
  newUnitId: UnitId;
}

function readRequiredString(
  input: Record<string, unknown>,
  key: keyof ReplacementInput,
): string {
  const value = input[key];

  if (typeof value !== "string") {
    throw new Error(`${key} must be a string`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(`${key} is required`);
  }

  return trimmedValue;
}

function isIsoCalendarDate(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return false;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

export function parseReplacementInput(input: unknown): ReplacementInput {
  if (!input || typeof input !== "object") {
    throw new Error("Replacement input must be an object");
  }

  const record = input as Record<string, unknown>;
  const decisionDate = readRequiredString(record, "decisionDate");

  if (!isIsoCalendarDate(decisionDate)) {
    throw new Error("decisionDate must be a valid YYYY-MM-DD date");
  }

  return {
    oldUnitId: readRequiredString(record, "oldUnitId") as UnitId,
    branchCode: readRequiredString(record, "branchCode") as BuildingCode,
    decisionDate,
    reason: readRequiredString(record, "reason"),
    newUnitId: readRequiredString(record, "newUnitId") as UnitId,
  };
}

export const replacementSchema = {
  parse: parseReplacementInput,
  safeParse(input: unknown):
    | { success: true; data: ReplacementInput }
    | { success: false; error: string } {
    try {
      return {
        success: true,
        data: parseReplacementInput(input),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Invalid replacement input",
      };
    }
  },
};
