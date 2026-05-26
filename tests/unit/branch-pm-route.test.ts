import { beforeEach, describe, expect, it, vi } from "vitest";

const appendPmLog = vi.fn();
const deletePmLog = vi.fn();
const updateUnitLatestPmDate = vi.fn();
const findExistingPmLog = vi.fn();
const loadAppDataCollections = vi.fn();

vi.mock("../../src/lib/google/sheet-log-writer", () => ({
  createGoogleSheetLogWriter: () => ({
    findExistingPmLog,
    appendPmLog,
    deletePmLog,
    updateUnitLatestPmDate,
  }),
}));

vi.mock("../../src/lib/services/app-data", () => ({
  loadAppDataCollections,
}));

describe("POST /api/pm/branch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findExistingPmLog
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    appendPmLog.mockResolvedValue({ rowIndex: 2 });
    deletePmLog.mockResolvedValue(undefined);
    updateUnitLatestPmDate.mockResolvedValue(undefined);
    loadAppDataCollections.mockResolvedValue({
      branches: [],
      units: [
        { branchCode: "B007", unitId: "B007-CUR-01" },
        { branchCode: "B007", unitId: "B007-CT-01" },
      ],
      pmLogs: [],
      repairLogs: [],
    });
  });

  it("saves PM logs for all units in the branch and returns counts", async () => {
    const { POST } = await import("../../src/app/api/pm/branch/route");

    const response = await POST(
      new Request("http://localhost/api/pm/branch", {
        method: "POST",
        body: JSON.stringify({
          branchCode: "B007",
          serviceDate: "2026-05-26",
          technicianName: "Somchai",
          supplierName: "Nisa Really Cool",
          serviceStatus: "DONE",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      branchCode: "B007",
      serviceDate: "2026-05-26",
      totalUnits: 2,
      savedCount: 1,
      duplicateCount: 1,
      status: "saved",
    });
    expect(appendPmLog).toHaveBeenCalledTimes(1);
    expect(updateUnitLatestPmDate).toHaveBeenCalledWith(
      "B007-CUR-01",
      "2026-05-26",
    );
  });
});
