"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { createSubmission } from "@/lib/repositories/submissions";
import type { CorrectionTargetType, SubmissionType } from "@/lib/types";
import { cn } from "@/lib/utils";

type TabKey = "shop" | "event" | "club" | "member" | "correction";

const tabToType: Record<TabKey, SubmissionType> = {
  shop: "shop",
  event: "event",
  club: "club",
  member: "member",
  correction: "correction",
};

type FormState = {
  name: string;
  category: string;
  country: string;
  city: string;
  area: string;
  address: string;
  lat: string;
  lng: string;
  description: string;
  tags: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  website: string;
  sourceUrl: string;
  submittedByEmail: string;
  services: string;
  brandsSupported: string;
  startTime: string;
  endTime: string;
  organizerName: string;
  organizerInstagram: string;
  clubType: string;
  memberCountEstimate: string;
  clubName: string;
  carMake: string;
  carModel: string;
  carYear: string;
  carName: string;
  buildSummary: string;
  buildTags: string;
  targetType: CorrectionTargetType;
  targetName: string;
  correctionDetails: string;
  permissionConfirmed: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  category: "",
  country: "Germany",
  city: "",
  area: "",
  address: "",
  lat: "",
  lng: "",
  description: "",
  tags: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  website: "",
  sourceUrl: "",
  submittedByEmail: "",
  services: "",
  brandsSupported: "",
  startTime: "",
  endTime: "",
  organizerName: "",
  organizerInstagram: "",
  clubType: "",
  memberCountEstimate: "",
  clubName: "",
  carMake: "",
  carModel: "",
  carYear: "",
  carName: "",
  buildSummary: "",
  buildTags: "",
  targetType: "shop",
  targetName: "",
  correctionDetails: "",
  permissionConfirmed: false,
});

type SubmitFormProps = {
  compact?: boolean;
  showHeader?: boolean;
};

export function SubmitForm(props: SubmitFormProps) {
  return (
    <Suspense
      fallback={
        <GlassPanel className="p-6 text-sm text-[#64748B]">…</GlassPanel>
      }
    >
      <SubmitFormInner {...props} />
    </Suspense>
  );
}

