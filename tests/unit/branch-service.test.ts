import { describe, expect, it } from "vitest";

import {
  detailBranchFixtures,
  detailUnitFixtures,
} from "../../src/lib/fixtures/detail-fixtures";
import {
  assembleBranchDetail,
  findBranchDetail,
} from "../../src/lib/services/branch-service";

describe("assembleBranchDetail", () => {
  it("returns the requested branch and only its matching units", () => {
    const result = assembleBranchDetail(
      {
        branchCode: "BC01",
        outletName: "SAPS",
        supplierName: "Klangsub Engineer",
        fullStoreName: "Seacon Bangkae, Bangkok",
        state: "Bangkok",
        startBusinessDate: "2016-01-15",
      },
      [
        { unitId: "BC01-CT-01", branchCode: "BC01" },
        { unitId: "BE01-CT-01", branchCode: "BE01" },
      ],
    );

    expect(result.branch.branchCode).toBe("BC01");
    expect(result.units).toEqual([{ unitId: "BC01-CT-01", branchCode: "BC01" }]);
  });

  it("returns detached branch and unit records", () => {
    const branch = {
      branchCode: "BC01",
      outletName: "SAPS",
      supplierName: "Klangsub Engineer",
      fullStoreName: "Seacon Bangkae, Bangkok",
      state: "Bangkok",
      startBusinessDate: "2016-01-15",
    };
    const units = [{ unitId: "BC01-CT-01", branchCode: "BC01" }];

    const result = assembleBranchDetail(branch, units);

    result.branch.outletName = "Updated";
    result.units[0].unitId = "CHANGED";

    expect(branch.outletName).toBe("SAPS");
    expect(units[0].unitId).toBe("BC01-CT-01");
  });

  it("returns an empty unit list when a branch has no matching units", () => {
    const result = assembleBranchDetail(
      {
        branchCode: "BZ01",
        outletName: "Chiang Mai",
        supplierName: "Northern Cooling",
        fullStoreName: "Chiang Mai Town",
        state: "Chiang Mai",
        startBusinessDate: "2019-02-01",
      },
      [{ unitId: "BC01-CT-01", branchCode: "BC01" }],
    );

    expect(result.units).toEqual([]);
  });
});

describe("findBranchDetail", () => {
  const branches = [
    {
      branchCode: "BC01",
      outletName: "SAPS",
      supplierName: "Klangsub Engineer",
      fullStoreName: "Seacon Bangkae, Bangkok",
      state: "Bangkok",
      startBusinessDate: "2016-01-15",
    },
    {
      branchCode: "BE01",
      outletName: "Ayutthaya",
      supplierName: "Cooling Partner",
      fullStoreName: "Ayutthaya City Park",
      state: "Ayutthaya",
      startBusinessDate: "2017-02-01",
    },
  ];

  const units = [
    { unitId: "BC01-CT-01", branchCode: "BC01" },
    { unitId: "BC01-CT-02", branchCode: "BC01" },
    { unitId: "BE01-CT-01", branchCode: "BE01" },
  ];

  it("returns null when the branch code does not exist", () => {
    expect(findBranchDetail("ZZ99", { branches, units })).toBeNull();
  });

  it("returns the matching branch and its units from collections", () => {
    const detail = findBranchDetail("BC01", { branches, units });

    expect(detail).toEqual({
      branch: {
        branchCode: "BC01",
        outletName: "SAPS",
        supplierName: "Klangsub Engineer",
        fullStoreName: "Seacon Bangkae, Bangkok",
        state: "Bangkok",
        startBusinessDate: "2016-01-15",
      },
      units: [
        { unitId: "BC01-CT-01", branchCode: "BC01" },
        { unitId: "BC01-CT-02", branchCode: "BC01" },
      ],
    });
  });

  it("builds branch detail from the shared fixtures used by the page flow", () => {
    const detail = findBranchDetail("BC01", {
      branches: detailBranchFixtures,
      units: detailUnitFixtures,
    });

    expect(detail?.branch).toEqual({
      branchCode: "BC01",
      outletName: "SAPS",
      supplierName: "Klangsub Engineer",
      fullStoreName: "Seacon Bangkae, Bangkok",
      state: "Bangkok",
      startBusinessDate: "2016-01-15",
    });
    expect(detail?.units.map((unit) => unit.unitId)).toEqual([
      "BC01-CT-01",
      "BC01-CT-02",
      "BC01-CS-01",
    ]);
  });
});
