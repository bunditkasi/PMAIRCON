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

  it("calculates annual completion, normalized active cycle completion, and regional summaries", () => {
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
      { today: "2026-05-21", year: 2026, activeRegion: "Central" },
    );

    expect(result.annualCompletionPercent).toBeCloseTo(33.33, 2);
    expect(result.currentCycleCompletionPercent).toBe(100);
    expect(result.activeRegion).toBe("Central");
    expect(result.regions).toEqual([
      expect.objectContaining({
        region: "Central",
        annualCompletionPercent: 33.33,
        currentCycleCompletionPercent: 100,
      }),
      expect.objectContaining({
        region: "North",
        annualCompletionPercent: 33.33,
        currentCycleCompletionPercent: 0,
      }),
    ]);
  });

  it("matches active-cycle completion across the normalized 4-month month set", () => {
    const result = summarizeDashboard(
      {
        branches: [{ branchCode: "BC01", region: "Central", pmStartMonth: 1 }],
        units: [
          { unitId: "BC01-CS-01", branchCode: "BC01" },
          { unitId: "BC01-CS-02", branchCode: "BC01" },
        ],
        pmLogs: [
          {
            unitId: "BC01-CS-01",
            serviceDate: "2026-01-10",
            serviceStatus: "DONE",
          },
          {
            unitId: "BC01-CS-02",
            serviceDate: "2026-09-10",
            serviceStatus: "DONE",
          },
        ],
        repairLogs: [],
      },
      { today: "2026-05-21", year: 2026 },
    );

    expect(result.activeCycleMonth).toBe(1);
    expect(result.currentCycleCompletionPercent).toBe(100);
  });

  it("counts raw completed PM jobs for active-cycle completion and regional cycle summaries", () => {
    const result = summarizeDashboard(
      {
        branches: [{ branchCode: "BC01", region: "Central", pmStartMonth: 1 }],
        units: [
          { unitId: "BC01-CS-01", branchCode: "BC01" },
          { unitId: "BC01-CS-02", branchCode: "BC01" },
        ],
        pmLogs: [
          {
            unitId: "BC01-CS-01",
            serviceDate: "2026-01-10",
            serviceStatus: "DONE",
          },
          {
            unitId: "BC01-CS-01",
            serviceDate: "2026-05-10",
            serviceStatus: "DONE",
          },
          {
            unitId: "BC01-CS-02",
            serviceDate: "2026-09-10",
            serviceStatus: "DONE",
          },
        ],
        repairLogs: [],
      },
      { today: "2026-05-21", year: 2026, activeRegion: "Central" },
    );

    expect(result.currentCycleCompletionPercent).toBe(150);
    expect(result.regions).toEqual([
      expect.objectContaining({
        region: "Central",
        completedCycleJobs: 3,
        currentCycleCompletionPercent: 150,
        cycleCompletionPercent: 150,
      }),
    ]);
  });

  it("does not overcount regional completed cycle jobs when multiple active branches share a region", () => {
    const result = summarizeDashboard(
      {
        branches: [
          { branchCode: "BC01", region: "Central", pmStartMonth: 1 },
          { branchCode: "BC02", region: "Central", pmStartMonth: 5 },
        ],
        units: [
          { unitId: "BC01-CS-01", branchCode: "BC01" },
          { unitId: "BC02-CS-01", branchCode: "BC02" },
        ],
        pmLogs: [
          {
            unitId: "BC01-CS-01",
            serviceDate: "2026-01-10",
            serviceStatus: "DONE",
          },
          {
            unitId: "BC02-CS-01",
            serviceDate: "2026-05-10",
            serviceStatus: "DONE",
          },
        ],
        repairLogs: [],
      },
      { today: "2026-05-21", year: 2026, activeRegion: "Central" },
    );

    expect(result.currentCycleCompletionPercent).toBe(100);
    expect(result.regions).toEqual([
      expect.objectContaining({
        region: "Central",
        requiredCycleJobs: 2,
        completedCycleJobs: 2,
        currentCycleCompletionPercent: 100,
      }),
    ]);
  });

  it("scopes summary metrics to the caller-provided activeRegion", () => {
    const result = summarizeDashboard(
      {
        branches: [
          { branchCode: "BC01", region: "Central", pmStartMonth: 1 },
          { branchCode: "BE01", region: "North", pmStartMonth: 1 },
        ],
        units: [
          { unitId: "BC01-CS-01", branchCode: "BC01" },
          { unitId: "BE01-CS-01", branchCode: "BE01" },
        ],
        pmLogs: [
          {
            unitId: "BC01-CS-01",
            serviceDate: "2026-05-10",
            serviceStatus: "DONE",
          },
        ],
        repairLogs: [{ unitId: "BC01-CS-01", repairStatus: "IN_PROGRESS" }],
      },
      { today: "2026-05-21", year: 2026, activeRegion: "North" },
    );

    expect(result.totalBranches).toBe(1);
    expect(result.totalUnits).toBe(1);
    expect(result.pmLoggedUnits).toBe(0);
    expect(result.openRepairs).toBe(0);
    expect(result.annualCompletionPercent).toBe(0);
    expect(result.currentCycleCompletionPercent).toBe(0);
    expect(result.activeRegion).toBe("North");
  });
});
