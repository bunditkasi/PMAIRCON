import { beforeEach, describe, expect, it, vi } from "vitest";

const appendReplacementRecord = vi.fn();
const deleteReplacementRecord = vi.fn();
const markUnitReplaced = vi.fn();
const createReplacementUnit = vi.fn();
const deleteReplacementUnit = vi.fn();

vi.mock("../../src/lib/google/sheet-log-writer", () => ({
  createGoogleSheetLogWriter: () => ({
    appendReplacementRecord,
    deleteReplacementRecord,
    markUnitReplaced,
    createReplacementUnit,
    deleteReplacementUnit,
  }),
}));

describe("POST /api/replacements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appendReplacementRecord.mockResolvedValue({ rowIndex: 2 });
    deleteReplacementRecord.mockResolvedValue(undefined);
    markUnitReplaced.mockResolvedValue(undefined);
    createReplacementUnit.mockResolvedValue({ rowIndex: 3 });
    deleteReplacementUnit.mockResolvedValue(undefined);
  });

  it("records a replacement and returns the replaced status", async () => {
    const { POST } = await import("../../src/app/api/replacements/route");

    const response = await POST(
      new Request("http://localhost/api/replacements", {
        method: "POST",
        body: JSON.stringify({
          oldUnitId: "BC01-CS-01",
          branchCode: "BC01",
          decisionDate: "2026-05-21",
          reason: "repair not economical",
          newUnitId: "BC01-CS-01R",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.oldUnitStatus).toBe("REPLACED");
    expect(markUnitReplaced).toHaveBeenCalledWith(
      "BC01-CS-01",
      "repair not economical",
    );
  });
});
