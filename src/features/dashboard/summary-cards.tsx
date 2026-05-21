import React from "react";
import type { DashboardSummary } from "../../lib/services/dashboard-service";
import { MetricCard } from "../ui/metric-card";

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
          <MetricCard
            key={item.key}
            label={item.label}
            value={summary[item.key]}
          />
        ))}
      </div>
    </section>
  );
}
