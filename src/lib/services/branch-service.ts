export interface BranchRecord {
  branchCode: string;
  outletName: string;
  supplierName: string;
  fullStoreName: string;
  state: string;
  startBusinessDate: string;
}

export interface BranchUnitRecord {
  unitId: string;
  branchCode: string;
}

export interface BranchDetail {
  branch: BranchRecord;
  units: BranchUnitRecord[];
}

export interface BranchDetailCollections {
  branches: BranchRecord[];
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

export function findBranchDetail(
  branchCode: string,
  { branches, units }: BranchDetailCollections,
): BranchDetail | null {
  const branch = branches.find((item) => item.branchCode === branchCode);

  if (!branch) {
    return null;
  }

  return assembleBranchDetail(branch, units);
}
