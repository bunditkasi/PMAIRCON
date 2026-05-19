import Link from "next/link";

import { SummaryCards } from "../../features/dashboard/summary-cards";
import { loadAppDataCollections } from "../../lib/services/app-data";
import { summarizeDashboard } from "../../lib/services/dashboard-service";

export default async function DashboardPage() {
  const collections = await loadAppDataCollections();
  const summary = summarizeDashboard({
    branches: collections.branches,
    units: collections.units,
    pmLogs: collections.pmLogs,
    repairLogs: collections.repairLogs.map((log) => ({
      unitId: log.unitId,
      repairStatus: log.repairStatus ?? "IN_PROGRESS",
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
