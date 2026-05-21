import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummaryCards } from "../../src/features/dashboard/summary-cards";

describe("SummaryCards", () => {
  it("renders mapped metric values with direct completion-support copy", () => {
    render(
      <SummaryCards
        summary={{
          totalBranches: 955,
          totalUnits: 10925,
          pmLoggedUnits: 14,
          openRepairs: 6,
          annualCompletionPercent: 76.5,
          currentCycleCompletionPercent: 48.25,
          activeCycleMonth: 2,
          activeRegion: null,
          regions: [],
        }}
      />,
    );

    expect(screen.getByText("Total branches")).toBeInTheDocument();
    expect(screen.getByText("10925")).toBeInTheDocument();
    expect(screen.getByText("PM logged units")).toBeInTheDocument();
    expect(screen.getByText("Open repairs")).toBeInTheDocument();
    expect(screen.getByText("Annual PM completion")).toBeInTheDocument();
    expect(screen.getByText("76.5%")).toBeInTheDocument();
    expect(
      screen.getByText("Share of required PM visits completed this year"),
    ).toBeInTheDocument();
    expect(screen.getByText("Current cycle completion")).toBeInTheDocument();
    expect(screen.getByText("48.25%")).toBeInTheDocument();
    expect(
      screen.getByText("Cycle 2 progress across active units"),
    ).toBeInTheDocument();
  });
});
