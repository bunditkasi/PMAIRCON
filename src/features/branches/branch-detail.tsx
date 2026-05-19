import type { BranchDetail as BranchDetailData } from "../../lib/services/branch-service";

interface BranchDetailProps {
  detail: BranchDetailData;
}

export function BranchDetail({ detail }: BranchDetailProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_18px_40px_rgba(16,32,51,0.12)]">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Branch detail
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {detail.branch.branchCode}
        </h1>
        <p className="text-base text-slate-700">{detail.branch.outletName}</p>
        <p className="text-sm text-slate-600">
          Supplier: {detail.branch.supplierName}
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Units</h2>
          <p className="text-sm text-slate-600">{detail.units.length} total</p>
        </div>

        {detail.units.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            No units are connected to this branch yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {detail.units.map((unit) => (
              <li
                key={unit.unitId}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
              >
                {unit.unitId}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
