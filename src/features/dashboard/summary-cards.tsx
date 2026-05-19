import type { DashboardSummary } from "../../lib/services/dashboard-service";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

const CARD_ITEMS: Array<{
  key: keyof DashboardSummary;
  label: string;
}> = [
  { key: "totalBranches", label: "Total branches" },
  { key: "totalUnits", label: "Total units" },
  { key: "pmLoggedUnits", label: "PM logged units" },
  { key: "openRepairs", label: "Open repairs" },
];

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <section aria-label="Dashboard summary">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARD_ITEMS.map((item) => (
          <article
            key={item.key}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-600">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary[item.key]}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
