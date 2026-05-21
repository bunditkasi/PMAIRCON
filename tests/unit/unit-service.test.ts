import { describe, expect, it } from "vitest";

import {
  detailPmFixtures,
  detailRepairFixtures,
  detailUnitFixtures,
} from "../../src/lib/fixtures/detail-fixtures";
import {
  assembleUnitDetail,
  findUnitDetail,
} from "../../src/lib/services/unit-service";

describe("assembleUnitDetail", () => {
  it("collects the latest pm and repair entries for a unit", () => {
    const detail = assembleUnitDetail(
      { unitId: "BC01-CT-01", branchCode: "BC01", pmStartMonth: 1 },
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-01-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-05-01", serviceStatus: "DONE" },
      ],
      [
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-03-01",
          issueDetail: "water leak",
          repairStatus: "DONE",
        },
      ],
    );

    expect(detail.latestPm?.serviceDate).toBe("2026-05-01");
    expect(detail.latestRepair?.issueDetail).toBe("water leak");
  });

  it("caps PM and repair tables to the latest 5 rows and adds cycle labels", () => {
    const detail = assembleUnitDetail(
      { unitId: "BC01-CT-01", branchCode: "BC01", pmStartMonth: 1 },
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-09-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-05-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-01-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2025-09-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2025-05-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2025-01-01", serviceStatus: "DONE" },
      ],
      [
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-04-20",
          issueDetail: "fan noise",
          repairStatus: "DONE",
        },
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-03-01",
          issueDetail: "water leak",
          repairStatus: "IN_PROGRESS",
        },
      ],
    );

    expect(detail.pmTableRows).toHaveLength(5);
    expect(detail.pmTableRows[0]).toEqual({
      serviceDate: "2026-09-01",
      serviceStatus: "DONE",
      cycleLabel: "2026 รอบ 3",
    });
    expect(detail.pmTableRows[4]).toEqual({
      serviceDate: "2025-05-01",
      serviceStatus: "DONE",
      cycleLabel: "2025 รอบ 2",
    });
    expect(detail.repairTableRows).toEqual([
      {
        serviceDate: "2026-04-20",
        issueDetail: "fan noise",
        repairStatus: "DONE",
      },
      {
        serviceDate: "2026-03-01",
        issueDetail: "water leak",
        repairStatus: "IN_PROGRESS",
      },
    ]);
    expect(detail.hasPmHistoryTable).toBe(true);
    expect(detail.hasRepairHistoryTable).toBe(true);
  });

  it("keeps non-January PM years under the cycle start year", () => {
    const detail = assembleUnitDetail(
      { unitId: "BE01-AHU-01", branchCode: "BE01", pmStartMonth: 5 },
      [
        { unitId: "BE01-AHU-01", serviceDate: "2026-01-15", serviceStatus: "DONE" },
        { unitId: "BE01-AHU-01", serviceDate: "2025-09-01", serviceStatus: "DONE" },
        { unitId: "BE01-AHU-01", serviceDate: "2025-05-10", serviceStatus: "DONE" },
      ],
      [],
    );

    expect(detail.pmTableRows).toEqual([
      {
        serviceDate: "2026-01-15",
        serviceStatus: "DONE",
        cycleLabel: "2025 รอบ 3",
      },
      {
        serviceDate: "2025-09-01",
        serviceStatus: "DONE",
        cycleLabel: "2025 รอบ 2",
      },
      {
        serviceDate: "2025-05-10",
        serviceStatus: "DONE",
        cycleLabel: "2025 รอบ 1",
      },
    ]);
  });

  it("omits history tables when a unit has no PM or repair history", () => {
    const detail = assembleUnitDetail(
      { unitId: "BC01-CS-01", branchCode: "BC01", pmStartMonth: 2 },
      [],
      [],
    );

    expect(detail.pmTableRows).toEqual([]);
    expect(detail.repairTableRows).toEqual([]);
    expect(detail.hasPmHistoryTable).toBe(false);
    expect(detail.hasRepairHistoryTable).toBe(false);
  });
});

