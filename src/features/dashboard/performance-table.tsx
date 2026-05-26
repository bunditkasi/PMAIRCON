import React from "react";

import { SectionCard } from "../ui/section-card";

interface PerformanceTableProps {
  eyebrow: string;
  title: string;
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
  emptyMessage?: string;
}

export function PerformanceTable({
  eyebrow,
  title,
  columns,
  rows,
  emptyMessage = "No matching data in the selected scope.",
}: PerformanceTableProps) {
  return (
    <SectionCard eyebrow={eyebrow} title={title}>
      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${title}-${index}-${cellIndex}`}
                      className="rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text)]"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">{emptyMessage}</p>
      )}
    </SectionCard>
  );
}
