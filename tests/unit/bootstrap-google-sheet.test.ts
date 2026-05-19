import { describe, expect, it } from "vitest";

import { requiredSheetTabs } from "../../scripts/bootstrap-google-sheet";

describe("requiredSheetTabs", () => {
  it("lists all required tabs for the MVP", () => {
    expect(requiredSheetTabs).toEqual([
      "Branches",
      "Units",
      "PM_Logs",
      "Repair_Logs",
      "Replacement_History",
      "Lookup",
    ]);
  });
});
