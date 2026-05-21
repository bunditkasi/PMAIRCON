import Link from "next/link";
import React from "react";

import type { UnitDetail as UnitDetailData } from "../../lib/services/unit-service";
import { SectionCard } from "../ui/section-card";
import { StatusPanel } from "../ui/status-panel";

interface UnitDetailProps {
  detail: UnitDetailData;
}

export function UnitDetail({ detail }: UnitDetailProps) {
  return (
    <SectionCard
      eyebrow="Unit detail"
      title={detail.unit.unitId}
    >
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-4">
        <p className="text-base text-[var(--text-muted)]">
          Branch: {detail.unit.branchCode}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <StatusPanel
          ctaHref={`/units/${detail.unit.unitId}/pm/new`}
          ctaLabel="Submit PM"
          primary={detail.latestPm?.serviceDate ?? "No PM logged yet."}
          secondary={`${detail.pmHistory.length} PM record(s)`}
          title="Latest PM"
        />

        <StatusPanel
          ctaHref={`/units/${detail.unit.unitId}/repair/new`}
          ctaLabel="Submit repair"
          primary={detail.latestRepair?.issueDetail ?? "No repair logged yet."}
          secondary={detail.latestRepair?.serviceDate ?? "No repair date recorded"}
          title="Latest repair"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          href={`/admin/replacements/new?oldUnitId=${detail.unit.unitId}`}
        >
          Record replacement
        </Link>
      </div>
    </SectionCard>
  );
}
