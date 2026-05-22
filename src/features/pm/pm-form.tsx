"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [submitState, setSubmitState] = useState<null | "saved" | "duplicate">(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submitGuardRef = useRef(false);
  const isLocked = isSubmitting || submitState !== null;

  useEffect(() => {
    if (!submitState) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      router.push(`/units/${initialValues.unitId}`);
    }, 3000);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [initialValues.unitId, router, submitState]);

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
          if (submitGuardRef.current) {
            return;
          }

          submitGuardRef.current = true;
          setErrorMessage(null);
          setIsSubmitting(true);
          setSubmitState(null);
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
              submitGuardRef.current = false;
              setIsSubmitting(false);
              return;
            }

            const payload = (await response.json()) as {
              status?: "saved" | "duplicate";
            };

            setSubmitState(payload.status === "duplicate" ? "duplicate" : "saved");
            setIsSubmitting(false);
          } catch {
            setErrorMessage("Failed to save PM log");
            submitGuardRef.current = false;
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
            disabled={isLocked}
            name="serviceDate"
            required
            type="date"
          />
        </FieldWrapper>

        <FieldWrapper label="Technician name">
          <TextInput
            defaultValue={initialValues.technicianName}
            disabled={isLocked}
            name="technicianName"
            placeholder="Enter technician name"
            required
          />
        </FieldWrapper>

        <FieldWrapper label="Supplier name">
          <TextInput
            defaultValue={initialValues.supplierName}
            disabled={isLocked}
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
            disabled={isLocked}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            {isSubmitting ? "Saving..." : submitState ? "Saved" : "Save PM"}
          </button>
        </div>

        {submitState ? (
          <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <p aria-live="polite" className="font-semibold">
              {submitState === "duplicate"
                ? "This PM record was already saved"
                : "Saved to Google Sheet"}
            </p>
            <p className="mt-1 text-emerald-700">
              {submitState === "duplicate"
                ? "No duplicate row was created."
                : "This PM record was stored successfully."}
            </p>
            <p className="mt-2 text-emerald-700">
              Returning to the unit page in 3 seconds...
            </p>
          </div>
        ) : null}

        {errorMessage ? (
          <p
            aria-live="polite"
            className="md:col-span-2 text-sm font-medium text-rose-700"
          >
            {errorMessage}
          </p>
        ) : null}

        {submitState ? (
          <div className="md:col-span-2 flex justify-end">
            <a
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href={`/units/${initialValues.unitId}`}
            >
              Back to unit
            </a>
          </div>
        ) : null}
      </form>
    </SectionCard>
  );
}
