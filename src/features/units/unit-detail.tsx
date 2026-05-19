import type { UnitDetail as UnitDetailData } from "../../lib/services/unit-service";

interface UnitDetailProps {
  detail: UnitDetailData;
}

export function UnitDetail({ detail }: UnitDetailProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_18px_40px_rgba(16,32,51,0.12)]">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Unit detail
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {detail.unit.unitId}
        </h1>
        <p className="text-base text-slate-700">
          Branch: {detail.unit.branchCode}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Latest PM</h2>
          <p className="mt-2 text-sm text-slate-700">
            {detail.latestPm?.serviceDate ?? "No PM logged yet."}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {detail.pmHistory.length} PM record(s)
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Latest repair
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            {detail.latestRepair?.issueDetail ?? "No repair logged yet."}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {detail.latestRepair?.serviceDate ?? ""}
          </p>
        </article>
      </div>
    </section>
  );
}
