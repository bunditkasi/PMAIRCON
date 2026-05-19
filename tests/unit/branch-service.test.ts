import { describe, expect, it } from "vitest";

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
      },
      [
        { unitId: "BC01-CT-01", branchCode: "BC01" },
        { unitId: "BE01-CT-01", branchCode: "BE01" },
      ],
    );

    expect(result.branch.branchCode).toBe("BC01");
    expect(result.units).toHaveLength(1);
  });
});

describe("findBranchDetail", () => {
  const branches = [
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
      },
      units: [
        { unitId: "BC01-CT-01", branchCode: "BC01" },
        { unitId: "BC01-CT-02", branchCode: "BC01" },
      ],
    });
  });
});
