import { describe, expect, it } from "vitest";

import { buildQuarterYear, buildUnitId } from "../../src/lib/domain/ids";
import type { UnitCode } from "../../src/lib/domain/types";

describe("buildUnitId", () => {
  it("builds a zero-padded CT unit id", () => {
    expect(buildUnitId("BC01", "CT", 1)).toBe("BC01-CT-01");
  });

  it("builds a double-digit CS unit id", () => {
    expect(buildUnitId("BC01", "CS", 12)).toBe("BC01-CS-12");
  });

  it("supports CUR ids for upcoming aggregate generation", () => {
    expect(buildUnitId("BC01", "CUR", 3)).toBe("BC01-CUR-03");
  });

  it("rejects non-positive sequences", () => {
    expect(() => buildUnitId("BC01", "CT", 0)).toThrowError(
      "Invalid unit sequence: 0",
    );
  });

  it("rejects unsupported runtime unit codes", () => {
    expect(() => buildUnitId("BC01", "XX" as UnitCode, 1)).toThrowError(
      "Unsupported unit code: XX",
    );
  });
});

describe("buildQuarterYear", () => {
  it("returns Q1 for a February date", () => {
    expect(buildQuarterYear(new Date("2026-02-15"))).toBe("2026-Q1");
  });

  it("returns Q4 for an October date", () => {
    expect(buildQuarterYear(new Date("2026-10-15"))).toBe("2026-Q4");
  });

  it("uses UTC boundaries so the same instant stays in the same quarter everywhere", () => {
    expect(buildQuarterYear(new Date("2026-03-31T23:30:00-05:00"))).toBe(
      "2026-Q2",
    );
  });

  it("rejects invalid dates", () => {
    expect(() => buildQuarterYear(new Date("invalid"))).toThrowError(
      "Invalid date",
    );
  });
});
