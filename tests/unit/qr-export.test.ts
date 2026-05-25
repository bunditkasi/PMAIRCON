import { describe, expect, it } from "vitest";

import type { LiveSheetCollections } from "../../src/lib/google/sheets-live";
import {
  buildQrExportRows,
  filterBranchQrExportRows,
  filterUnitQrExportRows,
  formatBranchQrSubtitle,
  formatUnitQrSubtitle,
} from "../../src/lib/qr/export";

describe("qr export helpers", () => {
  it("builds branch and unit export rows from live collections", () => {
    const collections: LiveSheetCollections = {
      branches: [
        {
          branchCode: "BC01",
          outletName: "SAPS",
          supplierName: "Supplier A",
          fullStoreName: "Store A",
          state: "Bangkok",
          startBusinessDate: "2020-01-01",
          mapUrl: "",
          region: "Central",
          pmStartMonth: 1,
        },
      ],
      units: [
        {
          unitId: "BC01-CS-01",
          branchCode: "BC01",
          unitType: "CS",
        },
      ],
      pmLogs: [],
      repairLogs: [],
    };

    const result = buildQrExportRows(collections, "https://example.com");

    expect(result.skippedBranchCount).toBe(0);
    expect(result.skippedUnitCount).toBe(0);
    expect(result.branchRows).toEqual([
      expect.objectContaining({
        branchCode: "BC01",
        title: "BC01",
        subtitle: "SAPS",
        targetUrl: "https://example.com/branches/BC01",
      }),
    ]);
    expect(result.unitRows).toEqual([
      expect.objectContaining({
        unitId: "BC01-CS-01",
        unitType: "CS",
        subtitle: "CS • BC01",
        targetUrl: "https://example.com/units/BC01-CS-01",
      }),
    ]);
  });

  it("filters branch rows by selected branch codes", () => {
    const rows = [
      {
        id: "BC01",
        branchCode: "BC01",
        outletName: "A",
        targetUrl: "https://example.com/branches/BC01",
        fileName: "BC01.png",
        title: "BC01",
        subtitle: "A",
        badge: "BRANCH",
      },
      {
        id: "BE01",
        branchCode: "BE01",
        outletName: "B",
        targetUrl: "https://example.com/branches/BE01",
        fileName: "BE01.png",
        title: "BE01",
        subtitle: "B",
        badge: "BRANCH",
      },
    ];

    expect(filterBranchQrExportRows(rows, ["be01"])).toEqual([rows[1]]);
  });

  it("filters unit rows by selected unit ids or branch codes", () => {
    const rows = [
      {
        id: "BC01-CS-01",
        unitId: "BC01-CS-01",
        unitType: "CS",
        branchCode: "BC01",
        targetUrl: "https://example.com/units/BC01-CS-01",
        fileName: "BC01-CS-01.png",
        title: "BC01-CS-01",
        subtitle: "CS • BC01",
        badge: "UNIT",
      },
      {
        id: "BE01-CT-01",
        unitId: "BE01-CT-01",
        unitType: "CT",
        branchCode: "BE01",
        targetUrl: "https://example.com/units/BE01-CT-01",
        fileName: "BE01-CT-01.png",
        title: "BE01-CT-01",
        subtitle: "CT • BE01",
        badge: "UNIT",
      },
    ];

    expect(filterUnitQrExportRows(rows, { branchCodes: ["bc01"] })).toEqual([rows[0]]);
    expect(filterUnitQrExportRows(rows, { unitIds: ["BE01-CT-01"] })).toEqual([rows[1]]);
  });

  it("formats fallback subtitles safely", () => {
    expect(formatBranchQrSubtitle("")).toBe("UNKNOWN OUTLET");
    expect(formatUnitQrSubtitle("", "BC01")).toBe("UNIT • BC01");
  });
});
