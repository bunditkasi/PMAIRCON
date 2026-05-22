import React from "react";

import type { BranchDetail as BranchDetailData } from "../../lib/services/branch-service";
import { RecordLinkRow } from "../ui/record-link-row";
import { SectionCard } from "../ui/section-card";

interface BranchDetailProps {
  detail: BranchDetailData;
}

export function BranchDetail({ detail }: BranchDetailProps) {
  const branchLocation = [
    detail.branch.fullStoreName || detail.branch.outletName,
    detail.branch.state,
  ]
    .filter(Boolean)
    .join(", ");
  const formattedStartBusinessDate = formatBranchDate(
    detail.branch.startBusinessDate,
  );

  return (
    <SectionCard
      aside={`${detail.units.length} total`}
      eyebrow="Branch detail"
      title={detail.branch.branchCode}
    >
      <div className="grid gap-2 border-b border-[var(--border)] pb-5">
        <p className="text-lg text-[var(--text)]">{detail.branch.outletName}</p>
        {branchLocation ? (
          <p className="text-sm text-[var(--text)]">{branchLocation}</p>
        ) : null}
        {formattedStartBusinessDate ? (
          <p className="text-sm text-[var(--text-muted)]">
            Start business: {formattedStartBusinessDate}
          </p>
        ) : null}
        <p className="text-sm text-[var(--text-muted)]">
          Supplier: {detail.branch.supplierName || "Not assigned"}
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)]">Units</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {detail.units.length} total
          </p>
        </div>
        {detail.units.length === 0 ? (
          <p className="mt-4 rounded-[1.25rem] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--text-muted)]">
            No units are connected to this branch yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {detail.units.map((unit) => (
              <li key={unit.unitId}>
                <RecordLinkRow
                  href={`/units/${unit.unitId}`}
                  subtitle="Open unit detail"
                  title={unit.unitId}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}

function formatBranchDate(value: string): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "";
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(parsedDate);
}
