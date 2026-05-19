import { describe, expect, it } from "vitest";

import { summarizeDashboard } from "../../src/lib/services/dashboard-service";

describe("summarizeDashboard", () => {
  it("returns branch, unit, and open repair totals", () => {
    const result = summarizeDashboard({
      branches: [{ branchCode: "BC01" }, { branchCode: "BE01" }],
      units: [{ unitId: "BC01-CT-01" }, { unitId: "BE01-CT-01" }],
      pmLogs: [{ unitId: "BC01-CT-01", serviceDate: "2026-01-10" }],
      repairLogs: [{ unitId: "BE01-CT-01", repairStatus: "IN_PROGRESS" }],
    });

    expect(result.totalBranches).toBe(2);
    expect(result.totalUnits).toBe(2);
    expect(result.openRepairs).toBe(1);
  });
});
