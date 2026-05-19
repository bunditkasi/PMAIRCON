import { describe, expect, it } from "vitest";

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
  const units = [
    { unitId: "BC01-CT-01", branchCode: "BC01" },
    { unitId: "BC01-CT-02", branchCode: "BC01" },
  ];

  const pmLogs = [
    { unitId: "BC01-CT-01", serviceDate: "2026-01-01" },
    { unitId: "BC01-CT-01", serviceDate: "2026-05-01" },
    { unitId: "BC01-CT-02", serviceDate: "2026-04-15" },
  ];

  const repairLogs = [
    {
      unitId: "BC01-CT-01",
      serviceDate: "2026-03-01",
      issueDetail: "water leak",
    },
    {
      unitId: "BC01-CT-01",
      serviceDate: "2026-04-20",
      issueDetail: "fan noise",
    },
  ];

  it("returns null when the unit does not exist", () => {
    expect(findUnitDetail("ZZ99", { units, pmLogs, repairLogs })).toBeNull();
  });

  it("returns the matching unit with its latest and full history entries", () => {
    const detail = findUnitDetail("BC01-CT-01", { units, pmLogs, repairLogs });

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
});
