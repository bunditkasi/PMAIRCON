import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import { importBranchesFromExcel } from "../../scripts/import-source-data";
import { mapSourceRowToBranch } from "../../src/lib/services/seed-import-service";

describe("mapSourceRowToBranch", () => {
  it("normalizes source branch fields", () => {
    const branch = mapSourceRowToBranch({
      Code: "BC01",
      "Outlet Name": "SAPS",
      "Code-Name": "BC01 SAPS",
      State: "Saraburi",
      Region: "Central",
      Senior: "Apisit Neerawong",
      Suplier: "Klangsub Engineer",
      Month: 3,
      Curtain: 0,
      AHU: 0,
      "Ceiling Type": 6,
      "cassette type": 0,
    });

    expect(branch.branchCode).toBe("BC01");
    expect(branch.pmStartMonth).toBe(3);
    expect(branch.ceilingTypeCount).toBe(6);
  });

  it("imports normalized branch rows from an Excel worksheet path", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "seed-import-service-"));
    const workbookPath = join(tempDir, "branches.xlsx");

    try {
      const worksheet = XLSX.utils.json_to_sheet([
        {
          Code: "BC01",
          "Outlet Name": "SAPS",
          "Code-Name": "BC01 SAPS",
          State: "Saraburi",
          Region: "Central",
          Senior: "Apisit Neerawong",
          Suplier: "Klangsub Engineer",
          Month: 3,
          Curtain: 0,
          AHU: 0,
          "Ceiling Type": 6,
          "cassette type": 0,
        },
      ]);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Branches");
      XLSX.writeFile(workbook, workbookPath);

      await expect(importBranchesFromExcel(workbookPath)).resolves.toEqual([
        expect.objectContaining({
          branchCode: "BC01",
          pmStartMonth: 3,
          ceilingTypeCount: 6,
        }),
      ]);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
