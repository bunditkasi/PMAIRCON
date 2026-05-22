import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegionMap } from "../../src/features/dashboard/region-map";

describe("RegionMap", () => {
  it("renders accessible mapped and supplemental region links plus reset navigation", () => {
    render(
      <RegionMap
        activeRegion="Central"
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
          {
            region: "Bangkok",
            cycleCompletionPercent: 82,
            annualCompletionPercent: 61,
            totalBranches: 7,
            totalUnits: 44,
            requiredCycleJobs: 44,
            completedCycleJobs: 36,
            currentCycleCompletionPercent: 82,
          },
          {
            region: "Metro",
            cycleCompletionPercent: 80,
            annualCompletionPercent: 60,
            totalBranches: 5,
            totalUnits: 25,
            requiredCycleJobs: 25,
            completedCycleJobs: 20,
            currentCycleCompletionPercent: 80,
          },
        ]}
      />,
    );

    const activeRegionLink = screen.getByRole("link", { name: /central region/i });
    const northRegionLink = screen.getByRole("link", { name: /north region/i });
    const bangkokRegionLink = screen.getByRole("link", { name: /bangkok region/i });
    const metroRegionLink = screen.getByRole("link", { name: /metro current cycle 80%/i });
    const resetLink = screen.getByRole("link", { name: /reset region filter/i });

    expect(
      screen.getByRole("img", { name: /thailand region heatmap/i }),
    ).toBeInTheDocument();
    expect(activeRegionLink).toHaveAttribute("aria-current", "page");
    expect(activeRegionLink).toHaveAttribute("href", "/dashboard");
    expect(northRegionLink).toHaveAttribute("href", "/dashboard?region=North");
    expect(bangkokRegionLink).toHaveAttribute("href", "/dashboard?region=Bangkok");
    expect(metroRegionLink).toHaveAttribute("href", "/dashboard?region=Metro");
    expect(resetLink).toHaveAttribute("href", "/dashboard");
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

    const zeroPercentRegion = screen.getByRole("link", {
      name: /south region/i,
    });
    const interpolatedRegion = screen.getByRole("link", {
      name: /east region/i,
    });
    const blueAnchorRegion = screen.getByRole("link", {
      name: /west region/i,
    });

    expect(zeroPercentRegion.querySelector("path")).toHaveAttribute(
      "fill",
      "#D73027",
    );
    expect(blueAnchorRegion.querySelector("path")).toHaveAttribute(
      "fill",
      "#6CB8FF",
    );
    expect(interpolatedRegion.querySelector("path")).toHaveAttribute(
      "fill",
      "rgb(244, 183, 134)",
    );
  });
});
