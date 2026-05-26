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
          overdueUnits: 3,
          dueThisMonth: 42,
          dueThisCycle: 120,
          annualCompletionPercent: 76.5,
          currentCycleCompletionPercent: 48.25,
          cycleCompletionPercent: 48.25,
          activeCycleMonth: 2,
          activeRegion: "Central",
          regions: [],
          supplierPerformance: [],
          regionPerformance: [],
          regionSupplierComparison: [],
          branchOperationalRows: [],
          unitOperationalRows: [],
        }}
      />,
    );

    expect(screen.getByText("Overdue units")).toBeInTheDocument();
    expect(screen.getByText("Due this month")).toBeInTheDocument();
    expect(screen.getByText("Due this cycle")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
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
    expect(screen.getByText("Scoped to Central")).toBeInTheDocument();
  });
});
