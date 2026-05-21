import React from "react";
import Link from "next/link";

interface StatusPanelProps {
  title: string;
  primary: string;
  secondary: string;
  ctaHref: string;
  ctaLabel: string;
}

export function StatusPanel({
  title,
  primary,
  secondary,
  ctaHref,
  ctaLabel,
}: StatusPanelProps) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
      <p className="mt-3 text-base text-[var(--text)]">{primary}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{secondary}</p>
      <Link
        className="mt-5 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        href={ctaHref}
      >
        {ctaLabel}
      </Link>
    </article>
  );
}
