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
      { unitId: "BC01-CT-01", branchCode: "BC01" },
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-01-01" },
        { unitId: "BC01-CT-01", serviceDate: "2026-05-01" },
      ],
      [
        {
          unitId: "BC01-CT-01",
          serviceDate: "2026-03-01",
          issueDetail: "water leak",
        },
      ],
    );

    expect(detail.latestPm?.serviceDate).toBe("2026-05-01");
    expect(detail.latestRepair?.issueDetail).toBe("water leak");
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
    });
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
    });
  });
});

describe("service date ordering", () => {
  it("orders realistic service dates by actual chronology instead of raw string comparison", () => {
    const detail = assembleUnitDetail(
      { unitId: "BC01-CT-01", branchCode: "BC01" },
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-5-2" },
        { unitId: "BC01-CT-01", serviceDate: "2026-11-01" },
        { unitId: "BC01-CT-01", serviceDate: "2026-01-15" },
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
      { unitId: "BC01-CT-01", branchCode: "BC01" },
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-02-31" },
        { unitId: "BC01-CT-01", serviceDate: "2026-02-28" },
        { unitId: "BC01-CT-01", serviceDate: "2026-03-01" },
      ],
      [],
    );

    expect(detail.latestPm?.serviceDate).toBe("2026-03-01");
    expect(detail.pmHistory.map((item) => item.serviceDate)).toEqual([
      "2026-03-01",
      "2026-02-28",
      "2026-02-31",
    ]);
  });
});
