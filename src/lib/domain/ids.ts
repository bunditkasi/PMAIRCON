import { UNIT_CODE_SET } from "./lookups";
import type { BuildingCode, QuarterNumber, QuarterYear, UnitCode, UnitId } from "./types";

export function buildUnitId(
  buildingCode: BuildingCode,
  unitCode: UnitCode,
  sequence: number,
): UnitId {
  if (!UNIT_CODE_SET.has(unitCode)) {
    throw new Error(`Unsupported unit code: ${unitCode}`);
  }

  if (!Number.isSafeInteger(sequence) || sequence <= 0) {
    throw new Error(`Invalid unit sequence: ${sequence}`);
  }

  return `${buildingCode}-${unitCode}-${String(sequence).padStart(2, "0")}`;
}

export function buildQuarterYear(date: Date): QuarterYear {
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const quarter = (Math.floor(date.getUTCMonth() / 3) + 1) as QuarterNumber;

  return `${date.getUTCFullYear()}-Q${quarter}`;
}
