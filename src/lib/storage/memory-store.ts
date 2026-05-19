import type {
  StorageStore,
  StoredBranch,
  StoredUnit,
} from "./types";

export function createMemoryStore(): StorageStore {
  const branches = new Map<string, StoredBranch>();
  const units = new Map<string, StoredUnit>();

  return {
    async saveBranch(branch) {
      branches.set(branch.branchCode, cloneBranch(branch));
    },
    async getBranchByCode(branchCode) {
      const branch = branches.get(branchCode);

      return branch ? cloneBranch(branch) : null;
    },
    async saveUnit(unit) {
      units.set(unit.unitId, cloneUnit(unit));
    },
    async getUnitById(unitId) {
      const unit = units.get(unitId);

      return unit ? cloneUnit(unit) : null;
    },
  };
}

function cloneBranch(branch: StoredBranch): StoredBranch {
  return { ...branch };
}

function cloneUnit(unit: StoredUnit): StoredUnit {
  return { ...unit };
}
