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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="PM form"
      title="New preventive maintenance log"
    >
      <p className="max-w-2xl border-b border-[var(--border)] pb-4 text-sm text-[var(--text-muted)]">
        Submit a completed PM visit for this specific unit. The saved record
        will update the latest PM date on the unit automatically.
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
            const response = await fetch("/api/pm", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                branchCode: String(formData.get("branchCode") ?? ""),
                unitId: String(formData.get("unitId") ?? ""),
                serviceDate: String(formData.get("serviceDate") ?? ""),
                technicianName: String(formData.get("technicianName") ?? ""),
                supplierName: String(formData.get("supplierName") ?? ""),
                serviceStatus: String(formData.get("serviceStatus") ?? ""),
              }),
            });

            if (!response.ok) {
              const payload = (await response.json()) as { error?: string };
              setErrorMessage(payload.error ?? "Failed to save PM log");
              setIsSubmitting(false);
              return;
            }

            setIsSuccess(true);
            setIsSubmitting(false);
          } catch {
            setErrorMessage("Failed to save PM log");
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
            disabled={isSubmitting}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Save PM"}
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
