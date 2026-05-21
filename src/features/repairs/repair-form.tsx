"use client";

import React from "react";
import { useState } from "react";

import type { SaveRepairLogInput } from "../../lib/services/repair-service";
import {
  FieldWrapper,
  FixedValueField,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../ui/form-field";
import { SectionCard } from "../ui/section-card";

interface RepairFormProps {
  initialValues: SaveRepairLogInput;
}

export function RepairForm({ initialValues }: RepairFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="Repair form"
      title="New repair log"
    >
      <p className="max-w-2xl border-b border-[var(--border)] pb-4 text-sm text-[var(--text-muted)]">
        Record the repair result for this unit. The latest repair date and
        latest issue summary will update on the unit after save.
      </p>

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setErrorMessage(null);
          setIsSubmitting(true);
          setIsSuccess(false);
          try {
            const formData = new FormData(event.currentTarget);
            const response = await fetch("/api/repair", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                branchCode: String(formData.get("branchCode") ?? ""),
                unitId: String(formData.get("unitId") ?? ""),
                serviceDate: String(formData.get("serviceDate") ?? ""),
                issueCategory: String(formData.get("issueCategory") ?? ""),
                issueDetail: String(formData.get("issueDetail") ?? ""),
                repairStatus: String(formData.get("repairStatus") ?? ""),
              }),
            });

            if (!response.ok) {
              const payload = (await response.json()) as { error?: string };
              setErrorMessage(payload.error ?? "Failed to save repair log");
              setIsSubmitting(false);
              return;
            }

            setIsSuccess(true);
            setIsSubmitting(false);
          } catch {
            setErrorMessage("Failed to save repair log");
            setIsSubmitting(false);
          }
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
          <SelectInput
            defaultValue={initialValues.issueCategory}
            name="issueCategory"
            required
          >
            <option value="WATER_LEAK">WATER_LEAK</option>
            <option value="NO_COOLING">NO_COOLING</option>
            <option value="ELECTRICAL">ELECTRICAL</option>
            <option value="OTHER">OTHER</option>
          </SelectInput>
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
          <SelectInput
            defaultValue={initialValues.repairStatus}
            name="repairStatus"
            required
          >
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </SelectInput>
        </FieldWrapper>

        <div className="md:col-span-2 flex justify-end">
          <button
            disabled={isSubmitting}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Save repair"}
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

        {errorMessage ? (
          <p
            aria-live="polite"
            className="md:col-span-2 text-sm font-medium text-rose-700"
          >
            {errorMessage}
          </p>
        ) : null}
      </form>
    </SectionCard>
  );
}
