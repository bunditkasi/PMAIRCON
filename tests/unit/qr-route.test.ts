import { describe, expect, it } from "vitest";

import { buildUnitQrTarget } from "../../src/app/api/qr/unit/[unitId]/route";

describe("buildUnitQrTarget", () => {
  it("builds a unit URL from the configured base url", () => {
    expect(buildUnitQrTarget("https://pm.example.com", "BC01-CT-01")).toBe(
      "https://pm.example.com/units/BC01-CT-01",
    );
  });
});
