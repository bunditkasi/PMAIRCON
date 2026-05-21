"use client";

import React from "react";
import { useState } from "react";

import type { RecordReplacementInput } from "../../lib/services/replacement-service";
import {
  FieldWrapper,
  FixedValueField,
  TextAreaInput,
  TextInput,
} from "../ui/form-field";
import { SectionCard } from "../ui/section-card";

interface ReplacementFormProps {
  initialValues: RecordReplacementInput;
}

export function ReplacementForm({ initialValues }: ReplacementFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="Replacement form"
      title="Record replacement decision"
    >
      <p className="max-w-2xl border-b border-[var(--border)] pb-4 text-sm text-[var(--text-muted)]">
        Use this form when central team decides to retire the current unit and
        register its successor.
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
            const response = await fetch("/api/replacements", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                branchCode: String(formData.get("branchCode") ?? ""),
                oldUnitId: String(formData.get("oldUnitId") ?? ""),
                decisionDate: String(formData.get("decisionDate") ?? ""),
                reason: String(formData.get("reason") ?? ""),
                newUnitId: String(formData.get("newUnitId") ?? ""),
              }),
            });

            if (!response.ok) {
              const payload = (await response.json()) as { error?: string };
              setErrorMessage(payload.error ?? "Failed to save replacement");
              setIsSubmitting(false);
              return;
            }

            setIsSuccess(true);
            setIsSubmitting(false);
          } catch {
            setErrorMessage("Failed to save replacement");
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
          label="Old unit ID"
          name="oldUnitId"
          value={initialValues.oldUnitId}
        />

        <FieldWrapper label="Decision date">
          <TextInput
            defaultValue={initialValues.decisionDate}
            name="decisionDate"
            required
            type="date"
          />
        </FieldWrapper>

        <FieldWrapper label="New unit ID">
          <TextInput
            defaultValue={initialValues.newUnitId}
            name="newUnitId"
            placeholder="Enter the replacement unit ID"
            required
          />
        </FieldWrapper>

        <FieldWrapper
          label="Reason"
          spanTwo
        >
          <TextAreaInput
            defaultValue={initialValues.reason}
            name="reason"
            placeholder="Describe why the unit should be replaced"
            required
          />
        </FieldWrapper>

        <div className="md:col-span-2 flex justify-end">
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Save replacement"}
          </button>
        </div>

        {isSuccess ? (
          <p
            aria-live="polite"
            className="md:col-span-2 text-sm font-medium text-emerald-700"
          >
            Replacement saved
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
