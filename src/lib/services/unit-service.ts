export interface UnitRecord {
  unitId: string;
  branchCode: string;
}

export interface UnitPmRecord {
  unitId: string;
  serviceDate: string;
}

export interface UnitRepairRecord {
  unitId: string;
  serviceDate: string;
  issueDetail: string;
}

export interface UnitDetail {
  unit: UnitRecord;
  latestPm: UnitPmRecord | null;
  latestRepair: UnitRepairRecord | null;
  pmHistory: UnitPmRecord[];
  repairHistory: UnitRepairRecord[];
}

export interface UnitDetailCollections {
  units: UnitRecord[];
  pmLogs: UnitPmRecord[];
  repairLogs: UnitRepairRecord[];
}

function sortByServiceDateDesc<T extends { serviceDate: string }>(
  left: T,
  right: T,
) {
  return right.serviceDate.localeCompare(left.serviceDate);
}

export function assembleUnitDetail(
  unit: UnitRecord,
  pmLogs: UnitPmRecord[],
  repairLogs: UnitRepairRecord[],
): UnitDetail {
  const pmHistory = pmLogs
    .filter((item) => item.unitId === unit.unitId)
    .map((item) => ({ ...item }))
    .sort(sortByServiceDateDesc);
  const repairHistory = repairLogs
    .filter((item) => item.unitId === unit.unitId)
    .map((item) => ({ ...item }))
    .sort(sortByServiceDateDesc);

  return {
    unit: { ...unit },
    latestPm: pmHistory[0] ?? null,
    latestRepair: repairHistory[0] ?? null,
    pmHistory,
    repairHistory,
  };
}

export function findUnitDetail(
  unitId: string,
  { units, pmLogs, repairLogs }: UnitDetailCollections,
): UnitDetail | null {
  const unit = units.find((item) => item.unitId === unitId);

  if (!unit) {
    return null;
  }

  return assembleUnitDetail(unit, pmLogs, repairLogs);
}
