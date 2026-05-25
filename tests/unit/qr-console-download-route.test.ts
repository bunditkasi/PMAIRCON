import { beforeEach, describe, expect, it, vi } from "vitest";

const runQrConsoleExport = vi.fn();

vi.mock("../../src/lib/qr/export-console", () => ({
  runQrConsoleExport,
}));

describe("GET /api/qr-console/download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates and serves a branch manifest asset", async () => {
    runQrConsoleExport.mockResolvedValue({
      branchCount: 2,
      unitCount: 0,
      skippedBranchCount: 0,
      skippedUnitCount: 0,
      outputRoot: "/tmp/qr-console-downloads/test",
      assetSummary: {
        branches: {
          pngCount: 2,
          pdfPath: null,
          pngDirectory: "/tmp/qr-console-downloads/test/branches",
          zipPath: null,
          manifestPath: "tests/fixtures/qr-console/sample.manifest.json",
        },
        units: null,
      },
    });

    const { GET } = await import("../../src/app/api/qr-console/download/route");
    const response = await GET(
      new Request(
        "http://localhost/api/qr-console/download?asset=branchManifest&region=East&branchCodes=BE01,BE03",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(runQrConsoleExport).toHaveBeenCalledWith({
      region: "East",
      branchCodes: ["BE01", "BE03"],
      mode: "branches",
      zipOutputs: true,
    });
  });

  it("rejects invalid asset types", async () => {
    const { GET } = await import("../../src/app/api/qr-console/download/route");
    const response = await GET(
      new Request(
        "http://localhost/api/qr-console/download?asset=../../secret.txt",
      ),
    );

    expect(response.status).toBe(400);
  });
});
