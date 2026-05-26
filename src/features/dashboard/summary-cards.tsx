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
    {
      key: "overdueUnits",
      label: "Overdue units",
      value: summary.overdueUnits,
      supportingText: "Units due in the active scope without a completed PM log",
    },
    {
      key: "dueThisMonth",
      label: "Due this month",
      value: summary.dueThisMonth,
      supportingText: "Units scheduled in the selected or current month",
    },
    {
      key: "dueThisCycle",
      label: "Due this cycle",
      value: summary.dueThisCycle,
      supportingText: "Units scheduled in the selected or active cycle",
    },
    { key: "openRepairs", label: "Open repairs", value: summary.openRepairs },
    {
      key: "annualCompletionPercent",
      label: "Annual PM completion",
      value: `${summary.annualCompletionPercent}%`,
      accent: "success",
      supportingText: "Share of required PM visits completed this year",
    },
    {
      key: "cycleCompletionPercent",
      label: "Current cycle completion",
      value: `${summary.cycleCompletionPercent}%`,
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
