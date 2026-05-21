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
});
