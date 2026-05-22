import type {
  BranchRecord,
  BranchUnitRecord,
} from "../services/branch-service";
import type {
  UnitPmRecord,
  UnitRecord,
  UnitRepairRecord,
} from "../services/unit-service";

export const detailBranchFixtures = [
  {
    branchCode: "BC01",
    outletName: "SAPS",
    supplierName: "Klangsub Engineer",
    fullStoreName: "Seacon Bangkae, Bangkok",
    state: "Bangkok",
    startBusinessDate: "2016-01-15",
    mapUrl: "https://maps.app.goo.gl/example",
  },
  {
    branchCode: "BE01",
    outletName: "Ayutthaya",
    supplierName: "Cooling Partner",
    fullStoreName: "Ayutthaya City Park",
    state: "Ayutthaya",
    startBusinessDate: "2017-02-01",
    mapUrl: "",
  },
] satisfies BranchRecord[];

export const detailUnitFixtures = [
  { unitId: "BC01-CT-01", branchCode: "BC01" },
  { unitId: "BC01-CT-02", branchCode: "BC01" },
  { unitId: "BC01-CS-01", branchCode: "BC01" },
  { unitId: "BE01-AHU-01", branchCode: "BE01" },
] satisfies Array<BranchUnitRecord & UnitRecord>;

export const detailPmFixtures = [
  { unitId: "BC01-CT-01", serviceDate: "2026-01-01" },
  { unitId: "BC01-CT-01", serviceDate: "2026-05-01" },
  { unitId: "BC01-CT-02", serviceDate: "2026-04-15" },
] satisfies UnitPmRecord[];

export const detailRepairFixtures = [
  {
    unitId: "BC01-CT-01",
    serviceDate: "2026-03-01",
    issueDetail: "water leak",
  },
  {
    unitId: "BC01-CT-01",
    serviceDate: "2026-04-20",
    issueDetail: "fan noise",
  },
] satisfies UnitRepairRecord[];
