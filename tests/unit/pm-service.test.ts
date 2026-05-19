import { describe, expect, it } from "vitest";

import { savePmLog } from "../../src/lib/services/pm-service";

describe("savePmLog", () => {
  it("writes a pm log and returns latest pm date", async () => {
    const writes: unknown[] = [];

    const result = await savePmLog(
      {
        createPmLog: async (payload) => {
          writes.push(payload);
        },
        updateUnitLatestPmDate: async () => {},
      },
      {
        branchCode: "BC01",
        unitId: "BC01-CT-01",
        serviceDate: "2026-05-18",
        technicianName: "Somchai",
        supplierName: "Klangsub Engineer",
        serviceStatus: "DONE",
      },
    );

    expect(writes).toHaveLength(1);
    expect(result.latestPmDate).toBe("2026-05-18");
  });
});
