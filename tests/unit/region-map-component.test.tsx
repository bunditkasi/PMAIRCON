import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RegionMap } from "../../src/features/dashboard/region-map";

describe("RegionMap", () => {
  it("renders clickable regions, active state, and reset control", () => {
    const onRegionSelect = vi.fn();
    const onReset = vi.fn();

    render(
      <RegionMap
        activeRegion="Central"
        onRegionSelect={onRegionSelect}
        onReset={onReset}
        regions={[
          {
            region: "Central",
            cycleCompletionPercent: 70,
            annualCompletionPercent: 55,
            totalBranches: 12,
            totalUnits: 100,
            requiredCycleJobs: 100,
            completedCycleJobs: 70,
            currentCycleCompletionPercent: 70,
          },
          {
            region: "North",
            cycleCompletionPercent: 30,
            annualCompletionPercent: 40,
            totalBranches: 10,
            totalUnits: 80,
            requiredCycleJobs: 80,
            completedCycleJobs: 24,
            currentCycleCompletionPercent: 30,
          },
        ]}
      />,
    );

    const activeRegionButton = screen.getByRole("button", {
      name: /central region/i,
    });

    expect(
      screen.getByRole("img", { name: /thailand region heatmap/i }),
    ).toBeInTheDocument();
    expect(activeRegionButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /north region/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /north region/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /reset region filter/i }),
    );

    expect(onRegionSelect).toHaveBeenCalledWith("North");
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("uses the approved heatmap anchors and interpolates between them", () => {
    render(
      <RegionMap
        activeRegion={null}
        regions={[
          {
            region: "South",
            cycleCompletionPercent: 0,
            annualCompletionPercent: 10,
            totalBranches: 8,
            totalUnits: 64,
            requiredCycleJobs: 64,
            completedCycleJobs: 0,
            currentCycleCompletionPercent: 0,
          },
          {
            region: "East",
            cycleCompletionPercent: 40,
            annualCompletionPercent: 35,
            totalBranches: 9,
            totalUnits: 72,
            requiredCycleJobs: 72,
            completedCycleJobs: 29,
            currentCycleCompletionPercent: 40,
          },
          {
            region: "West",
            cycleCompletionPercent: 70,
            annualCompletionPercent: 50,
            totalBranches: 11,
            totalUnits: 88,
            requiredCycleJobs: 88,
            completedCycleJobs: 62,
            currentCycleCompletionPercent: 70,
          },
        ]}
      />,
    );

    const zeroPercentRegion = screen.getByRole("button", {
      name: /south region/i,
    });
    const interpolatedRegion = screen.getByRole("button", {
      name: /east region/i,
    });
    const blueAnchorRegion = screen.getByRole("button", {
      name: /west region/i,
    });

    expect(zeroPercentRegion).toHaveStyle({ fill: "#D73027" });
    expect(blueAnchorRegion).toHaveStyle({ fill: "#6CB8FF" });
    expect(interpolatedRegion).toHaveStyle({ fill: "rgb(244, 183, 134)" });
  });
});
