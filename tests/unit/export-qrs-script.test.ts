import path from "node:path";

import { describe, expect, it } from "vitest";

import { formatSummary, parseExportQrArgs } from "../../scripts/export-qrs";

describe("export-qrs script", () => {
  it("parses branch-only export arguments", () => {
    const options = parseExportQrArgs([
      "--branch-only",
      "--branches=BC01,BE01",
      "--regions=East,Central",
      "--output-dir=tmp/qr-output",
      "--app-base-url=https://example.com",
    ]);

    expect(options.includeBranches).toBe(true);
    expect(options.includeUnits).toBe(false);
    expect(options.branchCodes).toEqual(["BC01", "BE01"]);
    expect(options.regions).toEqual(["East", "Central"]);
    expect(options.unitIds).toEqual([]);
    expect(options.appBaseUrl).toBe("https://example.com");
    expect(options.outputDir).toBe(path.resolve(process.cwd(), "tmp/qr-output"));
    expect(options.zipOutputs).toBe(true);
  });

  it("parses unit-only export arguments", () => {
    const options = parseExportQrArgs([
      "--unit-only",
      "--units=BC01-CS-01,BE01-CT-01",
      "--no-zip",
    ]);

    expect(options.includeBranches).toBe(false);
    expect(options.includeUnits).toBe(true);
    expect(options.unitIds).toEqual(["BC01-CS-01", "BE01-CT-01"]);
    expect(options.zipOutputs).toBe(false);
  });

  it("formats a concise export summary", () => {
    const summary = formatSummary({
      branchCount: 10,
      unitCount: 20,
      skippedBranchCount: 1,
      skippedUnitCount: 2,
      assetSummary: {
        branches: {
          pngCount: 10,
          pdfPath: "output/qrs/branch-qr-sheet.pdf",
          pngDirectory: "output/qrs/branches",
          zipPath: "output/qrs/branch-qr-sheet.zip",
          manifestPath: "output/qrs/branch-qr-sheet.manifest.json",
        },
        units: {
          pngCount: 20,
          pdfPath: "output/qrs/unit-qr-sheet.pdf",
          pngDirectory: "output/qrs/units",
          zipPath: "output/qrs/unit-qr-sheet.zip",
          manifestPath: "output/qrs/unit-qr-sheet.manifest.json",
        },
      },
      regions: ["East"],
    });

    expect(summary).toContain("QR export complete");
    expect(summary).toContain("Regions: East");
    expect(summary).toContain("Branch PNGs: 10");
    expect(summary).toContain("Unit PNGs: 20");
    expect(summary).toContain("Branch ZIP: output/qrs/branch-qr-sheet.zip");
    expect(summary).toContain("Skipped unit rows: 2");
  });
});
