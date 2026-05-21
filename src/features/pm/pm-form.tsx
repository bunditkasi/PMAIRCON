"use client";

import React from "react";
import { useState } from "react";

import type { SavePmLogInput } from "../../lib/services/pm-service";
import {
  FieldWrapper,
  FixedValueField,
  TextInput,
} from "../ui/form-field";
import { SectionCard } from "../ui/section-card";

interface PmFormProps {
  initialValues: SavePmLogInput;
}

export function PmForm({ initialValues }: PmFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <SectionCard
      eyebrow="PM form"
      title="New preventive maintenance log"
    >
      <p className="max-w-2xl border-b border-[var(--border)] pb-4 text-sm text-[var(--text-muted)]">
          This placeholder uses the PM validation and service contract for the
          next wiring step.
      </p>

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

        <FieldWrapper label="Service date">
          <TextInput
            defaultValue={initialValues.serviceDate}
            name="serviceDate"
            required
            type="date"
          />
        </FieldWrapper>

        <FieldWrapper label="Technician name">
          <TextInput
            defaultValue={initialValues.technicianName}
            name="technicianName"
            placeholder="Enter technician name"
            required
          />
        </FieldWrapper>

        <FieldWrapper label="Supplier name">
          <TextInput
            defaultValue={initialValues.supplierName}
            name="supplierName"
            required
          />
        </FieldWrapper>

        <FixedValueField
          label="Service status"
          name="serviceStatus"
          value={initialValues.serviceStatus}
        />

        <div className="md:col-span-2 flex justify-end">
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
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
    </SectionCard>
  );
}
