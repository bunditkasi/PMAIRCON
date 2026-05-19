import Link from "next/link";

import { SummaryCards } from "../../features/dashboard/summary-cards";
import { loadAppDataCollections } from "../../lib/services/app-data";
import { summarizeDashboard } from "../../lib/services/dashboard-service";

export default async function DashboardPage() {
  const collections = await loadAppDataCollections();
  const branchDirectory = [...collections.branches].sort((left, right) =>
    left.branchCode.localeCompare(right.branchCode),
  );
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

        <section className="rounded-2xl bg-white p-6 shadow-[0_18px_40px_rgba(16,32,51,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Branch directory
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Open a branch
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              {branchDirectory.length} branches
            </p>
          </div>

          <div className="mt-5 grid max-h-[32rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
            {branchDirectory.map((branch) => (
              <Link
                key={branch.branchCode}
                className="rounded-xl border border-slate-200 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                href={`/branches/${branch.branchCode}`}
              >
                <p className="text-sm font-semibold text-slate-950">
                  {branch.branchCode}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {branch.outletName}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Supplier: {branch.supplierName || "Not assigned"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
