"use client";

import React, { useState } from "react";

import { FieldWrapper, SelectInput, TextInput } from "../ui/form-field";
import { SectionCard } from "../ui/section-card";

interface QrConsoleProps {
  regions: string[];
}

interface ExportResponse {
  branchCount: number;
  unitCount: number;
  skippedBranchCount: number;
  skippedUnitCount: number;
  outputRoot: string;
  downloads: {
    branchPdf: string | null;
    branchZip: string | null;
    branchManifest: string | null;
    unitPdf: string | null;
    unitZip: string | null;
    unitManifest: string | null;
  };
}

export function QrConsole({ regions }: QrConsoleProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ExportResponse | null>(null);

  return (
    <SectionCard eyebrow="QR export" title="QR Console">
      <p className="max-w-3xl border-b border-[var(--border)] pb-4 text-sm text-[var(--text-muted)]">
        Generate scoped QR bundles for branches and units, then download PDF, ZIP,
        and manifest files directly from the browser. For very large nationwide
        unit runs, the CLI remains the better option.
      </p>

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setErrorMessage(null);
          setResult(null);
          setIsSubmitting(true);

          const formData = new FormData(event.currentTarget);

          try {
            const response = await fetch("/api/qr-console", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                region: String(formData.get("region") ?? ""),
                branchCodes: String(formData.get("branchCodes") ?? ""),
                mode: String(formData.get("mode") ?? "branches"),
                zipOutputs: formData.get("zipOutputs") === "on",
              }),
            });

            if (!response.ok) {
              const payload = (await response.json()) as { error?: string };
              setErrorMessage(payload.error ?? "Failed to generate QR export");
              setIsSubmitting(false);
              return;
            }

            setResult((await response.json()) as ExportResponse);
            setIsSubmitting(false);
          } catch {
            setErrorMessage("Failed to generate QR export");
            setIsSubmitting(false);
          }
        }}
      >
        <FieldWrapper label="Region">
          <SelectInput defaultValue="" name="region">
            <option value="">All regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>

        <FieldWrapper label="Export mode">
          <SelectInput defaultValue="branches" name="mode">
            <option value="branches">Branches only</option>
            <option value="units">Units only</option>
            <option value="both">Branches and units</option>
          </SelectInput>
        </FieldWrapper>

        <FieldWrapper label="Branch codes (optional, comma separated)" spanTwo>
          <TextInput
            name="branchCodes"
            placeholder="BC01, BE01, BE02"
          />
        </FieldWrapper>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] md:col-span-2">
          <input defaultChecked name="zipOutputs" type="checkbox" />
          Include ZIP bundle and manifest
        </label>

        <div className="md:col-span-2 flex justify-end">
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Generating..." : "Generate QR export"}
          </button>
        </div>

        {errorMessage ? (
          <p
            aria-live="polite"
            className="md:col-span-2 text-sm font-medium text-rose-700"
          >
            {errorMessage}
          </p>
        ) : null}
      </form>

      {result ? (
        <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Export result
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Output root: {result.outputRoot}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-[var(--text)]">
              <StatBlock label="Branches" value={String(result.branchCount)} />
              <StatBlock label="Units" value={String(result.unitCount)} />
              <StatBlock label="Skipped branches" value={String(result.skippedBranchCount)} />
              <StatBlock label="Skipped units" value={String(result.skippedUnitCount)} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <DownloadPanel
              title="Branch files"
              links={[
                { label: "Download branch PDF", href: result.downloads.branchPdf },
                { label: "Download branch ZIP", href: result.downloads.branchZip },
                { label: "Download branch manifest", href: result.downloads.branchManifest },
              ]}
            />
            <DownloadPanel
              title="Unit files"
              links={[
                { label: "Download unit PDF", href: result.downloads.unitPdf },
                { label: "Download unit ZIP", href: result.downloads.unitZip },
                { label: "Download unit manifest", href: result.downloads.unitManifest },
              ]}
            />
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}

function DownloadPanel(input: {
  title: string;
  links: Array<{ label: string; href: string | null }>;
}) {
  const availableLinks = input.links.filter((link) => link.href);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-sm font-semibold text-[var(--text)]">{input.title}</p>
      {availableLinks.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">No files generated.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {availableLinks.map((link) => (
            <a
              key={link.label}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href={link.href ?? "#"}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBlock(input: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {input.label}
      </p>
      <p className="mt-2 text-xl font-semibold text-[var(--text)]">{input.value}</p>
    </div>
  );
}
