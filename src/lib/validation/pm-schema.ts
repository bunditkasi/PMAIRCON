export const PM_SERVICE_STATUS = "DONE";

export type PmServiceStatus = typeof PM_SERVICE_STATUS;

export interface PmLogInput {
  branchCode: string;
  unitId: string;
  serviceDate: string;
  technicianName: string;
  supplierName: string;
  serviceStatus: PmServiceStatus;
}

function readRequiredString(
  input: Record<string, unknown>,
  key: keyof PmLogInput,
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

export function parsePmLogInput(input: unknown): PmLogInput {
  if (!input || typeof input !== "object") {
    throw new Error("PM input must be an object");
  }

  const record = input as Record<string, unknown>;
  const serviceDate = readRequiredString(record, "serviceDate");
  const serviceStatus = readRequiredString(record, "serviceStatus");

  if (!isIsoCalendarDate(serviceDate)) {
    throw new Error("serviceDate must be a valid YYYY-MM-DD date");
  }

  if (serviceStatus !== PM_SERVICE_STATUS) {
    throw new Error(`serviceStatus must be ${PM_SERVICE_STATUS}`);
  }

  return {
    branchCode: readRequiredString(record, "branchCode"),
    unitId: readRequiredString(record, "unitId"),
    serviceDate,
    technicianName: readRequiredString(record, "technicianName"),
    supplierName: readRequiredString(record, "supplierName"),
    serviceStatus,
  };
}

export const pmSchema = {
  parse: parsePmLogInput,
  safeParse(input: unknown):
    | { success: true; data: PmLogInput }
    | { success: false; error: string } {
    try {
      return {
        success: true,
        data: parsePmLogInput(input),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Invalid PM input",
      };
    }
  },
};
