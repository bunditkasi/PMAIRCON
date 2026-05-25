import { describe, expect, it } from "vitest";

import type { LiveSheetCollections } from "../../src/lib/google/sheets-live";
import { resolveBranchCodes } from "../../src/lib/qr/export-console";

describe("resolveBranchCodes", () => {
  it("resolves branch codes and 4-letter outlet names into branch codes", () => {
    const collections: LiveSheetCollections = {
      branches: [
        {
          branchCode: "BC01",
          outletName: "SAPS",
          supplierName: "",
          fullStoreName: "",
          state: "",
          startBusinessDate: "",
          mapUrl: "",
          region: "Central",
          pmStartMonth: 1,
        },
        {
          branchCode: "BE01",
          outletName: "TCHL",
          supplierName: "",
          fullStoreName: "",
          state: "",
          startBusinessDate: "",
          mapUrl: "",
          region: "East",
          pmStartMonth: 2,
        },
      ],
      units: [],
      pmLogs: [],
      repairLogs: [],
    };

    expect(resolveBranchCodes(collections, ["SAPS", "BE01", "tchl"])).toEqual([
      "BC01",
      "BE01",
    ]);
  });

  it("keeps unknown selectors as-is after normalization", () => {
    const collections: LiveSheetCollections = {
      branches: [],
      units: [],
      pmLogs: [],
      repairLogs: [],
    };

    expect(resolveBranchCodes(collections, [" xyz1 "])).toEqual(["XYZ1"]);
  });
});
