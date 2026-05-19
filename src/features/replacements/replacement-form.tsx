import type { RecordReplacementInput } from "../../lib/services/replacement-service";

interface ReplacementFormProps {
  initialValues: RecordReplacementInput;
}

interface FixedValueFieldProps {
  label: string;
  name: "branchCode" | "oldUnitId";
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

export function ReplacementForm({ initialValues }: ReplacementFormProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_18px_40px_rgba(16,32,51,0.12)]">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Replacement form
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Record replacement decision
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          Central team uses this placeholder to record a replacement decision
          and create the successor unit.
        </p>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2">
        <FixedValueField
          label="Branch code"
          name="branchCode"
          value={initialValues.branchCode}
        />

        <FixedValueField
          label="Old unit ID"
          name="oldUnitId"
          value={initialValues.oldUnitId}
        />

        <label className="grid gap-2 text-sm text-slate-700">
          Decision date
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            defaultValue={initialValues.decisionDate}
            name="decisionDate"
            type="date"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          New unit ID
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            defaultValue={initialValues.newUnitId}
            name="newUnitId"
            placeholder="Enter the replacement unit ID"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700 md:col-span-2">
          Reason
          <textarea
            className="min-h-28 rounded-xl border border-slate-300 px-3 py-2"
            defaultValue={initialValues.reason}
            name="reason"
            placeholder="Describe why the unit should be replaced"
          />
        </label>

        <div className="md:col-span-2">
          <button
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled
            type="submit"
          >
            Save replacement
          </button>
        </div>
      </form>
    </section>
  );
}
