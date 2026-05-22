"use client";

import React from "react";
import { useRef, useState } from "react";

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
  const [submitState, setSubmitState] = useState<null | "saved" | "duplicate">(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submitGuardRef = useRef(false);
  const isLocked = isSubmitting || submitState !== null;

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
          if (submitGuardRef.current) {
            return;
          }

          submitGuardRef.current = true;
          setErrorMessage(null);
          setIsSubmitting(true);
          setSubmitState(null);
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
            setErrorMessage("Failed to save repair log");
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

        <FieldWrapper label="Issue category">
          <SelectInput
            defaultValue={initialValues.issueCategory}
            disabled={isLocked}
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
            disabled={isLocked}
            name="issueDetail"
            placeholder="Describe the issue found"
            required
          />
        </FieldWrapper>

        <FieldWrapper label="Repair status">
          <SelectInput
            defaultValue={initialValues.repairStatus}
            disabled={isLocked}
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
            disabled={isLocked}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            {isSubmitting ? "Saving..." : submitState ? "Saved" : "Save repair"}
          </button>
        </div>

        {submitState ? (
          <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <p aria-live="polite" className="font-semibold">
              {submitState === "duplicate"
                ? "This repair record was already saved"
                : "Saved to Google Sheet"}
            </p>
            <p className="mt-1 text-emerald-700">
              {submitState === "duplicate"
                ? "No duplicate row was created."
                : "This repair record was stored successfully."}
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
