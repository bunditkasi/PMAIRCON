import React from "react";

interface MetricCardProps {
  label: string;
  value: number | string;
  accent?: "default" | "success";
  supportingText?: string;
}

export function MetricCard({
  label,
  value,
  accent = "default",
  supportingText,
}: MetricCardProps) {
  const valueClassName =
    accent === "success" ? "text-[var(--accent)]" : "text-[var(--text)]";

  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p
        className={`mt-3 text-3xl font-semibold tracking-tight ${valueClassName}`}
      >
        {value}
      </p>
      {supportingText ? (
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {supportingText}
        </p>
      ) : null}
    </article>
  );
}
