"use client";

import type { Dictionary } from "@/lib/i18n";
import type { PotentialDuplicate } from "@/lib/repositories/duplicate-detection";
import type {
  PublishDraft,
  PublishDraftValidation,
} from "@/lib/repositories/publish-draft";
import { cn } from "@/lib/utils";

type PublishDraftEditorProps = {
  draft: PublishDraft;
  onChange: (draft: PublishDraft) => void;
  validation: PublishDraftValidation | null;
  duplicates: PotentialDuplicate[];
  t: Dictionary;
  loadingDuplicates?: boolean;
};

const inputClass =
  "h-9 w-full rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#EF4444]/40";
const labelClass =
  "mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]";

export function PublishDraftEditor({
  draft,
  onChange,
  validation,
  duplicates,
  t,
  loadingDuplicates,
}: PublishDraftEditorProps) {
  const patch = (partial: Partial<PublishDraft>) => {
    onChange({ ...draft, ...partial });
  };

  const fieldError = (key: keyof PublishDraft) =>
    validation?.fieldErrors[key];

  return (
    <div className="space-y-4 rounded-lg border border-white/[0.06] bg-[#151B24]/40 p-4">
      <div>
        <h4 className="font-heading text-sm font-semibold text-[#F8FAFC]">
          {t.admin.editPublishTitle}
        </h4>
        <p className="mt-1 text-xs text-[#64748B]">{t.admin.editPublishHint}</p>
      </div>

      {validation?.warnings.length ? (
        <ul className="space-y-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-2">
          {validation.warnings.map((w) => (
            <li key={w} className="text-xs text-amber-200/90">
              {w}
            </li>
          ))}
        </ul>
      ) : null}

      {loadingDuplicates ? (
        <p className="text-xs text-[#64748B]">{t.admin.duplicatesLoading}</p>
      ) : null}

      {!loadingDuplicates && duplicates.length > 0 ? (
        <div className="rounded-md border border-orange-500/35 bg-orange-500/10 px-3 py-2">
          <p className="text-xs font-medium text-orange-200">
            {t.admin.duplicateWarningTitle}
          </p>
          <p className="mt-1 text-[11px] text-orange-200/80">
            {t.admin.duplicateWarningBody}
          </p>
          <ul className="mt-2 space-y-1.5">
            {duplicates.map((dup) => (
              <li
                key={`${dup.collection}-${dup.id}`}
                className="text-xs text-[#CBD5E1]"
              >
                <span className="font-medium text-[#F8FAFC]">{dup.name}</span>
                <span className="text-[#64748B]">
                  {" "}
                  · {dup.collection} · {dup.city}
                  {dup.country ? `, ${dup.country}` : ""}
                </span>
                <span className="block text-[10px] text-[#94A3B8]">
                  {dup.matchReason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label={t.common.name}
          value={draft.name}
          error={fieldError("name")}
          onChange={(v) => patch({ name: v })}
        />
        <Field
          label={t.common.city}
          value={draft.city}
          error={fieldError("city")}
          onChange={(v) => patch({ city: v })}
        />
        <Field
          label={t.submit.country}
          value={draft.country}
          onChange={(v) => patch({ country: v })}
        />
        <Field
          label={t.submit.address}
          value={draft.address ?? ""}
          onChange={(v) => patch({ address: v })}
        />
        <Field
          label={t.submit.lat}
          value={draft.lat ?? ""}
          error={fieldError("lat")}
          onChange={(v) => patch({ lat: v })}
        />
        <Field
          label={t.submit.lng}
          value={draft.lng ?? ""}
          error={fieldError("lng")}
          onChange={(v) => patch({ lng: v })}
        />
        <Field
          label={t.common.website}
          value={draft.websiteUrl ?? ""}
          onChange={(v) => patch({ websiteUrl: v })}
        />
        <Field
          label="Instagram"
          value={draft.instagramUrl ?? ""}
          onChange={(v) => patch({ instagramUrl: v })}
        />
        <Field
          className="sm:col-span-2"
          label={t.submit.tags}
          value={draft.tags ?? ""}
          onChange={(v) => patch({ tags: v })}
        />
      </div>

      <div>
        <label className={labelClass}>{t.common.description}</label>
        <textarea
          value={draft.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={3}
          className={cn(
            inputClass,
            "h-auto py-2",
            fieldError("description") && "border-red-500/50"
          )}
        />
        {fieldError("description") ? (
          <p className="mt-1 text-xs text-red-300">{fieldError("description")}</p>
        ) : null}
      </div>

      {draft.publishType === "event" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label={t.submit.startTime}
            value={draft.startTime ?? ""}
            onChange={(v) => patch({ startTime: v })}
            placeholder="2026-06-01T18:00"
          />
          <Field
            label={t.submit.endTime}
            value={draft.endTime ?? ""}
            onChange={(v) => patch({ endTime: v })}
          />
        </div>
      ) : null}

      {draft.publishType === "member" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label={t.submit.clubName}
            value={draft.clubName ?? ""}
            onChange={(v) => patch({ clubName: v })}
          />
          <Field
            label={t.submit.carYear}
            value={draft.carYear ?? ""}
            onChange={(v) => patch({ carYear: v })}
          />
          <Field
            label={t.submit.carMake}
            value={draft.carMake ?? ""}
            onChange={(v) => patch({ carMake: v })}
          />
          <Field
            label={t.submit.carModel}
            value={draft.carModel ?? ""}
            onChange={(v) => patch({ carModel: v })}
          />
          <Field
            className="sm:col-span-2"
            label={t.submit.buildSummary}
            value={draft.buildSummary ?? ""}
            onChange={(v) => patch({ buildSummary: v })}
          />
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, error && "border-red-500/50")}
      />
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

