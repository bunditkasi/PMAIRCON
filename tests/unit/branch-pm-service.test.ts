import { describe, expect, it, vi } from "vitest";

import { saveBranchPmLogs } from "../../src/lib/services/branch-pm-service";

describe("saveBranchPmLogs", () => {
  it("saves branch PM across all units and summarizes counts", async () => {
    const saveUnitPmLog = vi
      .fn()
      .mockResolvedValueOnce({ latestPmDate: "2026-05-26", status: "saved" })
      .mockResolvedValueOnce({
        latestPmDate: "2026-05-26",
        status: "duplicate",
      });

    const result = await saveBranchPmLogs(
      {
        saveUnitPmLog,
      },
      {
        branchCode: "B007",
        unitIds: ["B007-CUR-01", "B007-CT-01"],
        serviceDate: "2026-05-26",
        technicianName: "Somchai",
        supplierName: "Nisa Really Cool",
        serviceStatus: "DONE",
      },
    );

    expect(result).toEqual({
      branchCode: "B007",
      serviceDate: "2026-05-26",
      totalUnits: 2,
      savedCount: 1,
      duplicateCount: 1,
      status: "saved",
    });
    expect(saveUnitPmLog).toHaveBeenCalledTimes(2);
  });

  it("rejects empty branch unit lists", async () => {
    await expect(
      saveBranchPmLogs(
        {
          saveUnitPmLog: vi.fn(),
        },
        {
          branchCode: "B007",
          unitIds: [],
          serviceDate: "2026-05-26",
          technicianName: "Somchai",
          supplierName: "Nisa Really Cool",
          serviceStatus: "DONE",
        },
      ),
    ).rejects.toThrow("This branch does not have any units to submit PM for");
  });
});
