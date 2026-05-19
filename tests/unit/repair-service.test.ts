import { describe, expect, it, vi } from "vitest";

import { saveRepairLog } from "../../src/lib/services/repair-service";

describe("saveRepairLog", () => {
  it("writes a repair log and updates the latest issue summary", async () => {
    const writes: unknown[] = [];
    const latestIssueUpdates: Array<{ unitId: string; summary: string }> = [];

    const result = await saveRepairLog(
      {
        createRepairLog: async (payload) => {
          writes.push(payload);
        },
        updateUnitLatestIssueSummary: async (unitId, summary) => {
          latestIssueUpdates.push({ unitId, summary });
        },
      },
      {
        branchCode: "BC01",
        unitId: "BC01-CT-01",
        serviceDate: "2026-05-18",
        issueCategory: "WATER_LEAK",
        issueDetail: "leak from indoor unit",
        repairStatus: "DONE",
      },
    );

    expect(writes).toHaveLength(1);
    expect(latestIssueUpdates).toEqual([
      {
        unitId: "BC01-CT-01",
        summary: "leak from indoor unit",
      },
    ]);
    expect(result.latestIssueSummary).toBe("leak from indoor unit");
  });

  it("rejects invalid parsed input before any writes", async () => {
    const createRepairLog = vi.fn();
    const updateUnitLatestIssueSummary = vi.fn();
    const deleteRepairLog = vi.fn();

    await expect(
      saveRepairLog(
        {
          createRepairLog,
          updateUnitLatestIssueSummary,
          deleteRepairLog,
        },
        {
          branchCode: "BC01",
          unitId: "BC01-CT-01",
          serviceDate: "2026-02-31",
          issueCategory: "WATER_LEAK",
          issueDetail: "leak from indoor unit",
          repairStatus: "DONE",
        },
      ),
    ).rejects.toThrow("serviceDate must be a valid YYYY-MM-DD date");

    expect(createRepairLog).not.toHaveBeenCalled();
    expect(updateUnitLatestIssueSummary).not.toHaveBeenCalled();
    expect(deleteRepairLog).not.toHaveBeenCalled();
  });

  it("propagates create failures without attempting follow-up writes", async () => {
    const createError = new Error("create failed");
    const updateUnitLatestIssueSummary = vi.fn();
    const deleteRepairLog = vi.fn();

    await expect(
      saveRepairLog(
        {
          createRepairLog: vi.fn(async () => {
            throw createError;
          }),
          updateUnitLatestIssueSummary,
          deleteRepairLog,
        },
        {
          branchCode: "BC01",
          unitId: "BC01-CT-01",
          serviceDate: "2026-05-18",
          issueCategory: "WATER_LEAK",
          issueDetail: "leak from indoor unit",
          repairStatus: "DONE",
        },
      ),
    ).rejects.toThrow(createError);

    expect(updateUnitLatestIssueSummary).not.toHaveBeenCalled();
    expect(deleteRepairLog).not.toHaveBeenCalled();
  });

  it("compensates by deleting the created repair log if latest issue update fails", async () => {
    const updateError = new Error("update failed");
    const payload = {
      branchCode: "BC01",
      unitId: "BC01-CT-01",
      serviceDate: "2026-05-18",
      issueCategory: "WATER_LEAK" as const,
      issueDetail: "leak from indoor unit",
      repairStatus: "DONE" as const,
    };
    const createRepairLog = vi.fn(async () => {});
    const deleteRepairLog = vi.fn(async () => {});

    await expect(
      saveRepairLog(
        {
          createRepairLog,
          updateUnitLatestIssueSummary: vi.fn(async () => {
            throw updateError;
          }),
          deleteRepairLog,
        },
        payload,
      ),
    ).rejects.toThrow(updateError);

    expect(createRepairLog).toHaveBeenCalledWith(payload);
    expect(deleteRepairLog).toHaveBeenCalledWith(payload);
  });
});
