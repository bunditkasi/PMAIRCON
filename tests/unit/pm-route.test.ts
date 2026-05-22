import { beforeEach, describe, expect, it, vi } from "vitest";

const appendPmLog = vi.fn();
const deletePmLog = vi.fn();
const updateUnitLatestPmDate = vi.fn();
const findExistingPmLog = vi.fn();

vi.mock("../../src/lib/google/sheet-log-writer", () => ({
  createGoogleSheetLogWriter: () => ({
    findExistingPmLog,
    appendPmLog,
    deletePmLog,
    updateUnitLatestPmDate,
  }),
}));

describe("POST /api/pm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findExistingPmLog.mockResolvedValue(false);
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
    expect(payload.status).toBe("saved");
    expect(appendPmLog).toHaveBeenCalledTimes(1);
    expect(updateUnitLatestPmDate).toHaveBeenCalledWith(
      "BC01-CS-01",
      "2026-05-21",
    );
  });

  it("returns duplicate-safe success without appending when a PM log already exists", async () => {
    findExistingPmLog.mockResolvedValue(true);
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
    expect(payload).toEqual({
      latestPmDate: "2026-05-21",
      status: "duplicate",
    });
    expect(appendPmLog).not.toHaveBeenCalled();
    expect(updateUnitLatestPmDate).not.toHaveBeenCalled();
  });
});