describe("findUnitDetail", () => {
  it("returns null when the unit does not exist", () => {
    expect(
      findUnitDetail("ZZ99", {
        units: detailUnitFixtures,
        pmLogs: detailPmFixtures,
        repairLogs: detailRepairFixtures,
      }),
    ).toBeNull();
  });

  it("returns the matching unit with its latest and full history entries", () => {
    const detail = findUnitDetail("BC01-CT-01", {
      units: detailUnitFixtures,
      pmLogs: detailPmFixtures,
      repairLogs: detailRepairFixtures,
    });

    expect(detail).toEqual({
      unit: { unitId: "BC01-CT-01", branchCode: "BC01" },
      latestPm: { unitId: "BC01-CT-01", serviceDate: "2026-05-01" },
      latestRepair: {
        unitId: "BC01-CT-01",
        serviceDate: "2026-04-20",
        issueDetail: "fan noise",
      },
      pmHistory: [
        { unitId: "BC01-CT-01", serviceDate: "2026-05-01" },
        { unitId: "BC01-CT-01", serviceDate: "2026-01-01" },
      ],
      repairHistory: [
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-04-20",
          issueDetail: "fan noise",
        },
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-03-01",
          issueDetail: "water leak",
        },
      ],
      pmTableRows: [
        {
          serviceDate: "2026-05-01",
          serviceStatus: "DONE",
          cycleLabel: "2026 รอบ 2",
        },
        {
          serviceDate: "2026-01-01",
          serviceStatus: "DONE",
          cycleLabel: "2026 รอบ 1",
        },
      ],
      repairTableRows: [
        {
          serviceDate: "2026-04-20",
          issueDetail: "fan noise",
          repairStatus: "PENDING",
        },
        {
          serviceDate: "2026-03-01",
          issueDetail: "water leak",
          repairStatus: "PENDING",
        },
      ],
      hasPmHistoryTable: true,
      hasRepairHistoryTable: true,
    });
  });

  it("uses the caller-supplied pmStartMonth when building table rows", () => {
    const detail = findUnitDetail("BE01-AHU-01", {
      units: [
        {
          unitId: "BE01-AHU-01",
          branchCode: "BE01",
          pmStartMonth: 5,
        },
      ],
      pmLogs: [
        {
          unitId: "BE01-AHU-01",
          serviceDate: "2026-01-15",
          serviceStatus: "DONE",
        },
      ],
      repairLogs: [],
    });

    expect(detail?.pmTableRows).toEqual([
      {
        serviceDate: "2026-01-15",
        serviceStatus: "DONE",
        cycleLabel: "2025 รอบ 3",
      },
    ]);
  });

  it("returns a unit detail with no PM history when the unit has no PM logs", () => {
    const detail = findUnitDetail("BC01-CS-01", {
      units: detailUnitFixtures,
      pmLogs: detailPmFixtures,
      repairLogs: detailRepairFixtures,
    });

    expect(detail).toEqual({
      unit: { unitId: "BC01-CS-01", branchCode: "BC01" },
      latestPm: null,
      latestRepair: null,
      pmHistory: [],
      repairHistory: [],
      pmTableRows: [],
      repairTableRows: [],
      hasPmHistoryTable: false,
      hasRepairHistoryTable: false,
    });
  });

  it("returns a unit detail with no repair history when the unit has no repair logs", () => {
    const detail = findUnitDetail("BC01-CT-02", {
      units: detailUnitFixtures,
      pmLogs: detailPmFixtures,
      repairLogs: detailRepairFixtures,
    });

    expect(detail).toEqual({
      unit: { unitId: "BC01-CT-02", branchCode: "BC01" },
      latestPm: { unitId: "BC01-CT-02", serviceDate: "2026-04-15" },
      latestRepair: null,
      pmHistory: [{ unitId: "BC01-CT-02", serviceDate: "2026-04-15" }],
      repairHistory: [],
      pmTableRows: [
        {
          serviceDate: "2026-04-15",
          serviceStatus: "DONE",
          cycleLabel: "2026 รอบ 1",
        },
      ],
      repairTableRows: [],
      hasPmHistoryTable: true,
      hasRepairHistoryTable: false,
    });
  });
});

describe("service date ordering", () => {
  it("orders realistic service dates by actual chronology instead of raw string comparison", () => {
    const detail = assembleUnitDetail(
      { unitId: "BC01-CT-01", branchCode: "BC01", pmStartMonth: 1 },
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-5-2", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-11-01", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-01-15", serviceStatus: "DONE" },
      ],
      [],
    );

    expect(detail.latestPm?.serviceDate).toBe("2026-11-01");
    expect(detail.pmHistory.map((item) => item.serviceDate)).toEqual([
      "2026-11-01",
      "2026-5-2",
      "2026-01-15",
    ]);
  });

  it("pushes malformed calendar dates behind valid service dates instead of normalizing them", () => {
    const detail = assembleUnitDetail(
      { unitId: "BC01-CT-01", branchCode: "BC01", pmStartMonth: 1 },
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-02-31", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-02-28", serviceStatus: "DONE" },
        { unitId: "BC01-CT-01", serviceDate: "2026-03-01", serviceStatus: "DONE" },
      ],
      [],
    );

    expect(detail.latestPm?.serviceDate).toBe("2026-03-01");
    expect(detail.pmHistory.map((item) => item.serviceDate)).toEqual([
      "2026-03-01",
      "2026-02-28",
      "2026-02-31",
    ]);
    expect(detail.pmTableRows.map((item) => item.cycleLabel)).toEqual([
      "2026 รอบ 1",
      "2026 รอบ 1",
      "2026 รอบ 1",
    ]);
  });
});
