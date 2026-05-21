"use client";

import React from "react";
import { useState } from "react";

import type { SaveRepairLogInput } from "../../lib/services/repair-service";
import {
  FieldWrapper,
  FixedValueField,
  TextAreaInput,
  TextInput,
} from "../ui/form-field";
import { SectionCard } from "../ui/section-card";

interface RepairFormProps {
  initialValues: SaveRepairLogInput;
}

export function RepairForm({ initialValues }: RepairFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <SectionCard
      eyebrow="Repair form"
      title="New repair log"
    >
      <p className="max-w-2xl border-b border-[var(--border)] pb-4 text-sm text-[var(--text-muted)]">
          This placeholder uses the repair validation and service contract for
          the next wiring step.
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

        <FieldWrapper label="Issue category">
          <TextInput
            defaultValue={initialValues.issueCategory}
            name="issueCategory"
            required
          />
        </FieldWrapper>

        <FieldWrapper
          label="Issue detail"
          spanTwo
        >
          <TextAreaInput
            defaultValue={initialValues.issueDetail}
            name="issueDetail"
            placeholder="Describe the issue found"
            required
          />
        </FieldWrapper>

        <FieldWrapper label="Repair status">
          <TextInput
            defaultValue={initialValues.repairStatus}
            name="repairStatus"
            required
          />
        </FieldWrapper>

        <div className="md:col-span-2 flex justify-end">
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            Save repair
          </button>
        </div>

        {isSuccess ? (
          <p
            aria-live="polite"
            className="md:col-span-2 text-sm font-medium text-emerald-700"
          >
            Repair saved
          </p>
        ) : null}
      </form>
    </SectionCard>
  );
}
