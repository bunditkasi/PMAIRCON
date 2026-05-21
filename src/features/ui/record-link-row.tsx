import React from "react";
import Link from "next/link";

interface RecordLinkRowProps {
  href: string;
  title: string;
  subtitle: string;
  meta?: string;
}

export function RecordLinkRow({
  href,
  title,
  subtitle,
  meta,
}: RecordLinkRowProps) {
  return (
    <Link
      aria-label={title}
      className="group flex flex-col gap-1 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-soft)]"
      href={href}
    >
      <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
      {meta ? (
        <p className="pt-1 text-xs text-[var(--text-muted)]">{meta}</p>
      ) : null}
    </Link>
  );
}
