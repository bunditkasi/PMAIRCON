import { describe, expect, it } from "vitest";

import {
  mapSheetRowsToCollections,
  readGoogleSheetsRuntimeConfig,
  rowsToObjects,
} from "../../src/lib/google/sheets-live";

describe("rowsToObjects", () => {
  it("maps header rows into trimmed object records", () => {
    expect(
      rowsToObjects([
        ["branch_code", "outlet_name"],
        ["BC01", " SAPS "],
      ]),
    ).toEqual([{ branch_code: "BC01", outlet_name: "SAPS" }]);
  });
});

describe("mapSheetRowsToCollections", () => {
  it("builds app collections from Google Sheet row arrays", () => {
    const collections = mapSheetRowsToCollections({
      branches: [
        ["branch_code", "outlet_name", "supplier_name"],
        ["BC01", "SAPS", "Klangsub Engineer"],
      ],
      units: [
        ["unit_id", "branch_code"],
        ["BC01-CT-01", "BC01"],
      ],
      pmLogs: [
        ["unit_id", "service_date"],
        ["BC01-CT-01", "2026-05-18"],
      ],
      repairLogs: [
        ["unit_id", "service_date", "issue_detail", "repair_status"],
        ["BC01-CT-01", "2026-05-01", "water leak", "IN_PROGRESS"],
      ],
    });

    expect(collections).toEqual({
      branches: [
        {
          branchCode: "BC01",
          outletName: "SAPS",
          supplierName: "Klangsub Engineer",
        },
      ],
      units: [{ unitId: "BC01-CT-01", branchCode: "BC01" }],
      pmLogs: [{ unitId: "BC01-CT-01", serviceDate: "2026-05-18" }],
      repairLogs: [
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-05-01",
          issueDetail: "water leak",
          repairStatus: "IN_PROGRESS",
        },
      ],
    });
  });
});

describe("readGoogleSheetsRuntimeConfig", () => {
  it("returns null when required env values are missing", () => {
    expect(readGoogleSheetsRuntimeConfig({})).toBeNull();
  });
});
