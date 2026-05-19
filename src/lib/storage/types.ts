import type { BuildingCode, UnitId } from "../domain/types";

export interface StoredBranch {
  branchCode: BuildingCode;
  outletName: string;
}

export interface StoredUnit {
  unitId: UnitId;
  branchCode: BuildingCode;
}

export interface StorageStore {
  saveBranch(branch: StoredBranch): Promise<void>;
  getBranchByCode(branchCode: BuildingCode): Promise<StoredBranch | null>;
  saveUnit(unit: StoredUnit): Promise<void>;
  getUnitById(unitId: UnitId): Promise<StoredUnit | null>;
}
