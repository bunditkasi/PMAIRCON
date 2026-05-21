import { describe, expect, it } from "vitest";
import { vi } from "vitest";

import type { RecordReplacementInput } from "../../src/lib/services/replacement-service";
import { recordReplacement } from "../../src/lib/services/replacement-service";

describe("recordReplacement", () => {
  it("records the replacement and marks the old unit as replaced", async () => {
    const writes: unknown[] = [];

    const result = await recordReplacement(
      {
        createReplacementRecord: async (payload) => {
          writes.push(payload);
          return undefined;
        },
        deleteReplacementRecord: async () => undefined,
        markUnitReplaced: async () => {},
        createNewUnit: async () => undefined,
        deleteNewUnit: async () => undefined,
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

  it("rolls back the replacement record if creating the successor unit fails", async () => {
    const payload: RecordReplacementInput = {
      oldUnitId: "BC01-CT-01",
      branchCode: "BC01",
      decisionDate: "2026-05-18",
      reason: "repair not economical",
      newUnitId: "BC01-CT-01R",
    };
    const deleteReplacementRecord = vi.fn(async () => undefined);

    await expect(
      recordReplacement(
        {
          createReplacementRecord: async () => ({ rowIndex: 3 }),
          deleteReplacementRecord,
          markUnitReplaced: async () => undefined,
          createNewUnit: async () => {
            throw new Error("new unit failed");
          },
          deleteNewUnit: async () => undefined,
        },
        payload,
      ),
    ).rejects.toThrow("new unit failed");

    expect(deleteReplacementRecord).toHaveBeenCalledWith(payload, {
      rowIndex: 3,
    });
  });

  it("rolls back the replacement record and created unit if marking old unit fails", async () => {
    const payload: RecordReplacementInput = {
      oldUnitId: "BC01-CT-01",
      branchCode: "BC01",
      decisionDate: "2026-05-18",
      reason: "repair not economical",
      newUnitId: "BC01-CT-01R",
    };
    const deleteReplacementRecord = vi.fn(async () => undefined);
    const deleteNewUnit = vi.fn(async () => undefined);

    await expect(
      recordReplacement(
        {
          createReplacementRecord: async () => ({ rowIndex: 3 }),
          deleteReplacementRecord,
          markUnitReplaced: async () => {
            throw new Error("mark old failed");
          },
          createNewUnit: async () => ({ rowIndex: 5 }),
          deleteNewUnit,
        },
        payload,
      ),
    ).rejects.toThrow("mark old failed");

    expect(deleteNewUnit).toHaveBeenCalledWith(payload, { rowIndex: 5 });
    expect(deleteReplacementRecord).toHaveBeenCalledWith(payload, {
      rowIndex: 3,
    });
  });
});
