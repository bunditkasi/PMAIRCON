import React from "react";
import Link from "next/link";
import type { RegionDashboardSummary } from "../../lib/services/dashboard-service";
import { RegionLegend } from "./region-legend";

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

const THAILAND_REGIONS: Array<{
  id: string;
  label: string;
  path: string;
  clipPath: string;
  textX: number;
  textY: number;
}> = [
  {
    id: "north",
    label: "North",
    path: "M98 54 L145 34 L200 42 L232 74 L217 117 L178 132 L122 128 L90 96 Z",
    clipPath:
      "polygon(28.82% 10%, 42.65% 6.3%, 58.82% 7.78%, 68.24% 13.7%, 63.82% 21.67%, 52.35% 24.44%, 35.88% 23.7%, 26.47% 17.78%)",
    textX: 161,
    textY: 84,
  },
  {
    id: "west",
    label: "West",
    path: "M88 130 L120 138 L130 190 L114 244 L95 301 L77 336 L60 322 L62 267 L73 208 L70 158 Z",
    clipPath:
      "polygon(25.88% 24.07%, 35.29% 25.56%, 38.24% 35.19%, 33.53% 45.19%, 27.94% 55.74%, 22.65% 62.22%, 17.65% 59.63%, 18.24% 49.44%, 21.47% 38.52%, 20.59% 29.26%)",
    textX: 95,
    textY: 226,
  },
  {
    id: "central",
    label: "Central",
    path: "M127 145 L177 136 L217 154 L226 200 L205 241 L165 261 L122 246 L108 204 Z",
    clipPath:
      "polygon(37.35% 26.85%, 52.06% 25.19%, 63.82% 28.52%, 66.47% 37.04%, 60.29% 44.63%, 48.53% 48.33%, 35.88% 45.56%, 31.76% 37.78%)",
    textX: 167,
    textY: 199,
  },
  {
    id: "northeast",
    label: "Northeast",
    path: "M218 90 L271 103 L296 148 L289 204 L252 221 L224 199 L216 154 L206 120 Z",
    clipPath:
      "polygon(64.12% 16.67%, 79.71% 19.07%, 87.06% 27.41%, 85% 37.78%, 74.12% 40.93%, 65.88% 36.85%, 63.53% 28.52%, 60.59% 22.22%)",
    textX: 252,
    textY: 156,
  },
  {
    id: "east",
    label: "East",
    path: "M226 207 L262 221 L283 254 L267 298 L234 315 L212 288 L206 245 Z",
    clipPath:
      "polygon(66.47% 38.33%, 77.06% 40.93%, 83.24% 47.04%, 78.53% 55.19%, 68.82% 58.33%, 62.35% 53.33%, 60.59% 45.37%)",
    textX: 247,
    textY: 261,
  },
  {
    id: "south",
    label: "South",
    path: "M142 264 L169 274 L181 311 L173 358 L161 405 L170 454 L155 509 L138 489 L134 434 L126 392 L120 340 L126 293 Z",
    clipPath:
      "polygon(41.76% 48.89%, 49.71% 50.74%, 53.24% 57.59%, 50.88% 66.3%, 47.35% 75%, 50% 84.07%, 45.59% 94.26%, 40.59% 90.56%, 39.41% 80.37%, 37.06% 72.59%, 35.29% 62.96%, 37.06% 54.26%)",
    textX: 150,
    textY: 383,
  },
] as const;

export function RegionMap({
  regions,
  activeRegion,
}: RegionMapProps) {
  const regionsById = new Map(
    regions.map((region) => [normalizeRegionId(region.region), region] as const),
  );
  const mappedRegions = THAILAND_REGIONS.filter((shape) =>
    regionsById.has(shape.id),
  ).map((shape) => ({
    ...shape,
    summary: regionsById.get(shape.id)!,
  }));
  const supplementalRegions = regions.filter(
    (region) => !THAILAND_REGIONS.some((shape) => shape.id === normalizeRegionId(region.region)),
  );

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
            <div className="relative mx-auto aspect-[340/540] w-full max-w-[25rem]">
              <svg
                aria-label="Thailand region heatmap"
                role="img"
                viewBox="0 0 340 540"
                className="h-full w-full"
              >
                <path
                  d="M110 32 L198 40 L249 82 L286 119 L300 185 L276 254 L236 320 L196 351 L183 407 L175 482 L153 520 L126 486 L118 420 L104 342 L67 309 L58 244 L69 170 L84 98 Z"
                  fill="rgba(232,236,233,0.72)"
                  stroke="rgba(97,113,108,0.24)"
                  strokeWidth="6"
                />
                {mappedRegions.map((region) => {
                  const isActive = activeRegion === region.summary.region;

                  return (
                    <path
                      key={region.id}
                      d={region.path}
                      fill="rgba(255,255,255,0.14)"
                      stroke={isActive ? "#2C5B49" : "rgba(74,89,85,0.24)"}
                      strokeWidth={isActive ? 4 : 2.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>

              {mappedRegions.map((region) => {
                const isActive = activeRegion === region.summary.region;
                const regionColor = getRegionColor(
                  region.summary.currentCycleCompletionPercent,
                );

                return (
                  <Link
                    key={region.id}
                    aria-label={`${region.summary.region} region, ${region.summary.currentCycleCompletionPercent}% current cycle completion, ${region.summary.annualCompletionPercent}% annual completion, ${region.summary.totalUnits} units`}
                    className="absolute inset-0 overflow-hidden rounded-none border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(44,91,73,0.18)]"
                    href={regionHref(region.summary.region, isActive)}
                    style={{
                      backgroundColor: regionColor.backgroundColor,
                      clipPath: region.clipPath,
                      boxShadow: isActive
                        ? "inset 0 0 0 3px rgba(44,91,73,0.86)"
                        : "inset 0 0 0 1px rgba(74,89,85,0.32)",
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute text-[11px] font-semibold tracking-[0.08em] text-[var(--text)]"
                      style={{
                        left: `${(region.textX / 340) * 100}%`,
                        top: `${(region.textY / 540) * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {region.label.toUpperCase()}
                    </span>
                  </Link>
                );
              })}
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
                  Unmapped regions are selectable from the snapshot list while dedicated map zones are added.
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
