import React from "react";
import type { KeyboardEvent } from "react";
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

const THAILAND_REGIONS: Array<{
  id: string;
  label: string;
  path: string;
  textX: number;
  textY: number;
}> = [
  {
    id: "north",
    label: "North",
    path: "M98 54 L145 34 L200 42 L232 74 L217 117 L178 132 L122 128 L90 96 Z",
    textX: 161,
    textY: 84,
  },
  {
    id: "west",
    label: "West",
    path: "M88 130 L120 138 L130 190 L114 244 L95 301 L77 336 L60 322 L62 267 L73 208 L70 158 Z",
    textX: 95,
    textY: 226,
  },
  {
    id: "central",
    label: "Central",
    path: "M127 145 L177 136 L217 154 L226 200 L205 241 L165 261 L122 246 L108 204 Z",
    textX: 167,
    textY: 199,
  },
  {
    id: "northeast",
    label: "Northeast",
    path: "M218 90 L271 103 L296 148 L289 204 L252 221 L224 199 L216 154 L206 120 Z",
    textX: 252,
    textY: 156,
  },
  {
    id: "east",
    label: "East",
    path: "M226 207 L262 221 L283 254 L267 298 L234 315 L212 288 L206 245 Z",
    textX: 247,
    textY: 261,
  },
  {
    id: "south",
    label: "South",
    path: "M142 264 L169 274 L181 311 L173 358 L161 405 L170 454 L155 509 L138 489 L134 434 L126 392 L120 340 L126 293 Z",
    textX: 150,
    textY: 383,
  },
] as const;

export function RegionMap({
  regions,
  activeRegion,
  onRegionSelect,
  onReset,
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
          <button
            className="rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(44,91,73,0.18)]"
            onClick={onReset}
            type="button"
          >
            Reset region filter
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(244,248,246,0.92),rgba(233,240,236,0.88))] p-4">
            <svg
              aria-label="Thailand region heatmap"
              role="img"
              viewBox="0 0 340 540"
              className="h-auto w-full"
            >
              <path
                d="M110 32 L198 40 L249 82 L286 119 L300 185 L276 254 L236 320 L196 351 L183 407 L175 482 L153 520 L126 486 L118 420 L104 342 L67 309 L58 244 L69 170 L84 98 Z"
                fill="rgba(232,236,233,0.72)"
                stroke="rgba(97,113,108,0.24)"
                strokeWidth="6"
              />
              {mappedRegions.map((region) => {
                const isActive = activeRegion === region.summary.region;
                const regionColor = getRegionColor(
                  region.summary.cycleCompletionPercent,
                );

                return (
                  <g
                    key={region.id}
                    aria-label={`${region.summary.region} region, ${region.summary.cycleCompletionPercent}% current cycle completion, ${region.summary.annualCompletionPercent}% annual completion, ${region.summary.totalUnits} units`}
                    aria-pressed={isActive}
                    className="cursor-pointer"
                    onClick={() => onRegionSelect?.(region.summary.region)}
                    onKeyDown={(event) =>
                      handleRegionKeyDown(event, () =>
                        onRegionSelect?.(region.summary.region),
                      )
                    }
                    role="button"
                    style={{ fill: regionColor.fillColor }}
                    tabIndex={0}
                  >
                    <path
                      d={region.path}
                      stroke={isActive ? "#2C5B49" : "rgba(74,89,85,0.36)"}
                      strokeWidth={isActive ? 4 : 3}
                      vectorEffect="non-scaling-stroke"
                    />
                    <text
                      x={region.textX}
                      y={region.textY}
                      textAnchor="middle"
                      className="select-none fill-[var(--text)] text-[12px] font-semibold tracking-[0.08em]"
                    >
                      {region.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="space-y-4">
            <section className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-muted)]/60 p-4">
              <h3 className="text-sm font-semibold text-[var(--text)]">
                Region snapshot
              </h3>
              <ol className="mt-3 space-y-3">
                {regions.map((region) => {
                  const isActive = activeRegion === region.region;

                  return (
                    <li
                      key={region.region}
                      className={`rounded-[1rem] border px-3 py-3 ${
                        isActive
                          ? "border-[var(--accent)] bg-[rgba(44,91,73,0.08)]"
                          : "border-[var(--border)] bg-[var(--surface)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[var(--text)]">
                          {region.region}
                        </span>
                        <span className="text-sm font-semibold text-[var(--text)]">
                          {region.cycleCompletionPercent}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {region.totalUnits} units across {region.totalBranches} branches
                      </p>
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
                  These regions are listed until dedicated map zones are added.
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

function handleRegionKeyDown(
  event: KeyboardEvent<SVGGElement>,
  onSelect: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  onSelect();
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
      fillColor: lowerStop.color,
    };
  }

  const range = upperStop.threshold - lowerStop.threshold;
  const progress =
    range === 0 ? 0 : (boundedPercent - lowerStop.threshold) / range;
  const lowerRgb = hexToRgb(lowerStop.color);
  const upperRgb = hexToRgb(upperStop.color);

  return {
    fillColor: `rgb(${interpolateChannel(lowerRgb.r, upperRgb.r, progress)}, ${interpolateChannel(lowerRgb.g, upperRgb.g, progress)}, ${interpolateChannel(lowerRgb.b, upperRgb.b, progress)})`,
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
