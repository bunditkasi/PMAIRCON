import React from "react";
import Link from "next/link";

import { AppShell } from "../features/ui/app-shell";
import { SectionCard } from "../features/ui/section-card";

export default function HomePage() {
  return (
    <AppShell
      description="QR-based preventive maintenance and repair logging for branch operations."
      eyebrow="PMAIRCON"
      title="Air Conditioner PM System"
    >
      <SectionCard title="Open the workspace">
        <nav
          aria-label="Primary"
          className="flex flex-wrap gap-3"
        >
          <Link
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            href="/dashboard"
          >
            Open dashboard
          </Link>
          <Link
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)]"
            href="/dashboard"
          >
            Find branch
          </Link>
          <Link
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)]"
            href="/report"
          >
            Open report
          </Link>
          <Link
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)]"
            href="/admin/qr-console"
          >
            QR Console
          </Link>
        </nav>
      </SectionCard>
    </AppShell>
  );
}
