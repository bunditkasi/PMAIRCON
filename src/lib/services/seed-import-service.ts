export type SourceRowValue = string | number | null | undefined;

export type SourceRow = Record<string, SourceRowValue>;

export interface ImportedBranch {
  branchCode: string;
  outletName: string;
  codeName: string;
  state: string;
  region: string;
  seniorName: string;
  supplierName: string;
  pmStartMonth: number;
  curtainCount: number;
  ahuCount: number;
  ceilingTypeCount: number;
  cassetteTypeCount: number;
}

export function mapSourceRowsToBranches(rows: SourceRow[]): ImportedBranch[] {
  return rows.map(mapSourceRowToBranch);
}

export function mapSourceRowToBranch(row: SourceRow): ImportedBranch {
  return {
    branchCode: readString(row.Code),
    outletName: readString(row["Outlet Name"]),
    codeName: readString(row["Code-Name"]),
    state: readString(row.State),
    region: readString(row.Region),
    seniorName: readString(row.Senior),
    supplierName: readString(row.Suplier),
    pmStartMonth: readNumber(row.Month),
    curtainCount: readNumber(row.Curtain),
    ahuCount: readNumber(row.AHU),
    ceilingTypeCount: readNumber(row["Ceiling Type"]),
    cassetteTypeCount: readNumber(row["cassette type"]),
  };
}

function readString(value: SourceRowValue): string {
  return typeof value === "string" ? value.trim() : String(value ?? "");
}

function readNumber(value: SourceRowValue): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}
