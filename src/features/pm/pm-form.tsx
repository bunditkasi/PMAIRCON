"use client";

import { useState } from "react";

import type { SavePmLogInput } from "../../lib/services/pm-service";

interface PmFormProps {
  initialValues: SavePmLogInput;
}

interface FixedValueFieldProps {
  label: string;
  name: "branchCode" | "unitId" | "serviceStatus";
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

export function PmForm({ initialValues }: PmFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_18px_40px_rgba(16,32,51,0.12)]">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          PM form
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          New preventive maintenance log
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          This placeholder uses the PM validation and service contract for the
          next wiring step.
        </p>
      </div>

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setIsSuccess(true);
        }}
      >
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
            required
            type="date"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          Technician name
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            defaultValue={initialValues.technicianName}
            name="technicianName"
            placeholder="Enter technician name"
            required
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-700">
          Supplier name
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            defaultValue={initialValues.supplierName}
            name="supplierName"
            required
          />
        </label>

        <FixedValueField
          label="Service status"
          name="serviceStatus"
          value={initialValues.serviceStatus}
        />

        <div className="md:col-span-2">
          <button
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            Save PM
          </button>
        </div>

        {isSuccess ? (
          <p
            aria-live="polite"
            className="md:col-span-2 text-sm font-medium text-emerald-700"
          >
            PM saved
          </p>
        ) : null}
      </form>
    </section>
  );
}
