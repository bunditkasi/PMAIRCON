import { describe, expect, it, vi } from "vitest";

import { createGoogleSheetStore } from "../../src/lib/storage/google-sheet-store";

describe("createGoogleSheetStore", () => {
  it("appends branch rows to the Branches sheet in exact order", async () => {
    const appendRow = vi.fn<(
      sheetName: string,
      values: string[],
    ) => Promise<void>>().mockResolvedValue(undefined);
    const findRow = vi.fn().mockResolvedValue(null);
    const store = createGoogleSheetStore({ appendRow, findRow });

    await store.saveBranch({ branchCode: "BC01", outletName: "SAPS" });

    expect(appendRow).toHaveBeenCalledTimes(1);
    expect(appendRow).toHaveBeenCalledWith("Branches", ["BC01", "SAPS"]);
  });

  it("appends unit rows to the Units sheet in exact order", async () => {
    const appendRow = vi.fn<(
      sheetName: string,
      values: string[],
    ) => Promise<void>>().mockResolvedValue(undefined);
    const findRow = vi.fn().mockResolvedValue(null);
    const store = createGoogleSheetStore({ appendRow, findRow });

    await store.saveUnit({ unitId: "BC01-CT-01", branchCode: "BC01" });

    expect(appendRow).toHaveBeenCalledTimes(1);
    expect(appendRow).toHaveBeenCalledWith("Units", [
      "BC01-CT-01",
      "BC01",
    ]);
  });

  it("reads a branch by code from the Branches sheet", async () => {
    const appendRow = vi.fn().mockResolvedValue(undefined);
    const findRow = vi
      .fn<(sheetName: string, key: string) => Promise<string[] | null>>()
      .mockResolvedValue(["BC01", "SAPS"]);
    const store = createGoogleSheetStore({ appendRow, findRow });

    await expect(store.getBranchByCode("BC01")).resolves.toEqual({
      branchCode: "BC01",
      outletName: "SAPS",
    });
    expect(findRow).toHaveBeenCalledTimes(1);
    expect(findRow).toHaveBeenCalledWith("Branches", "BC01");
  });

  it("reads a unit by id from the Units sheet", async () => {
    const appendRow = vi.fn().mockResolvedValue(undefined);
    const findRow = vi
      .fn<(sheetName: string, key: string) => Promise<string[] | null>>()
      .mockResolvedValue(["BC01-CT-01", "BC01"]);
    const store = createGoogleSheetStore({ appendRow, findRow });

    await expect(store.getUnitById("BC01-CT-01")).resolves.toEqual({
      unitId: "BC01-CT-01",
      branchCode: "BC01",
    });
    expect(findRow).toHaveBeenCalledTimes(1);
    expect(findRow).toHaveBeenCalledWith("Units", "BC01-CT-01");
  });

  it("returns null when a branch row is malformed", async () => {
    const appendRow = vi.fn().mockResolvedValue(undefined);
    const findRow = vi
      .fn<(sheetName: string, key: string) => Promise<string[] | null>>()
      .mockResolvedValue(["BC01"]);
    const store = createGoogleSheetStore({ appendRow, findRow });

    await expect(store.getBranchByCode("BC01")).resolves.toBeNull();
  });

  it("returns null when a unit row is malformed", async () => {
    const appendRow = vi.fn().mockResolvedValue(undefined);
    const findRow = vi
      .fn<(sheetName: string, key: string) => Promise<string[] | null>>()
      .mockResolvedValue(["BC01-CT-01"]);
    const store = createGoogleSheetStore({ appendRow, findRow });

    await expect(store.getUnitById("BC01-CT-01")).resolves.toBeNull();
  });

  it("propagates append errors from saveBranch", async () => {
    const expectedError = new Error("append failed");
    const appendRow = vi.fn().mockRejectedValue(expectedError);
    const findRow = vi.fn().mockResolvedValue(null);
    const store = createGoogleSheetStore({ appendRow, findRow });

    await expect(
      store.saveBranch({ branchCode: "BC01", outletName: "SAPS" }),
    ).rejects.toThrow(expectedError);
  });
});
