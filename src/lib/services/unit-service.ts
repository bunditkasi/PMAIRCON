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
  repairStatus?: string;
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

function parseServiceDate(serviceDate: string): number | null {
  const normalizedMatch = serviceDate.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s].*)?$/,
  );

  if (normalizedMatch) {
    const [, yearText, monthText, dayText] = normalizedMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);

    if (
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      const timestamp = Date.UTC(year, month - 1, day);
      const parsedDate = new Date(timestamp);

      if (
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month - 1 &&
        parsedDate.getUTCDate() === day
      ) {
        return timestamp;
      }

      return null;
    }
  }

  const parsedTimestamp = Date.parse(serviceDate);

  return Number.isNaN(parsedTimestamp) ? null : parsedTimestamp;
}

function sortByServiceDateDesc<T extends { serviceDate: string }>(
  left: T,
  right: T,
) {
  const leftTimestamp = parseServiceDate(left.serviceDate);
  const rightTimestamp = parseServiceDate(right.serviceDate);

  if (leftTimestamp !== null && rightTimestamp !== null) {
    return rightTimestamp - leftTimestamp;
  }

  if (leftTimestamp === null && rightTimestamp !== null) {
    return 1;
  }

  if (leftTimestamp !== null && rightTimestamp === null) {
    return -1;
  }

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
