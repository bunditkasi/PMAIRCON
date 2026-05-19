export interface BranchRecord {
  branchCode: string;
  outletName: string;
  supplierName: string;
}

export interface BranchUnitRecord {
  unitId: string;
  branchCode: string;
}

export interface BranchDetail {
  branch: BranchRecord;
  units: BranchUnitRecord[];
}

export function assembleBranchDetail(
  branch: BranchRecord,
  units: BranchUnitRecord[],
): BranchDetail {
  return {
    branch: { ...branch },
    units: units
      .filter((unit) => unit.branchCode === branch.branchCode)
      .map((unit) => ({ ...unit })),
  };
}
