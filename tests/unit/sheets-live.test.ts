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
          region: "",
          pmStartMonth: null,
        },
      ],
      units: [{ unitId: "BC01-CT-01", branchCode: "BC01" }],
      pmLogs: [
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-05-18",
          serviceStatus: "DONE",
        },
      ],
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

  it("dedupes duplicate branches and units by identifier", () => {
    const collections = mapSheetRowsToCollections({
      branches: [
        ["branch_code", "outlet_name", "supplier_name"],
        ["BC01", "SAPS", "Supplier A"],
        ["BC01", "SAPS", "Supplier A"],
        ["BC02", "BANG", "Supplier B"],
      ],
      units: [
        ["unit_id", "branch_code"],
        ["BC01-CT-01", "BC01"],
        ["BC01-CT-01", "BC01"],
        ["BC02-CS-01", "BC02"],
      ],
      pmLogs: [["unit_id", "service_date"]],
      repairLogs: [["unit_id", "service_date", "issue_detail", "repair_status"]],
    });

    expect(collections.branches).toEqual([
      {
        branchCode: "BC01",
        outletName: "SAPS",
        supplierName: "Supplier A",
        region: "",
        pmStartMonth: null,
      },
      {
        branchCode: "BC02",
        outletName: "BANG",
        supplierName: "Supplier B",
        region: "",
        pmStartMonth: null,
      },
    ]);
    expect(collections.units).toEqual([
      { unitId: "BC01-CT-01", branchCode: "BC01" },
      { unitId: "BC02-CS-01", branchCode: "BC02" },
    ]);
  });

  it("includes region, pmStartMonth, and PM service status in mapped collections", () => {
    const collections = mapSheetRowsToCollections({
      branches: [
        [
          "branch_code",
          "outlet_name",
          "supplier_name",
          "region",
          "pm_start_month",
        ],
        ["BC01", "SAPS", "Klangsub Engineer", "Central", "1"],
      ],
      units: [["unit_id", "branch_code"], ["BC01-CS-01", "BC01"]],
      pmLogs: [
        ["unit_id", "service_date", "service_status"],
        ["BC01-CS-01", "2026-05-21", "DONE"],
      ],
      repairLogs: [
        ["unit_id", "service_date", "issue_detail", "repair_status"],
        ["BC01-CS-01", "2026-05-21", "water leak", "DONE"],
      ],
    });

    expect(collections.branches).toEqual([
      {
        branchCode: "BC01",
        outletName: "SAPS",
        supplierName: "Klangsub Engineer",
        region: "Central",
        pmStartMonth: 1,
      },
    ]);
    expect(collections.pmLogs).toEqual([
      {
        unitId: "BC01-CS-01",
        serviceDate: "2026-05-21",
        serviceStatus: "DONE",
      },
    ]);
  });

  it("maps pmStartMonth from month when pm_start_month is absent", () => {
    const collections = mapSheetRowsToCollections({
      branches: [
        ["branch_code", "outlet_name", "supplier_name", "month"],
        ["BC01", "SAPS", "Klangsub Engineer", "2"],
      ],
      units: [["unit_id", "branch_code"]],
      pmLogs: [["unit_id", "service_date"]],
      repairLogs: [["unit_id", "service_date", "issue_detail", "repair_status"]],
    });

    expect(collections.branches).toEqual([
      {
        branchCode: "BC01",
        outletName: "SAPS",
        supplierName: "Klangsub Engineer",
        region: "",
        pmStartMonth: 2,
      },
    ]);
  });

  it("maps malformed month values to null", () => {
    const collections = mapSheetRowsToCollections({
      branches: [
        ["branch_code", "outlet_name", "supplier_name", "month"],
        ["BC01", "SAPS", "Klangsub Engineer", "2abc"],
        ["BC02", "BANG", "Supplier B", "0"],
        ["BC03", "PATT", "Supplier C", "13"],
      ],
      units: [["unit_id", "branch_code"]],
      pmLogs: [["unit_id", "service_date"]],
      repairLogs: [["unit_id", "service_date", "issue_detail", "repair_status"]],
    });

    expect(collections.branches).toEqual([
      {
        branchCode: "BC01",
        outletName: "SAPS",
        supplierName: "Klangsub Engineer",
        region: "",
        pmStartMonth: null,
      },
      {
        branchCode: "BC02",
        outletName: "BANG",
        supplierName: "Supplier B",
        region: "",
        pmStartMonth: null,
      },
      {
        branchCode: "BC03",
        outletName: "PATT",
        supplierName: "Supplier C",
        region: "",
        pmStartMonth: null,
      },
    ]);
  });
});

describe("readGoogleSheetsRuntimeConfig", () => {
  it("returns null when required env values are missing", () => {
    expect(readGoogleSheetsRuntimeConfig({})).toBeNull();
  });
});
