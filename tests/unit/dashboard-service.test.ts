import { describe, expect, it } from "vitest";

import { summarizeDashboard } from "../../src/lib/services/dashboard-service";

describe("summarizeDashboard", () => {
  it("returns branch, unit, pm logged unit, and open repair totals", () => {
    const result = summarizeDashboard({
      branches: [{ branchCode: "BC01" }, { branchCode: "BE01" }],
      units: [{ unitId: "BC01-CT-01" }, { unitId: "BE01-CT-01" }],
      pmLogs: [{ unitId: "BC01-CT-01", serviceDate: "2026-01-10" }],
      repairLogs: [{ unitId: "BE01-CT-01", repairStatus: "IN_PROGRESS" }],
    });

    expect(result.totalBranches).toBe(2);
    expect(result.totalUnits).toBe(2);
    expect(result.pmLoggedUnits).toBe(1);
    expect(result.openRepairs).toBe(1);
  });

  it("counts distinct units for pm logged units and open repairs", () => {
    const result = summarizeDashboard({
      branches: [{ branchCode: "BC01" }],
      units: [
        { unitId: "BC01-CT-01" },
        { unitId: "BC01-CT-02" },
        { unitId: "BC01-CT-03" },
      ],
      pmLogs: [
        { unitId: "BC01-CT-01", serviceDate: "2026-01-10" },
        { unitId: "BC01-CT-01", serviceDate: "2026-01-11" },
        { unitId: "BC01-CT-02", serviceDate: "2026-01-12" },
      ],
      repairLogs: [
        { unitId: "BC01-CT-02", repairStatus: "IN_PROGRESS" },
        { unitId: "BC01-CT-02", repairStatus: "PENDING" },
        { unitId: "BC01-CT-03", repairStatus: "DONE" },
      ],
    });

    expect(result.pmLoggedUnits).toBe(2);
    expect(result.openRepairs).toBe(1);
  });
});
