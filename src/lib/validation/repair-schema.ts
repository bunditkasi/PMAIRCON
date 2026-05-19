export type RepairIssueCategory =
  | "WATER_LEAK"
  | "NO_COOLING"
  | "ELECTRICAL"
  | "OTHER";

export type RepairStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface RepairLogInput {
  branchCode: string;
  unitId: string;
  serviceDate: string;
  issueCategory: RepairIssueCategory;
  issueDetail: string;
  repairStatus: RepairStatus;
}

function readRequiredString(
  input: Record<string, unknown>,
  key: keyof RepairLogInput,
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

const ISSUE_CATEGORIES = new Set<RepairIssueCategory>([
  "WATER_LEAK",
  "NO_COOLING",
  "ELECTRICAL",
  "OTHER",
]);

const REPAIR_STATUSES = new Set<RepairStatus>([
  "PENDING",
  "IN_PROGRESS",
  "DONE",
]);

export function parseRepairLogInput(input: unknown): RepairLogInput {
  if (!input || typeof input !== "object") {
    throw new Error("Repair input must be an object");
  }

  const record = input as Record<string, unknown>;
  const serviceDate = readRequiredString(record, "serviceDate");
  const issueCategory = readRequiredString(record, "issueCategory");
  const repairStatus = readRequiredString(record, "repairStatus");

  if (!isIsoCalendarDate(serviceDate)) {
    throw new Error("serviceDate must be a valid YYYY-MM-DD date");
  }

  if (!ISSUE_CATEGORIES.has(issueCategory as RepairIssueCategory)) {
    throw new Error("issueCategory must be a supported repair category");
  }

  if (!REPAIR_STATUSES.has(repairStatus as RepairStatus)) {
    throw new Error("repairStatus must be PENDING, IN_PROGRESS, or DONE");
  }

  return {
    branchCode: readRequiredString(record, "branchCode"),
    unitId: readRequiredString(record, "unitId"),
    serviceDate,
    issueCategory: issueCategory as RepairIssueCategory,
    issueDetail: readRequiredString(record, "issueDetail"),
    repairStatus: repairStatus as RepairStatus,
  };
}

export const repairSchema = {
  parse: parseRepairLogInput,
  safeParse(input: unknown):
    | { success: true; data: RepairLogInput }
    | { success: false; error: string } {
    try {
      return {
        success: true,
        data: parseRepairLogInput(input),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Invalid repair input",
      };
    }
  },
};
