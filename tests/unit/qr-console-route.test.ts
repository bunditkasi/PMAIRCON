import { beforeEach, describe, expect, it, vi } from "vitest";

const runQrConsoleExport = vi.fn();

vi.mock("../../src/lib/qr/export-console", () => ({
  QR_CONSOLE_EXPORT_ROOT: "C:/tmp/qr-console-downloads",
  runQrConsoleExport,
}));

describe("POST /api/qr-console", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runQrConsoleExport.mockResolvedValue({
      branchCount: 10,
      unitCount: 0,
      skippedBranchCount: 0,
      skippedUnitCount: 0,
      outputRoot: "C:/tmp/qr-console-downloads/test",
      assetSummary: {
        branches: {
          pngCount: 10,
          pdfPath: "C:/tmp/qr-console-downloads/test/branch-qr-sheet.pdf",
          pngDirectory: "C:/tmp/qr-console-downloads/test/branches",
          zipPath: "C:/tmp/qr-console-downloads/test/branch-qr-sheet.zip",
          manifestPath:
            "C:/tmp/qr-console-downloads/test/branch-qr-sheet.manifest.json",
        },
        units: null,
      },
    });
  });

  it("returns export download links for a valid request", async () => {
    const { POST } = await import("../../src/app/api/qr-console/route");

    const response = await POST(
      new Request("http://localhost/api/qr-console", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          region: "East",
          branchCodes: "BE01, BE03",
          mode: "branches",
          zipOutputs: true,
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(runQrConsoleExport).toHaveBeenCalledWith({
      region: "East",
      branchCodes: ["BE01", "BE03"],
      zipOutputs: true,
      mode: "branches",
    });
    expect(payload.downloads.branchPdf).toContain("/api/qr-console/download?file=");
    expect(payload.downloads.branchZip).toContain("/api/qr-console/download?file=");
  });

  it("rejects invalid export modes", async () => {
    const { POST } = await import("../../src/app/api/qr-console/route");

    const response = await POST(
      new Request("http://localhost/api/qr-console", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "invalid",
        }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
