import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UnitDetail } from "../../src/features/units/unit-detail";

describe("UnitDetail", () => {
  it("renders latest PM, latest repair, and action links", () => {
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
        }}
      />,
    );

    expect(screen.getByText("Latest PM")).toBeInTheDocument();
    expect(screen.getByText("Water leak")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Submit PM" })).toBeInTheDocument();
  });
});
