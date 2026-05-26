export interface UnitRecord {
  unitId: string;
  branchCode: string;
  pmStartMonth?: number;
}

export interface UnitPmRecord {
  unitId: string;
  serviceDate: string;
  serviceStatus?: string;
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
  pmTableRows: Array<{
    serviceDate: string;
    serviceStatus: string;
    cycleLabel: string;
  }>;
  repairTableRows: Array<{
    serviceDate: string;
    issueDetail: string;
    repairStatus: string;
  }>;
  pmRepairSummary: {
    repairsAfterLatestPm: number;
    latestPmDate: string | null;
    latestRepairDate: string | null;
    message: string;
  };
  hasPmHistoryTable: boolean;
  hasRepairHistoryTable: boolean;
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

function sortByServiceDateDesc<T extends { serviceDate: string }>(left: T, right: T) {
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

function normalizePmStartMonth(pmStartMonth?: number): number {
  if (!Number.isInteger(pmStartMonth)) {
    return 1;
  }

  const startMonth = pmStartMonth as number;
  const normalizedMonth = ((startMonth - 1) % 12 + 12) % 12;

  return normalizedMonth + 1;
}

function buildPmCycleLabel(serviceDate: string, pmStartMonth?: number): string {
  const match = serviceDate.match(/^(\d{4})[-/](\d{1,2})(?:[-/]\d{1,2})?/);
  const serviceYear = Number(match?.[1]);
  const serviceMonth = Number(match?.[2]);
  const normalizedStartMonth = normalizePmStartMonth(pmStartMonth);
  const normalizedServiceMonth =
    Number.isInteger(serviceMonth) && serviceMonth >= 1 && serviceMonth <= 12
      ? serviceMonth
      : normalizedStartMonth;
  const cycleYear =
    Number.isInteger(serviceYear) && serviceYear > 0
      ? normalizedServiceMonth < normalizedStartMonth
        ? serviceYear - 1
        : serviceYear
      : 0;
  const cycleNumber =
    Math.floor(
      ((normalizedServiceMonth - normalizedStartMonth + 12) % 12) / 4,
    ) + 1;

  return `${String(cycleYear).padStart(4, "0")} \u0e23\u0e2d\u0e1a ${cycleNumber}`;
}

function buildPmRepairSummary(
  pmHistory: UnitPmRecord[],
  repairHistory: UnitRepairRecord[],
) {
  const latestSuccessfulPm =
    pmHistory.find((item) => (item.serviceStatus ?? "DONE") === "DONE") ?? null;
  const latestRepair = repairHistory[0] ?? null;

  if (!latestSuccessfulPm) {
    return {
      repairsAfterLatestPm: 0,
      latestPmDate: null,
      latestRepairDate: latestRepair?.serviceDate ?? null,
      message:
        "No successful PM recorded yet. Repair history is shown without after-PM comparison.",
    };
  }

  const latestPmTimestamp = parseServiceDate(latestSuccessfulPm.serviceDate);
  const repairsAfterLatestPm = repairHistory.filter((item) => {
    const repairTimestamp = parseServiceDate(item.serviceDate);

    return (
      latestPmTimestamp !== null &&
      repairTimestamp !== null &&
      repairTimestamp > latestPmTimestamp
    );
  }).length;

  return {
    repairsAfterLatestPm,
    latestPmDate: latestSuccessfulPm.serviceDate,
    latestRepairDate: latestRepair?.serviceDate ?? null,
    message:
      repairsAfterLatestPm > 0
        ? `Repairs after latest PM: ${repairsAfterLatestPm}`
        : "No repair recorded after latest PM",
  };
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
  const pmTableRows = pmHistory.slice(0, 5).map((item) => ({
    serviceDate: item.serviceDate,
    serviceStatus: item.serviceStatus ?? "DONE",
    cycleLabel: buildPmCycleLabel(item.serviceDate, unit.pmStartMonth),
  }));
  const repairTableRows = repairHistory.slice(0, 5).map((item) => ({
    serviceDate: item.serviceDate,
    issueDetail: item.issueDetail,
    repairStatus: item.repairStatus ?? "PENDING",
  }));
  const pmRepairSummary = buildPmRepairSummary(pmHistory, repairHistory);

  return {
    unit: { ...unit },
    latestPm: pmHistory[0] ?? null,
    latestRepair: repairHistory[0] ?? null,
    pmHistory,
    repairHistory,
    pmTableRows,
    repairTableRows,
    pmRepairSummary,
    hasPmHistoryTable: pmTableRows.length > 0,
    hasRepairHistoryTable: repairTableRows.length > 0,
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
