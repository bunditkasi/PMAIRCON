import { describe, expect, it } from "vitest";

import { createMemoryStore } from "../../src/lib/storage/memory-store";

describe("createMemoryStore", () => {
  it("saves and retrieves branches and units by their ids", async () => {
    const store = createMemoryStore();

    await store.saveBranch({ branchCode: "BC01", outletName: "SAPS" });
    expect(await store.getBranchByCode("BC01")).toEqual({
      branchCode: "BC01",
      outletName: "SAPS",
    });

    await store.saveUnit({ unitId: "BC01-CT-01", branchCode: "BC01" });
    expect(await store.getUnitById("BC01-CT-01")).toEqual({
      unitId: "BC01-CT-01",
      branchCode: "BC01",
    });
  });

  it("isolates stored branch data from caller mutation after save", async () => {
    const store = createMemoryStore();
    const branch = { branchCode: "BC01", outletName: "SAPS" };

    await store.saveBranch(branch);
    branch.outletName = "Changed";

    expect(await store.getBranchByCode("BC01")).toEqual({
      branchCode: "BC01",
      outletName: "SAPS",
    });
  });

  it("isolates stored unit data from mutations to retrieved objects", async () => {
    const store = createMemoryStore();

    await store.saveUnit({ unitId: "BC01-CT-01", branchCode: "BC01" });

    const savedUnit = await store.getUnitById("BC01-CT-01");
    savedUnit!.branchCode = "BC99";

    expect(await store.getUnitById("BC01-CT-01")).toEqual({
      unitId: "BC01-CT-01",
      branchCode: "BC01",
    });
  });
});
