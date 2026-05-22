import React from "react";
import type {
  DashboardAnalyticsSummary,
  DashboardSummary,
} from "../../lib/services/dashboard-service";
import { MetricCard } from "../ui/metric-card";

type DashboardSummaryViewModel = DashboardSummary & DashboardAnalyticsSummary;

interface SummaryCardsProps {
  summary: DashboardSummaryViewModel;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cardItems: Array<{
    key: string;
    label: string;
    value: number | string;
    accent?: "default" | "success";
    supportingText?: string;
  }> = [
    { key: "totalBranches", label: "Total branches", value: summary.totalBranches },
    { key: "totalUnits", label: "Total units", value: summary.totalUnits },
    { key: "pmLoggedUnits", label: "PM logged units", value: summary.pmLoggedUnits },
    { key: "openRepairs", label: "Open repairs", value: summary.openRepairs },
    {
      key: "annualCompletionPercent",
      label: "Annual PM completion",
      value: `${summary.annualCompletionPercent}%`,
      accent: "success",
      supportingText: "Share of required PM visits completed this year",
    },
    {
      key: "currentCycleCompletionPercent",
      label: "Current cycle completion",
      value: `${summary.currentCycleCompletionPercent}%`,
      accent: "success",
      supportingText: `Cycle ${summary.activeCycleMonth} progress across active units`,
    },
  ];

  return (
    <section aria-label="Dashboard summary">
      {summary.activeRegion ? (
        <p className="mb-3 text-sm text-[var(--text-muted)]">
          Scoped to {summary.activeRegion}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cardItems.map((item) => (
          <MetricCard
            key={item.key}
            accent={item.accent}
            label={item.label}
            supportingText={item.supportingText}
            value={item.value}
          />
        ))}
      </div>
    </section>
  );
}
