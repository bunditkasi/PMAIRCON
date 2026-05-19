import Link from "next/link";

import { SummaryCards } from "../../features/dashboard/summary-cards";
import {
  detailBranchFixtures,
  detailPmFixtures,
  detailRepairFixtures,
  detailUnitFixtures,
} from "../../lib/fixtures/detail-fixtures";
import { summarizeDashboard } from "../../lib/services/dashboard-service";

export default function DashboardPage() {
  const summary = summarizeDashboard({
    branches: detailBranchFixtures,
    units: detailUnitFixtures,
    pmLogs: detailPmFixtures,
    repairLogs: detailRepairFixtures.map((log) => ({
      unitId: log.unitId,
      repairStatus: "IN_PROGRESS",
    })),
  });

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Central dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Aircon PM monitoring
            </h1>
          </div>
          <Link
            className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
            href="/"
          >
            Back to home
          </Link>
        </div>

        <SummaryCards summary={summary} />
      </div>
    </main>
  );
}
