import { describe, expect, it } from "vitest";

import { recordReplacement } from "../../src/lib/services/replacement-service";

describe("recordReplacement", () => {
  it("records the replacement and marks the old unit as replaced", async () => {
    const writes: unknown[] = [];

    const result = await recordReplacement(
      {
        createReplacementRecord: async (payload) => {
          writes.push(payload);
        },
        markUnitReplaced: async () => {},
        createNewUnit: async () => {},
      },
      {
        oldUnitId: "BC01-CT-01",
        branchCode: "BC01",
        decisionDate: "2026-05-18",
        reason: "repair not economical",
        newUnitId: "BC01-CT-01R",
      },
    );

    expect(writes).toHaveLength(1);
    expect(result.oldUnitStatus).toBe("REPLACED");
  });
});
