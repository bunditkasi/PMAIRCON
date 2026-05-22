import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UnitDetail } from "../../src/features/units/unit-detail";

describe("UnitDetail", () => {
  it("renders latest PM, latest repair, history tables, and action links", () => {
    render(
      <UnitDetail
        detail={{
          unit: { unitId: "BC01-CS-01", branchCode: "BC01" },
          latestPm: { unitId: "BC01-CS-01", serviceDate: "2026-05-19" },
          latestRepair: {
            unitId: "BC01-CS-01",
            serviceDate: "2026-05-18",
            issueDetail: "Water leak",
          },
          pmHistory: [{ unitId: "BC01-CS-01", serviceDate: "2026-05-19" }],
          repairHistory: [
            {
              unitId: "BC01-CS-01",
              serviceDate: "2026-05-18",
              issueDetail: "Water leak",
            },
          ],
          pmTableRows: [
            {
              serviceDate: "2026-05-19",
              serviceStatus: "DONE",
              cycleLabel: "2026 รอบ 2",
            },
          ],
          repairTableRows: [
            {
              serviceDate: "2026-05-18",
              issueDetail: "Water leak",
              repairStatus: "DONE",
            },
          ],
          hasPmHistoryTable: true,
          hasRepairHistoryTable: true,
        }}
      />,
    );

    expect(screen.getByText("Latest PM")).toBeInTheDocument();
    expect(screen.getAllByText("Water leak")).toHaveLength(2);
    expect(screen.getByText("PM history")).toBeInTheDocument();
    expect(screen.getByText("Repair history")).toBeInTheDocument();
    expect(screen.getByText("2026 รอบ 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Submit PM" })).toHaveAttribute(
      "href",
      "/units/BC01-CS-01/pm/new",
    );
    expect(
      screen.getByRole("link", { name: "Submit repair" }),
    ).toHaveAttribute("href", "/units/BC01-CS-01/repair/new");
    expect(
      screen.getByRole("link", { name: "Record replacement" }),
    ).toHaveAttribute("href", "/admin/replacements/new?oldUnitId=BC01-CS-01");
  });

  it("omits each history section when its table flag is false", () => {
    render(
      <UnitDetail
        detail={{
          unit: { unitId: "BC01-CS-02", branchCode: "BC01" },
          latestPm: null,
          latestRepair: null,
          pmHistory: [],
          repairHistory: [],
          pmTableRows: [],
          repairTableRows: [],
          hasPmHistoryTable: false,
          hasRepairHistoryTable: false,
        }}
      />,
    );

    expect(screen.queryByText("PM history")).not.toBeInTheDocument();
    expect(screen.queryByText("Repair history")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Submit PM" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Submit repair" }),
    ).toBeInTheDocument();
  });

  it("renders only the available history table when one side is empty", () => {
    render(
      <UnitDetail
        detail={{
          unit: { unitId: "BC01-CS-03", branchCode: "BC01" },
          latestPm: { unitId: "BC01-CS-03", serviceDate: "2026-06-01" },
          latestRepair: null,
          pmHistory: [{ unitId: "BC01-CS-03", serviceDate: "2026-06-01" }],
          repairHistory: [],
          pmTableRows: [
            {
              serviceDate: "2026-06-01",
              serviceStatus: "DONE",
              cycleLabel: "2026 รอบ 2",
            },
          ],
          repairTableRows: [],
          hasPmHistoryTable: true,
          hasRepairHistoryTable: false,
        }}
      />,
    );

    expect(screen.getByText("PM history")).toBeInTheDocument();
    expect(screen.queryByText("Repair history")).not.toBeInTheDocument();
  });
});
