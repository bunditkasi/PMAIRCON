import type { UnitId } from "../domain/types";
import type { StorageStore, StoredBranch, StoredUnit } from "./types";

const SHEET_NAMES = {
  branches: "Branches",
  units: "Units",
} as const;

export type AppendRow = (
  sheetName: string,
  values: string[],
) => Promise<void>;

export type FindRow = (
  sheetName: string,
  key: string,
) => Promise<string[] | null>;

export type GoogleSheetStoreDeps = {
  appendRow: AppendRow;
  findRow: FindRow;
};

export function createGoogleSheetStore(
  deps: GoogleSheetStoreDeps,
): StorageStore {
  return {
    async saveBranch(branch) {
      await deps.appendRow(SHEET_NAMES.branches, createBranchRow(branch));
    },
    async getBranchByCode(branchCode) {
      const row = await deps.findRow(SHEET_NAMES.branches, branchCode);

      return rowToStoredBranch(row);
    },
    async saveUnit(unit) {
      await deps.appendRow(SHEET_NAMES.units, createUnitRow(unit));
    },
    async getUnitById(unitId) {
      const row = await deps.findRow(SHEET_NAMES.units, unitId);

      return rowToStoredUnit(row);
    },
  };
}

function createBranchRow(branch: StoredBranch): string[] {
  return [branch.branchCode, branch.outletName];
}

function createUnitRow(unit: StoredUnit): string[] {
  return [unit.unitId, unit.branchCode];
}

function rowToStoredBranch(row: string[] | null): StoredBranch | null {
  if (!hasRequiredColumns(row, 2)) {
    return null;
  }

  return {
    branchCode: row[0],
    outletName: row[1],
  };
}

function rowToStoredUnit(row: string[] | null): StoredUnit | null {
  if (!hasRequiredColumns(row, 2)) {
    return null;
  }

  const unitId = parseUnitId(row[0]);

  if (!unitId) {
    return null;
  }

  return {
    unitId,
    branchCode: row[1],
  };
}

function hasRequiredColumns(
  row: string[] | null,
  requiredColumnCount: number,
): row is string[] {
  if (row === null || row.length < requiredColumnCount) {
    return false;
  }

  for (let index = 0; index < requiredColumnCount; index += 1) {
    if (typeof row[index] !== "string") {
      return false;
    }
  }

  return true;
}

function parseUnitId(value: string): UnitId | null {
  return /^[A-Za-z0-9]+-(?:CUR|AHU|CT|CS)-[A-Za-z0-9]+$/.test(value)
    ? (value as UnitId)
    : null;
}
