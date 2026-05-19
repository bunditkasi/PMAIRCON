import { buildUnitId } from "./ids";
import type { BuildingCode, UnitCode, UnitId } from "./types";

export interface AggregateUnitCounts {
  branchCode: BuildingCode;
  curtainCount: number;
  ahuCount: number;
  ceilingTypeCount: number;
  cassetteTypeCount: number;
}

export function expandAggregateUnitIds({
  branchCode: buildingCode,
  curtainCount,
  ahuCount,
  ceilingTypeCount,
  cassetteTypeCount,
}: AggregateUnitCounts): UnitId[] {
  return [
    ...buildUnitSequence(buildingCode, "CUR", curtainCount),
    ...buildUnitSequence(buildingCode, "AHU", ahuCount),
    ...buildUnitSequence(buildingCode, "CT", ceilingTypeCount),
    ...buildUnitSequence(buildingCode, "CS", cassetteTypeCount),
  ];
}

function buildUnitSequence(
  buildingCode: BuildingCode,
  unitCode: UnitCode,
  count: number,
): UnitId[] {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error(`Invalid unit count: ${count}`);
  }

  return Array.from({ length: count }, (_, index) =>
    buildUnitId(buildingCode, unitCode, index + 1),
  );
}
