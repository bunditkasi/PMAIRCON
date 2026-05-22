import React from "react";

const LEGEND_STOPS = [
  { label: "0%", color: "#D73027" },
  { label: "30%", color: "#F49AC2" },
  { label: "50%", color: "#F3D34A" },
  { label: "70%", color: "#6CB8FF" },
  { label: "80%", color: "#9AD88C" },
  { label: "100%", color: "#2A7F3F" },
] as const;

export function RegionLegend() {
  return (
    <section
      aria-label="Region completion legend"
      className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"
    >
      <h3 className="text-sm font-semibold text-[var(--text)]">
        Cycle completion scale
      </h3>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {LEGEND_STOPS.map((stop) => (
          <li key={stop.label} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden="true"
              className="h-4 w-4 rounded-full border border-[var(--border)]"
              style={{ backgroundColor: stop.color }}
            />
            <span className="text-[var(--text-muted)]">{stop.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
