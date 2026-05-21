import React from "react";
import type { RegionDashboardSummary } from "../../lib/services/dashboard-service";
import { RegionLegend } from "./region-legend";

interface RegionMapProps {
  regions: RegionDashboardSummary[];
  activeRegion: string | null;
  onRegionSelect?: (region: string) => void;
  onReset?: () => void;
}

const COLOR_STOPS = [
  { threshold: 0, color: "#D73027" },
  { threshold: 30, color: "#F49AC2" },
  { threshold: 50, color: "#F3D34A" },
  { threshold: 70, color: "#6CB8FF" },
  { threshold: 80, color: "#9AD88C" },
  { threshold: 100, color: "#2A7F3F" },
] as const;

export function RegionMap({
  regions,
  activeRegion,
  onRegionSelect,
  onReset,
}: RegionMapProps) {
  return (
    <section aria-label="Region performance" className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
      <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Region coverage
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Compare current cycle completion across operating regions.
            </p>
          </div>
          <button
            className="rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(44,91,73,0.18)]"
            onClick={onReset}
            type="button"
          >
            Reset region filter
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {regions.map((region) => {
            const isActive = activeRegion === region.region;
            const regionColor = getRegionColor(region.cycleCompletionPercent);

            return (
              <button
                key={region.region}
                aria-label={`${region.region} region, ${region.cycleCompletionPercent}% current cycle completion, ${region.annualCompletionPercent}% annual completion, ${region.totalUnits} units`}
                aria-pressed={isActive}
                className="rounded-[1.25rem] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(44,91,73,0.18)]"
                onClick={() => onRegionSelect?.(region.region)}
                style={{
                  backgroundColor: regionColor.backgroundColor,
                  borderColor: isActive ? "var(--accent)" : "var(--border)",
                  boxShadow: isActive
                    ? "inset 0 0 0 1px rgba(44,91,73,0.22)"
                    : undefined,
                }}
                type="button"
              >
                <span className="block text-base font-semibold text-[var(--text)]">
                  {region.region}
                </span>
                <span className="mt-1 block text-sm text-[var(--text-muted)]">
                  {region.totalUnits} units across {region.totalBranches} branches
                </span>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[var(--text-muted)]">Cycle</dt>
                    <dd className="mt-1 font-semibold text-[var(--text)]">
                      {region.cycleCompletionPercent}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Annual</dt>
                    <dd className="mt-1 font-semibold text-[var(--text)]">
                      {region.annualCompletionPercent}%
                    </dd>
                  </div>
                </dl>
              </button>
            );
          })}
        </div>
      </div>

      <RegionLegend />
    </section>
  );
}

function getRegionColor(percent: number) {
  const boundedPercent = Math.max(0, Math.min(percent, 100));
  const lowerStop =
    [...COLOR_STOPS]
      .reverse()
      .find((stop) => boundedPercent >= stop.threshold) ?? COLOR_STOPS[0];
  const upperStop =
    COLOR_STOPS.find((stop) => boundedPercent <= stop.threshold) ??
    COLOR_STOPS[COLOR_STOPS.length - 1];

  if (lowerStop.threshold === upperStop.threshold) {
    return {
      backgroundColor: lowerStop.color,
    };
  }

  const range = upperStop.threshold - lowerStop.threshold;
  const progress =
    range === 0 ? 0 : (boundedPercent - lowerStop.threshold) / range;
  const lowerRgb = hexToRgb(lowerStop.color);
  const upperRgb = hexToRgb(upperStop.color);

  return {
    backgroundColor: `rgb(${interpolateChannel(lowerRgb.r, upperRgb.r, progress)}, ${interpolateChannel(lowerRgb.g, upperRgb.g, progress)}, ${interpolateChannel(lowerRgb.b, upperRgb.b, progress)})`,
  };
}

function hexToRgb(hex: string) {
  const normalizedHex = hex.replace("#", "");

  return {
    r: Number.parseInt(normalizedHex.slice(0, 2), 16),
    g: Number.parseInt(normalizedHex.slice(2, 4), 16),
    b: Number.parseInt(normalizedHex.slice(4, 6), 16),
  };
}

function interpolateChannel(start: number, end: number, progress: number) {
  return Math.round(start + (end - start) * progress);
}
