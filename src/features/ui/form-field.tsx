import React from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FieldWrapperProps {
  label: string;
  children: ReactNode;
  spanTwo?: boolean;
}

export function FieldWrapper({
  label,
  children,
  spanTwo = false,
}: FieldWrapperProps) {
  return (
    <label
      className={`grid gap-2 text-sm text-[var(--text-muted)] ${
        spanTwo ? "md:col-span-2" : ""
      }`.trim()}
    >
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

interface FixedValueFieldProps {
  label: string;
  name: string;
  value: string;
}

export function FixedValueField({
  label,
  name,
  value,
}: FixedValueFieldProps) {
  return (
    <FieldWrapper label={label}>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text)]">
        {value}
      </div>
      <input defaultValue={value} name={name} type="hidden" />
    </FieldWrapper>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(44,91,73,0.12)] ${props.className ?? ""}`.trim()}
    />
  );
}

export function TextAreaInput(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`min-h-32 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(44,91,73,0.12)] ${props.className ?? ""}`.trim()}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(44,91,73,0.12)] ${props.className ?? ""}`.trim()}
    />
  );
}
