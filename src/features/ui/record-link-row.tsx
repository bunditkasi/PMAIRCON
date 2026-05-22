import React from "react";
import Link from "next/link";

interface RecordLinkRowProps {
  href: string;
  title: string;
  subtitle: string;
  meta?: string;
  details?: Array<{
    label: string;
    value: number;
  }>;
}

export function RecordLinkRow({
  href,
  title,
  subtitle,
  meta,
  details,
}: RecordLinkRowProps) {
  return (
    <Link
      aria-label={title}
      className="group flex flex-col gap-1 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-soft)]"
      href={href}
    >
      <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
      {details && details.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {details.map((detail) => (
            <span
              key={detail.label}
              className="rounded-full border border-[rgba(44,91,73,0.14)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)]"
            >
              {detail.label} = {detail.value}
            </span>
          ))}
        </div>
      ) : null}
      {meta ? (
        <p className="pt-1 text-xs text-[var(--text-muted)]">{meta}</p>
      ) : null}
    </Link>
  );
}
