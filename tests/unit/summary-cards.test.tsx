import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummaryCards } from "../../src/features/dashboard/summary-cards";

describe("SummaryCards", () => {
  it("renders all four operational metrics with readable labels", () => {
    render(
      <SummaryCards
        summary={{
          totalBranches: 955,
          totalUnits: 10925,
          pmLoggedUnits: 14,
          openRepairs: 6,
        }}
      />,
    );

    expect(screen.getByText("Total branches")).toBeInTheDocument();
    expect(screen.getByText("10925")).toBeInTheDocument();
    expect(screen.getByText("Open repairs")).toBeInTheDocument();
  });
});
