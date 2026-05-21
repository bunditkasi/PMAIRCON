import { beforeEach, describe, expect, it, vi } from "vitest";

const appendRepairLog = vi.fn();
const deleteRepairLog = vi.fn();
const updateUnitLatestRepair = vi.fn();

vi.mock("../../src/lib/google/sheet-log-writer", () => ({
  createGoogleSheetLogWriter: () => ({
    appendRepairLog,
    deleteRepairLog,
    updateUnitLatestRepair,
  }),
}));

describe("POST /api/repair", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appendRepairLog.mockResolvedValue({ rowIndex: 2 });
    deleteRepairLog.mockResolvedValue(undefined);
    updateUnitLatestRepair.mockResolvedValue(undefined);
  });

  it("saves a repair log and returns the latest issue summary", async () => {
    const { POST } = await import("../../src/app/api/repair/route");

    const response = await POST(
      new Request("http://localhost/api/repair", {
        method: "POST",
        body: JSON.stringify({
          branchCode: "BC01",
          unitId: "BC01-CS-01",
          serviceDate: "2026-05-21",
          issueCategory: "WATER_LEAK",
          issueDetail: "Leak from ceiling cassette",
          repairStatus: "DONE",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.latestIssueSummary).toBe("Leak from ceiling cassette");
    expect(appendRepairLog).toHaveBeenCalledTimes(1);
    expect(updateUnitLatestRepair).toHaveBeenCalledWith(
      "BC01-CS-01",
      "2026-05-21",
      "Leak from ceiling cassette",
    );
  });
});
