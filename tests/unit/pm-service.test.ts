import { describe, expect, it, vi } from "vitest";

import { savePmLog } from "../../src/lib/services/pm-service";

describe("savePmLog", () => {
  it("writes a pm log and returns latest pm date", async () => {
    const writes: unknown[] = [];

    const result = await savePmLog(
      {
        findExistingPmLog: async () => false,
        createPmLog: async (payload) => {
          writes.push(payload);
          return undefined;
        },
        deletePmLog: async () => {},
        updateUnitLatestPmDate: async () => {},
      },
      {
        branchCode: "BC01",
        unitId: "BC01-CT-01",
        serviceDate: "2026-05-18",
        technicianName: "Somchai",
        supplierName: "Klangsub Engineer",
        serviceStatus: "DONE",
      },
    );

    expect(writes).toHaveLength(1);
    expect(result.latestPmDate).toBe("2026-05-18");
    expect(result.status).toBe("saved");
  });

  it("returns duplicate without creating a second PM log", async () => {
    const createPmLog = vi.fn();
    const updateUnitLatestPmDate = vi.fn();

    const result = await savePmLog(
      {
        findExistingPmLog: async () => true,
        createPmLog,
        deletePmLog: async () => {},
        updateUnitLatestPmDate,
      },
      {
        branchCode: "BC01",
        unitId: "BC01-CT-01",
        serviceDate: "2026-05-18",
        technicianName: "Somchai",
        supplierName: "Klangsub Engineer",
        serviceStatus: "DONE",
      },
    );

    expect(result).toEqual({
      latestPmDate: "2026-05-18",
      status: "duplicate",
    });
    expect(createPmLog).not.toHaveBeenCalled();
    expect(updateUnitLatestPmDate).not.toHaveBeenCalled();
  });

  it("rejects invalid parsed input before any writes", async () => {
    const createPmLog = vi.fn();
    const updateUnitLatestPmDate = vi.fn();
    const deletePmLog = vi.fn();

    await expect(
      savePmLog(
        {
          findExistingPmLog: async () => false,
          createPmLog,
          updateUnitLatestPmDate,
          deletePmLog,
        },
        {
          branchCode: "BC01",
          unitId: "BC01-CT-01",
          serviceDate: "2026-02-31",
          technicianName: "Somchai",
          supplierName: "Klangsub Engineer",
          serviceStatus: "DONE",
        },
      ),
    ).rejects.toThrow("serviceDate must be a valid YYYY-MM-DD date");

    expect(createPmLog).not.toHaveBeenCalled();
    expect(updateUnitLatestPmDate).not.toHaveBeenCalled();
    expect(deletePmLog).not.toHaveBeenCalled();
  });

  it("propagates create failures without attempting follow-up writes", async () => {
    const createError = new Error("create failed");
    const updateUnitLatestPmDate = vi.fn();
    const deletePmLog = vi.fn();

    await expect(
      savePmLog(
        {
          findExistingPmLog: async () => false,
          createPmLog: vi.fn(async () => {
            throw createError;
          }),
          updateUnitLatestPmDate,
          deletePmLog,
        },
        {
          branchCode: "BC01",
          unitId: "BC01-CT-01",
          serviceDate: "2026-05-18",
          technicianName: "Somchai",
          supplierName: "Klangsub Engineer",
          serviceStatus: "DONE",
        },
      ),
    ).rejects.toThrow(createError);

    expect(updateUnitLatestPmDate).not.toHaveBeenCalled();
    expect(deletePmLog).not.toHaveBeenCalled();
  });

  it("compensates by deleting the created pm log if latest date update fails", async () => {
    const updateError = new Error("update failed");
    const payload = {
      branchCode: "BC01",
      unitId: "BC01-CT-01",
      serviceDate: "2026-05-18",
      technicianName: "Somchai",
      supplierName: "Klangsub Engineer",
      serviceStatus: "DONE" as const,
    };
    const createPmLog = vi.fn(async () => undefined);
    const deletePmLog = vi.fn(async () => undefined);

    await expect(
      savePmLog(
        {
          findExistingPmLog: async () => false,
          createPmLog,
          updateUnitLatestPmDate: vi.fn(async () => {
            throw updateError;
          }),
          deletePmLog,
        },
        payload,
      ),
    ).rejects.toThrow(updateError);

    expect(createPmLog).toHaveBeenCalledWith(payload);
    expect(deletePmLog).toHaveBeenCalledWith(payload, undefined);
  });

  it("passes a rollback token from create to delete when latest date update fails", async () => {
    const payload = {
      branchCode: "BC01",
      unitId: "BC01-CT-01",
      serviceDate: "2026-05-18",
      technicianName: "Somchai",
      supplierName: "Klangsub Engineer",
      serviceStatus: "DONE" as const,
    };
    const deletePmLog = vi.fn(async () => undefined);

    await expect(
      savePmLog(
        {
          findExistingPmLog: async () => false,
          createPmLog: vi.fn(async () => ({ rowIndex: 8 })),
          deletePmLog,
          updateUnitLatestPmDate: vi.fn(async () => {
            throw new Error("update failed");
          }),
        },
        payload,
      ),
    ).rejects.toThrow("update failed");

    expect(deletePmLog).toHaveBeenCalledWith(payload, { rowIndex: 8 });
  });
});
