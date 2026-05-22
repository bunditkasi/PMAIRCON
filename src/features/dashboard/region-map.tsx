import React from "react";
import Link from "next/link";

import type { RegionDashboardSummary } from "../../lib/services/dashboard-service";
import { RegionLegend } from "./region-legend";
import {
  THAILAND_MAP_VIEWBOX,
  THAILAND_PROVINCE_BOUNDARIES_PATH,
  THAILAND_REGION_SHAPES,
} from "./thailand-shape-data";

interface RegionMapProps {
  regions: RegionDashboardSummary[];
  activeRegion: string | null;
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
}: RegionMapProps) {
  const regionsById = new Map(
    regions.map((region) => [normalizeRegionId(region.region), region] as const),
  );
  const mappedRegions = THAILAND_REGION_SHAPES.filter((shape) =>
    regionsById.has(shape.id),
  ).map((shape) => ({
    ...shape,
    summary: regionsById.get(shape.id)!,
  }));
  const supplementalRegions = regions.filter(
    (region) =>
      !THAILAND_REGION_SHAPES.some(
        (shape) => shape.id === normalizeRegionId(region.region),
      ),
  );
  const activeMappedRegion =
    mappedRegions.find((region) => activeRegion === region.summary.region) ?? null;

  return (
    <section
      aria-label="Region performance"
      className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]"
    >
      <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Thailand region coverage
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Select a region on the map to inspect current cycle completion.
            </p>
          </div>
          <Link
            className="rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(44,91,73,0.18)]"
            href="/dashboard"
          >
            Reset region filter
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(244,248,246,0.92),rgba(233,240,236,0.88))] p-4">
            <div className="mx-auto w-full max-w-[25rem] overflow-hidden rounded-[1rem] border border-[rgba(110,126,120,0.12)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(235,242,238,0.92))] p-3">
              <svg
                aria-label="Thailand region heatmap"
                role="img"
                viewBox={THAILAND_MAP_VIEWBOX}
                className="h-full w-full"
              >
                {mappedRegions.map((region) => {
                  const isActive = activeRegion === region.summary.region;
                  const regionColor = getRegionColor(
                    region.summary.currentCycleCompletionPercent,
                  );

                  return (
                    <a
                      key={region.id}
                      href={regionHref(region.summary.region, isActive)}
                      aria-label={`${region.summary.region} region, ${region.summary.currentCycleCompletionPercent}% current cycle completion, ${region.summary.annualCompletionPercent}% annual completion, ${region.summary.totalUnits} units`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <title>{region.summary.region}</title>
                      <path
                        d={region.path}
                        fill={regionColor.backgroundColor}
                        fillOpacity={isActive ? 0.96 : 0.88}
                        stroke="transparent"
                        strokeWidth="0"
                        vectorEffect="non-scaling-stroke"
                      />
                    </a>
                  );
                })}
                <path
                  d={THAILAND_PROVINCE_BOUNDARIES_PATH}
                  fill="none"
                  stroke="rgba(74,89,85,0.28)"
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
                {activeMappedRegion ? (
                  <path
                    d={activeMappedRegion.path}
                    fill="none"
                    stroke="#2C5B49"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                ) : null}
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-muted)]/60 p-4">
              <h3 className="text-sm font-semibold text-[var(--text)]">
                Region snapshot
              </h3>
              <ol className="mt-3 space-y-3">
                {regions.map((region) => {
                  const isActive = activeRegion === region.region;
                  const regionColor = getRegionColor(
                    region.currentCycleCompletionPercent,
                  );

                  return (
                    <li
                      key={region.region}
                      className="list-none"
                    >
                      <Link
                        aria-label={`${region.region} current cycle ${region.currentCycleCompletionPercent}%`}
                        className="w-full rounded-[1rem] border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(44,91,73,0.18)]"
                        href={regionHref(region.region, isActive)}
                        style={{
                          backgroundColor: regionColor.backgroundColor,
                          borderColor: isActive ? "var(--accent)" : "var(--border)",
                          boxShadow: isActive
                            ? "inset 0 0 0 1px rgba(44,91,73,0.24)"
                            : undefined,
                        }}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-[var(--text)]">
                            {region.region}
                          </span>
                          <span className="text-sm font-semibold text-[var(--text)]">
                            {region.currentCycleCompletionPercent}%
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {region.totalUnits} units across {region.totalBranches} branches
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>

            {supplementalRegions.length > 0 ? (
              <section className="rounded-[1.25rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
                <h3 className="text-sm font-semibold text-[var(--text)]">
                  Additional regions
                </h3>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Unmapped regions are still available from the snapshot list while new zones are added.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text)]">
                  {supplementalRegions.map((region) => (
                    <li key={region.region}>{region.region}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <RegionLegend />
          </div>
        </div>
      </div>
    </section>
  );
}

function normalizeRegionId(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function regionHref(region: string, isActive: boolean) {
  if (isActive) {
    return "/dashboard";
  }

  return `/dashboard?region=${encodeURIComponent(region)}`;
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
