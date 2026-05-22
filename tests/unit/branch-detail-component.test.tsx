import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BranchDetail } from "../../src/features/branches/branch-detail";

describe("BranchDetail", () => {
  it("renders branch identity and unit links", () => {
    render(
      <BranchDetail
        detail={{
          branch: {
            branchCode: "BC01",
            outletName: "SAPS",
            supplierName: "Klangsub Engineer",
            fullStoreName: "Seacon Bangkae, Bangkok",
            state: "Bangkok",
            startBusinessDate: "2016-01-15",
          },
          units: [
            { branchCode: "BC01", unitId: "BC01-CS-01" },
            { branchCode: "BC01", unitId: "BC01-CT-01" },
          ],
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "BC01" })).toBeInTheDocument();
    expect(
      screen.getByText("Seacon Bangkae, Bangkok, Bangkok"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Start business:/i)).toBeInTheDocument();
    expect(screen.getByText(/Klangsub Engineer/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "BC01-CS-01" }),
    ).toBeInTheDocument();
  });
});
