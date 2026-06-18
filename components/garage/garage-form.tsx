"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const garageInputClass = cn(
  "h-12 w-full rounded-xl border border-white/[0.08] bg-[#151B24]/80 px-3.5 text-sm text-[#F8FAFC]",
  "outline-none transition placeholder:text-[#475569]",
  "focus:border-[#3B82F6]/45 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
);

export function FieldRequirementBadge({
  required,
  requiredLabel,
  optionalLabel,
}: {
  required?: boolean;
  requiredLabel: string;
  optionalLabel: string;
}) {
  return (
    <span
      className={cn(
        "ml-2 inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
        required
          ? "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#93C5FD]"
          : "border-white/[0.08] bg-white/[0.03] text-[#64748B]"
      )}
    >
      {required ? requiredLabel : optionalLabel}
    </span>
  );
}

type GarageFieldProps = {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
  requiredLabel?: string;
  optionalLabel?: string;
};

export function GarageFieldGroup({
  title,
  description,
  optional,
  optionalLabel,
  children,
}: {
  title: string;
  description?: string;
  optional?: boolean;
  optionalLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          {title}
          {optional && optionalLabel ? (
            <span className="ml-2 font-normal normal-case text-[#64748B]">
              ({optionalLabel})
            </span>
          ) : null}
        </h3>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function GarageField({
  id,
  label,
  helper,
  error,
  children,
  className,
  required,
  requiredLabel = "Required",
  optionalLabel = "Optional",
}: GarageFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-[#CBD5E1]">
        {label}
        <FieldRequirementBadge
          required={required}
          requiredLabel={requiredLabel}
          optionalLabel={optionalLabel}
        />
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-helper`} className="text-[11px] text-[#64748B]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export function GarageTextInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  required,
  helper,
  error,
  placeholder,
  autoComplete,
  requiredLabel,
  optionalLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  requiredLabel?: string;
  optionalLabel?: string;
}) {
  return (
    <GarageField
      id={id}
      label={label}
      helper={helper}
      error={error}
      required={required}
      requiredLabel={requiredLabel}
      optionalLabel={optionalLabel}
    >
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : helper ? `${id}-helper` : undefined
        }
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={garageInputClass}
      />
    </GarageField>
  );
}

export function GarageTextarea({
  id,
  label,
  value,
  onChange,
  onBlur,
  rows = 4,
  helper,
  error,
  placeholder,
  maxLength,
  requiredLabel,
  optionalLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  helper?: string;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  requiredLabel?: string;
  optionalLabel?: string;
}) {
  return (
    <GarageField
      id={id}
      label={label}
      helper={helper}
      error={error}
      optionalLabel={optionalLabel}
      requiredLabel={requiredLabel}
    >
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(garageInputClass, "min-h-[7rem] resize-y py-3")}
      />
    </GarageField>
  );
}

export function GarageChoiceCard({
  selected,
  title,
  description,
  icon,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition",
        selected
          ? "border-[#3B82F6]/40 bg-[#3B82F6]/10 shadow-[0_0_24px_-12px_rgba(59,130,246,0.45)]"
          : "border-white/[0.08] bg-[#151B24]/40 hover:border-white/[0.12]"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          selected
            ? "bg-[#3B82F6]/20 text-[#93C5FD]"
            : "bg-white/[0.04] text-[#64748B]"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[#F8FAFC]">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-[#64748B]">
          {description}
        </span>
      </span>
    </button>
  );
}
