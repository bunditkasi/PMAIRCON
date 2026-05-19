import { describe, expect, it } from "vitest";

import { expandAggregateUnitIds } from "../../src/lib/domain/units";

describe("expandAggregateUnitIds", () => {
  it("expands aggregate counts into ordered unit ids", () => {
    expect(
      expandAggregateUnitIds({
        branchCode: "BC01",
        curtainCount: 2,
        ahuCount: 1,
        ceilingTypeCount: 2,
        cassetteTypeCount: 1,
      }),
    ).toEqual([
      "BC01-CUR-01",
      "BC01-CUR-02",
      "BC01-AHU-01",
      "BC01-CT-01",
      "BC01-CT-02",
      "BC01-CS-01",
    ]);
  });

  it("skips zero-count types without breaking the generated order", () => {
    expect(
      expandAggregateUnitIds({
        branchCode: "BC01",
        curtainCount: 0,
        ahuCount: 1,
        ceilingTypeCount: 0,
        cassetteTypeCount: 2,
      }),
    ).toEqual(["BC01-AHU-01", "BC01-CS-01", "BC01-CS-02"]);
  });

  it("returns an empty list when all counts are zero", () => {
    expect(
      expandAggregateUnitIds({
        branchCode: "BC01",
        curtainCount: 0,
        ahuCount: 0,
        ceilingTypeCount: 0,
        cassetteTypeCount: 0,
      }),
    ).toEqual([]);
  });

  it("rejects negative imported counts", () => {
    expect(() =>
      expandAggregateUnitIds({
        branchCode: "BC01",
        curtainCount: -1,
        ahuCount: 0,
        ceilingTypeCount: 0,
        cassetteTypeCount: 0,
      }),
    ).toThrowError("Invalid unit count: -1");
  });

  it("rejects non-integer imported counts", () => {
    expect(() =>
      expandAggregateUnitIds({
        branchCode: "BC01",
        curtainCount: 0,
        ahuCount: 1.5,
        ceilingTypeCount: 0,
        cassetteTypeCount: 0,
      }),
    ).toThrowError("Invalid unit count: 1.5");
  });
});
