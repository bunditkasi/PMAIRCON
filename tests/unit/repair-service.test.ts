import { describe, expect, it } from "vitest";

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
});
