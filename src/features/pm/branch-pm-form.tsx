"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PM_SERVICE_STATUS } from "../../lib/validation/pm-schema";
import {
  FieldWrapper,
  FixedValueField,
  TextInput,
} from "../ui/form-field";
import { SectionCard } from "../ui/section-card";

export interface BranchPmFormValues {
  branchCode: string;
  unitCount: number;
  serviceDate: string;
  technicianName: string;
  supplierName: string;
  serviceStatus: typeof PM_SERVICE_STATUS;
}

interface BranchPmFormProps {
  initialValues: BranchPmFormValues;
}

interface BranchPmSubmitResult {
  status: "saved" | "duplicate";
  savedCount: number;
  duplicateCount: number;
  totalUnits: number;
}

export function BranchPmForm({ initialValues }: BranchPmFormProps) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<BranchPmSubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submitGuardRef = useRef(false);
  const isLocked = isSubmitting || submitState !== null;

  useEffect(() => {
    if (!submitState) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      router.push(`/branches/${initialValues.branchCode}`);
    }, 3000);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [initialValues.branchCode, router, submitState]);

  return (
    <SectionCard eyebrow="Branch PM form" title="Submit PM for the whole branch">
      <p className="max-w-2xl border-b border-[var(--border)] pb-4 text-sm text-[var(--text-muted)]">
        Submit one PM round for every unit in this branch. The system will save a
        PM log for each unit and safely skip any duplicates it finds.
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
            const response = await fetch("/api/pm/branch", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                branchCode: String(formData.get("branchCode") ?? ""),
                serviceDate: String(formData.get("serviceDate") ?? ""),
                technicianName: String(formData.get("technicianName") ?? ""),
                supplierName: String(formData.get("supplierName") ?? ""),
                serviceStatus: String(formData.get("serviceStatus") ?? ""),
              }),
            });

            if (!response.ok) {
              const payload = (await response.json()) as { error?: string };
              setErrorMessage(payload.error ?? "Failed to save branch PM");
              submitGuardRef.current = false;
              setIsSubmitting(false);
              return;
            }

            setSubmitState((await response.json()) as BranchPmSubmitResult);
            setIsSubmitting(false);
          } catch {
            setErrorMessage("Failed to save branch PM");
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
          label="Units in branch"
          name="unitCount"
          value={String(initialValues.unitCount)}
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
            {isSubmitting ? "Saving..." : submitState ? "Saved" : "Save branch PM"}
          </button>
        </div>

        {submitState ? (
          <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <p aria-live="polite" className="font-semibold">
              {submitState.status === "duplicate"
                ? "This branch PM round was already saved"
                : "Saved branch PM to Google Sheet"}
            </p>
            <p className="mt-1 text-emerald-700">
              Saved {submitState.savedCount} of {submitState.totalUnits} units.
              {submitState.duplicateCount > 0
                ? ` ${submitState.duplicateCount} duplicate unit records were skipped.`
                : " No duplicate unit records were found."}
            </p>
            <p className="mt-2 text-emerald-700">
              Returning to the branch page in 3 seconds...
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
              href={`/branches/${initialValues.branchCode}`}
            >
              Back to branch
            </a>
          </div>
        ) : null}
      </form>
    </SectionCard>
  );
}
