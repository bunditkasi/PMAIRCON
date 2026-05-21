import { beforeEach, describe, expect, it, vi } from "vitest";

const appendPmLog = vi.fn();
const deletePmLog = vi.fn();
const updateUnitLatestPmDate = vi.fn();

vi.mock("../../src/lib/google/sheet-log-writer", () => ({
  createGoogleSheetLogWriter: () => ({
    appendPmLog,
    deletePmLog,
    updateUnitLatestPmDate,
  }),
}));

describe("POST /api/pm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appendPmLog.mockResolvedValue({ rowIndex: 2 });
    deletePmLog.mockResolvedValue(undefined);
    updateUnitLatestPmDate.mockResolvedValue(undefined);
  });

  it("saves a PM log and returns the latest PM date", async () => {
    const { POST } = await import("../../src/app/api/pm/route");

    const response = await POST(
      new Request("http://localhost/api/pm", {
        method: "POST",
        body: JSON.stringify({
          branchCode: "BC01",
          unitId: "BC01-CS-01",
          serviceDate: "2026-05-21",
          technicianName: "Somchai",
          supplierName: "Klangsub Engineer",
          serviceStatus: "DONE",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.latestPmDate).toBe("2026-05-21");
    expect(appendPmLog).toHaveBeenCalledTimes(1);
    expect(updateUnitLatestPmDate).toHaveBeenCalledWith(
      "BC01-CS-01",
      "2026-05-21",
    );
  });
});
