import { describe, expect, it } from "vitest";

import { normalizeDashboardFilters } from "../../src/lib/services/dashboard-filter";

describe("normalizeDashboardFilters", () => {
  it("defaults to the current year and derives the active cycle when month and cycle are missing", () => {
    const filters = normalizeDashboardFilters({}, { today: "2026-05-26" });

    expect(filters.year).toBe(2026);
    expect(filters.month).toBeNull();
    expect(filters.cycle).toBe(1);
  });

  it("clears cycle when month is provided", () => {
    const filters = normalizeDashboardFilters(
      { year: "2026", month: "6", cycle: "2" },
      { today: "2026-05-26" },
    );

    expect(filters.year).toBe(2026);
    expect(filters.month).toBe(6);
    expect(filters.cycle).toBeNull();
  });

  it("keeps the selected cycle when month is missing", () => {
    const filters = normalizeDashboardFilters(
      { year: "2026", cycle: "3", region: "East", supplier: "SS Air Service" },
      { today: "2026-05-26" },
    );

    expect(filters.cycle).toBe(3);
    expect(filters.month).toBeNull();
    expect(filters.region).toBe("East");
    expect(filters.supplier).toBe("SS Air Service");
  });
});
