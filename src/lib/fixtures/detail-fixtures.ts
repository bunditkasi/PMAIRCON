import type {
  BranchRecord,
  BranchUnitRecord,
} from "../services/branch-service";
import type { UnitRecord } from "../services/unit-service";

export const detailBranchFixtures = [
  {
    branchCode: "BC01",
    outletName: "SAPS",
    supplierName: "Klangsub Engineer",
  },
  {
    branchCode: "BE01",
    outletName: "Ayutthaya",
    supplierName: "Cooling Partner",
  },
] satisfies BranchRecord[];

export const detailUnitFixtures = [
  { unitId: "BC01-CT-01", branchCode: "BC01" },
  { unitId: "BC01-CT-02", branchCode: "BC01" },
  { unitId: "BC01-CS-01", branchCode: "BC01" },
  { unitId: "BE01-AHU-01", branchCode: "BE01" },
] satisfies Array<BranchUnitRecord & UnitRecord>;
