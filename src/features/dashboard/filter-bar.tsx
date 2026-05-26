import Link from "next/link";
import React from "react";

import type { DashboardFilters } from "../../lib/services/dashboard-filter";
import { FieldWrapper, SelectInput } from "../ui/form-field";
import { SectionCard } from "../ui/section-card";

interface DashboardFilterBarProps {
  actionHref?: string;
  filters: DashboardFilters;
  years: number[];
  regions: string[];
  suppliers: string[];
  seniors: string[];
  states: string[];
  resetHref?: string;
}

const MONTH_OPTIONS = [
  { value: "", label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const;

const CYCLE_OPTIONS = [
  { value: "", label: "Active cycle" },
  { value: "1", label: "Cycle 1 (1, 5, 9)" },
  { value: "2", label: "Cycle 2 (2, 6, 10)" },
  { value: "3", label: "Cycle 3 (3, 7, 11)" },
  { value: "4", label: "Cycle 4 (4, 8, 12)" },
] as const;

export function DashboardFilterBar({
  actionHref = "/dashboard",
  filters,
  years,
  regions,
  suppliers,
  seniors,
  states,
  resetHref = "/dashboard",
}: DashboardFilterBarProps) {
  return (
    <SectionCard eyebrow="Report filters" title="Filter reporting scope">
      <form action={actionHref} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FieldWrapper label="Year">
          <SelectInput aria-label="Year" defaultValue={String(filters.year)} name="year">
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>

        <FieldWrapper label="Month">
          <SelectInput
            aria-label="Month"
            defaultValue={filters.month != null ? String(filters.month) : ""}
            name="month"
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>

        <FieldWrapper label="Cycle">
          <SelectInput
            aria-label="Cycle"
            defaultValue={
              filters.month == null && filters.cycle != null
                ? String(filters.cycle)
                : ""
            }
            name="cycle"
          >
            {CYCLE_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>

        <FieldWrapper label="Region">
          <SelectInput aria-label="Region" defaultValue={filters.region ?? ""} name="region">
            <option value="">All regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>

        <FieldWrapper label="Supplier">
          <SelectInput
            aria-label="Supplier"
            defaultValue={filters.supplier ?? ""}
            name="supplier"
          >
            <option value="">All suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>

        <FieldWrapper label="Senior">
          <SelectInput aria-label="Senior" defaultValue={filters.senior ?? ""} name="senior">
            <option value="">All seniors</option>
            {seniors.map((senior) => (
              <option key={senior} value={senior}>
                {senior}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>

        <FieldWrapper label="State">
          <SelectInput aria-label="State" defaultValue={filters.state ?? ""} name="state">
            <option value="">All states</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>

        <div className="flex items-end gap-3">
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            type="submit"
          >
            Apply filters
          </button>
          <Link
            className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            href={resetHref}
          >
            Reset filters
          </Link>
        </div>
      </form>

      <p className="mt-4 text-xs text-[var(--text-muted)]">
        If both month and cycle appear in the URL, month takes priority for the active reporting scope.
      </p>
    </SectionCard>
  );
}
