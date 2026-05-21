import { describe, expect, it } from "vitest";

import { summarizeDashboard } from "../../src/lib/services/dashboard-service";

describe("summarizeDashboard", () => {
  it("returns branch, unit, pm logged unit, and open repair totals", () => {
    const result = summarizeDashboard({
      branches: [
        { branchCode: "BC01", region: "Central", pmStartMonth: 1 },
        { branchCode: "BE01", region: "North", pmStartMonth: 2 },
      ],
      units: [
        { unitId: "BC01-CT-01", branchCode: "BC01" },
        { unitId: "BE01-CT-01", branchCode: "BE01" },
      ],
      pmLogs: [
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-01-10",
          serviceStatus: "DONE",
        },
      ],
      repairLogs: [{ unitId: "BE01-CT-01", repairStatus: "IN_PROGRESS" }],
    });

    expect(result.totalBranches).toBe(2);
    expect(result.totalUnits).toBe(2);
    expect(result.pmLoggedUnits).toBe(1);
    expect(result.openRepairs).toBe(1);
  });

  it("counts distinct units for pm logged units and open repairs", () => {
    const result = summarizeDashboard({
      branches: [{ branchCode: "BC01", region: "Central", pmStartMonth: 1 }],
      units: [
        { unitId: "BC01-CT-01", branchCode: "BC01" },
        { unitId: "BC01-CT-02", branchCode: "BC01" },
        { unitId: "BC01-CT-03", branchCode: "BC01" },
      ],
      pmLogs: [
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-01-10",
          serviceStatus: "DONE",
        },
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-01-11",
          serviceStatus: "DONE",
        },
        {
          unitId: "BC01-CT-02",
          serviceDate: "2026-01-12",
          serviceStatus: "DONE",
        },
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

  it("calculates annual completion, active cycle completion, and regional summaries", () => {
    const result = summarizeDashboard(
      {
        branches: [
          { branchCode: "BC01", region: "Central", pmStartMonth: 1 },
          { branchCode: "BE01", region: "North", pmStartMonth: 2 },
        ],
        units: [
          { unitId: "BC01-CS-01", branchCode: "BC01" },
          { unitId: "BC01-CS-02", branchCode: "BC01" },
          { unitId: "BE01-CS-01", branchCode: "BE01" },
        ],
        pmLogs: [
          {
            unitId: "BC01-CS-01",
            serviceDate: "2026-01-10",
            serviceStatus: "DONE",
          },
          {
            unitId: "BC01-CS-02",
            serviceDate: "2026-05-10",
            serviceStatus: "DONE",
          },
          {
            unitId: "BE01-CS-01",
            serviceDate: "2026-06-10",
            serviceStatus: "DONE",
          },
        ],
        repairLogs: [],
      },
      { today: "2026-05-21", year: 2026 },
    );

    expect(result.annualCompletionPercent).toBeCloseTo(33.33, 2);
    expect(result.currentCycleCompletionPercent).toBe(50);
    expect(result.regions).toEqual([
      expect.objectContaining({ region: "Central", cycleCompletionPercent: 50 }),
      expect.objectContaining({ region: "North", cycleCompletionPercent: 0 }),
    ]);
  });
});