function SubmitFormInner({ compact = false, showHeader = true }: SubmitFormProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("shop");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showMockNote =
    process.env.NODE_ENV === "development" && !isFirebaseConfigured;

  useEffect(() => {
    const type = searchParams.get("type");
    const club = searchParams.get("club");
    if (club) setForm((f) => ({ ...f, clubName: club }));
    if (type === "member") setActiveTab("member");
    else if (type === "event") setActiveTab("event");
    else if (type === "club") setActiveTab("club");
    else if (type === "correction") setActiveTab("correction");
    else if (type === "shop") setActiveTab("shop");
  }, [searchParams]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "shop", label: t.submit.shop },
    { key: "event", label: t.submit.event },
    { key: "club", label: t.submit.club },
    { key: "member", label: t.submit.member },
    { key: "correction", label: t.submit.correction },
  ];

  const patch = (key: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  function validate(): string | null {
    const type = tabToType[activeTab];
    if (type === "correction") {
      if (!form.targetName.trim() || !form.correctionDetails.trim()) {
        return t.submit.requiredError;
      }
      if (!form.city.trim()) return t.submit.requiredError;
      return null;
    }
    if (!form.name.trim() || !form.city.trim()) {
      return t.submit.requiredError;
    }
    if (
      type !== "member" &&
      !form.description.trim()
    ) {
      return t.submit.requiredError;
    }
    if (
      type === "member" &&
      !form.buildSummary.trim() &&
      !form.description.trim()
    ) {
      return t.submit.requiredError;
    }
    if (type === "member" && !form.permissionConfirmed) {
      return t.submit.requiredError;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const type = tabToType[activeTab];
    setSubmitting(true);
    try {
      await createSubmission({
        type,
        name: form.name,
        category: form.category,
        country: form.country,
        city: form.city,
        area: form.area,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
        description:
          type === "member"
            ? form.description ||
              form.buildSummary ||
              [form.carMake, form.carModel, form.carYear]
                .filter(Boolean)
                .join(" ")
            : form.description,
        tags: form.tags,
        instagram: form.instagram,
        tiktok: form.tiktok,
        youtube: form.youtube,
        website: form.website,
        sourceUrl: form.sourceUrl,
        submittedByEmail: form.submittedByEmail || user?.email || undefined,
        submittedByUid: user?.uid,
        permissionConfirmed:
          type === "member" ? form.permissionConfirmed : undefined,
        services: type === "shop" ? form.services : undefined,
        brandsSupported: type === "shop" ? form.brandsSupported : undefined,
        startTime: type === "event" ? form.startTime : undefined,
        endTime: type === "event" ? form.endTime : undefined,
        organizerName: type === "event" ? form.organizerName : undefined,
        organizerInstagram:
          type === "event" ? form.organizerInstagram : undefined,
        clubType: type === "club" ? form.clubType : undefined,
        memberCountEstimate:
          type === "club" ? form.memberCountEstimate : undefined,
        clubName: type === "member" ? form.clubName : undefined,
        carMake: type === "member" ? form.carMake : undefined,
        carModel: type === "member" ? form.carModel : undefined,
        carYear: type === "member" ? form.carYear : undefined,
        carName: type === "member" ? form.carName : undefined,
        buildSummary: type === "member" ? form.buildSummary : undefined,
        buildTags: type === "member" ? form.buildTags : undefined,
        targetType: type === "correction" ? form.targetType : undefined,
        targetName: type === "correction" ? form.targetName : undefined,
        correctionDetails:
          type === "correction" ? form.correctionDetails : undefined,
      });
      setSuccess(true);
      setForm(emptyForm());
    } catch {
      setError(t.submit.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#EF4444]/40";
  const labelClass =
    "mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]";

  return (
    <GlassPanel className={cn("max-w-2xl", compact && "max-w-none")}>
      {showHeader ? (
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">
            {t.submit.header}
          </h2>
          <p className="mt-1 text-sm text-[#94A3B8]">{t.submit.subtitle}</p>
          <p className="mt-2 text-xs text-[#64748B]">{t.submit.reviewNote}</p>
          {showMockNote ? (
            <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-200/90">
              {t.submit.mockModeNote}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="border-b border-white/[0.06] px-4 pb-3 pt-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-white/[0.06] bg-[#151B24]/60 p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "min-w-[4.5rem] flex-1 rounded-md py-2 text-[11px] font-semibold transition",
                activeTab === tab.key
                  ? "bg-[#EF4444]/20 text-[#F8FAFC] shadow-[0_0_12px_-4px_rgba(239,68,68,0.3)]"
                  : "text-[#64748B] hover:text-[#CBD5E1]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-5 p-5" onSubmit={handleSubmit}>
        {success ? (
          <p className="rounded-lg border border-[#22C55E]/40 bg-[#22C55E]/10 px-3 py-2.5 text-sm text-[#22C55E]">
            {t.submit.success}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2.5 text-sm text-[#EF4444]">
            {error}
          </p>
        ) : null}

        {activeTab === "correction" ? (
          <Section title={t.submit.sectionDetails}>
            <Field label={t.submit.targetType}>
              <select
                value={form.targetType}
                onChange={(e) =>
                  patch("targetType", e.target.value as CorrectionTargetType)
                }
                className={inputClass}
              >
                {(
                  ["shop", "event", "club", "member", "zone", "other"] as const
                ).map((v) => (
                  <option key={v} value={v} className="bg-[#151B24]">
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <TextField
              label={t.submit.targetName}
              value={form.targetName}
              onChange={(v) => patch("targetName", v)}
              required
            />
            <TextArea
              label={t.submit.correctionDetails}
              value={form.correctionDetails}
              onChange={(v) => patch("correctionDetails", v)}
              rows={4}
              required
            />
          </Section>
        ) : (
          <>
            {activeTab === "member" ? (
              <Section title={t.submit.sectionDetails}>
                <TextField
                  label={t.submit.clubName}
                  value={form.clubName}
                  onChange={(v) => patch("clubName", v)}
                />
                <TextField
                  label={t.submit.displayName}
                  value={form.name}
                  onChange={(v) => patch("name", v)}
                  required
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <TextField
                    label={t.submit.carMake}
                    value={form.carMake}
                    onChange={(v) => patch("carMake", v)}
                  />
                  <TextField
                    label={t.submit.carModel}
                    value={form.carModel}
                    onChange={(v) => patch("carModel", v)}
                  />
                  <TextField
                    label={t.submit.carYear}
                    value={form.carYear}
                    onChange={(v) => patch("carYear", v)}
                  />
                </div>
                <TextField
                  label={t.submit.carName}
                  value={form.carName}
                  onChange={(v) => patch("carName", v)}
                />
                <TextArea
                  label={t.submit.buildSummary}
                  value={form.buildSummary}
                  onChange={(v) => patch("buildSummary", v)}
                  rows={2}
                />
                <TextField
                  label={t.submit.buildTags}
                  value={form.buildTags}
                  onChange={(v) => patch("buildTags", v)}
                />
              </Section>
            ) : (
              <Section title={t.submit.sectionDetails}>
                <TextField
                  label={t.common.name}
                  value={form.name}
                  onChange={(v) => patch("name", v)}
                  required
                />
                <TextField
                  label={t.common.category}
                  value={form.category}
                  onChange={(v) => patch("category", v)}
                />
                {activeTab === "shop" ? (
                  <>
                    <TextField
                      label={t.submit.services}
                      value={form.services}
                      onChange={(v) => patch("services", v)}
                    />
                    <TextField
                      label={t.submit.brandsSupported}
                      value={form.brandsSupported}
                      onChange={(v) => patch("brandsSupported", v)}
                    />
                  </>
                ) : null}
                {activeTab === "event" ? (
                  <>
                    <TextField
                      label={t.submit.startTime}
                      value={form.startTime}
                      onChange={(v) => patch("startTime", v)}
                      placeholder="2026-06-15T09:00"
                    />
                    <TextField
                      label={t.submit.endTime}
                      value={form.endTime}
                      onChange={(v) => patch("endTime", v)}
                    />
                    <TextField
                      label={t.submit.organizerName}
                      value={form.organizerName}
                      onChange={(v) => patch("organizerName", v)}
                    />
                    <TextField
                      label={t.submit.organizerInstagram}
                      value={form.organizerInstagram}
                      onChange={(v) => patch("organizerInstagram", v)}
                    />
                  </>
                ) : null}
                {activeTab === "club" ? (
                  <>
                    <TextField
                      label={t.submit.clubType}
                      value={form.clubType}
                      onChange={(v) => patch("clubType", v)}
                    />
                    <TextField
                      label={t.submit.memberCountEstimate}
                      value={form.memberCountEstimate}
                      onChange={(v) => patch("memberCountEstimate", v)}
                    />
                  </>
                ) : null}
                <TextArea
                  label={t.common.description}
                  value={form.description}
                  onChange={(v) => patch("description", v)}
                  rows={3}
                  required
                />
                <TextField
                  label={t.submit.tags}
                  value={form.tags}
                  onChange={(v) => patch("tags", v)}
                />
              </Section>
            )}
          </>
        )}

        <Section title={t.submit.sectionLocation}>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label={t.common.city}
              value={form.city}
              onChange={(v) => patch("city", v)}
              required
            />
            <TextField
              label={t.submit.country}
              value={form.country}
              onChange={(v) => patch("country", v)}
            />
          </div>
          <TextField
            label={t.submit.area}
            value={form.area}
            onChange={(v) => patch("area", v)}
          />
          <TextField
            label={t.submit.address}
            value={form.address}
            onChange={(v) => patch("address", v)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label={t.submit.lat}
              value={form.lat}
              onChange={(v) => patch("lat", v)}
            />
            <TextField
              label={t.submit.lng}
              value={form.lng}
              onChange={(v) => patch("lng", v)}
            />
          </div>
        </Section>

        <Section title={t.submit.sectionSocial}>
          <TextField
            label={t.clubs.instagram}
            value={form.instagram}
            onChange={(v) => patch("instagram", v)}
          />
          <TextField
            label={t.submit.tiktok}
            value={form.tiktok}
            onChange={(v) => patch("tiktok", v)}
          />
          <TextField
            label={t.submit.youtube}
            value={form.youtube}
            onChange={(v) => patch("youtube", v)}
          />
          <TextField
            label={t.common.website}
            value={form.website}
            onChange={(v) => patch("website", v)}
          />
          <TextField
            label={t.submit.sourceUrl}
            value={form.sourceUrl}
            onChange={(v) => patch("sourceUrl", v)}
          />
          <TextField
            label={t.submit.submittedByEmail}
            value={form.submittedByEmail}
            onChange={(v) => patch("submittedByEmail", v)}
            type="email"
          />
        </Section>

        {activeTab === "member" ? (
          <label className="flex items-start gap-2 text-sm text-[#CBD5E1]">
            <input
              type="checkbox"
              checked={form.permissionConfirmed}
              onChange={(e) => patch("permissionConfirmed", e.target.checked)}
              className="mt-0.5 rounded border-white/[0.2]"
            />
            <span>{t.submit.permissionLabel}</span>
          </label>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full border border-[#EF4444]/50 bg-[#EF4444]/20 py-2.5 text-[#F8FAFC] hover:bg-[#EF4444]/30 disabled:opacity-50"
        >
          {submitting ? t.submit.submitting : t.submit.submitForReview}
        </Button>
      </form>
    </GlassPanel>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-heading text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#EF4444]/40"
      />
    </Field>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <Field label={label}>
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#EF4444]/40"
      />
    </Field>
  );
}
