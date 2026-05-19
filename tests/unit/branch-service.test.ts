import { describe, expect, it } from "vitest";

import { assembleBranchDetail } from "../../src/lib/services/branch-service";

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
