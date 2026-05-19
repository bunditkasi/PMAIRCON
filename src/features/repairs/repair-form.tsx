import type { SaveRepairLogInput } from "../../lib/services/repair-service";

interface RepairFormProps {
  initialValues: SaveRepairLogInput;
}

interface FixedValueFieldProps {
  label: string;
  name: "branchCode" | "unitId";
  value: string;
}

function FixedValueField({ label, name, value }: FixedValueFieldProps) {
  return (
    <div className="grid gap-2 text-sm text-slate-700">
      <span>{label}</span>
      <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-slate-900">
        {value}
      </div>
      <input defaultValue={value} name={name} type="hidden" />
    </div>
  );
}

export function RepairForm({ initialValues }: RepairFormProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_18px_40px_rgba(16,32,51,0.12)]">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Repair form
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          New repair log
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          This placeholder uses the repair validation and service contract for
          the next wiring step.
        </p>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2">
        <FixedValueField
          label="Branch code"
          name="branchCode"
          value={initialValues.branchCode}
        />

        <FixedValueField
          label="Unit ID"
          name="unitId"
          value={initialValues.unitId}
        />

        <label className="grid gap-2 text-sm text-slate-700">
          Service date
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            defaultValue={initialValues.serviceDate}
            name="serviceDate"
            type="date"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          Issue category
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            defaultValue={initialValues.issueCategory}
            name="issueCategory"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700 md:col-span-2">
          Issue detail
          <textarea
            className="min-h-28 rounded-xl border border-slate-300 px-3 py-2"
            defaultValue={initialValues.issueDetail}
            name="issueDetail"
            placeholder="Describe the issue found"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          Repair status
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            defaultValue={initialValues.repairStatus}
            name="repairStatus"
          />
        </label>

        <div className="md:col-span-2">
          <button
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled
            type="submit"
          >
            Save repair
          </button>
        </div>
      </form>
    </section>
  );
}
