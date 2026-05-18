"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ImagePlus } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { createSubmission } from "@/lib/repositories/submissions";
import type { SubmissionType } from "@/lib/types";
import { cn } from "@/lib/utils";

type TabKey = "place" | "event" | "club" | "member" | "correction";

const tabToType: Record<TabKey, SubmissionType> = {
  place: "shop",
  event: "event",
  club: "club",
  member: "member",
  correction: "correction",
};

type SubmitFormProps = {
  compact?: boolean;
  showHeader?: boolean;
};

export function SubmitForm(props: SubmitFormProps) {
  return (
    <Suspense fallback={<GlassPanel className="p-6 text-sm text-[#64748B]">…</GlassPanel>}>
      <SubmitFormInner {...props} />
    </Suspense>
  );
}

function SubmitFormInner({ compact = false, showHeader = true }: SubmitFormProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("place");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [clubName, setClubName] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [buildTags, setBuildTags] = useState("");
  const [permissionConfirmed, setPermissionConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const type = searchParams.get("type");
    const club = searchParams.get("club");
    if (club) setClubName(club);
    if (type === "member") setActiveTab("member");
    else if (type === "event") setActiveTab("event");
    else if (type === "club") setActiveTab("club");
    else if (type === "correction") setActiveTab("correction");
  }, [searchParams]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "place", label: t.submit.place },
    { key: "event", label: t.submit.event },
    { key: "club", label: t.submit.club },
    { key: "member", label: t.submit.member },
    { key: "correction", label: t.submit.correction },
  ];

  const isMember = activeTab === "member";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const city = location.split(",")[0]?.trim() || location.trim();
    const displayName = isMember ? name.trim() : name.trim();

    if (!displayName || !city) {
      setError(t.submit.requiredError);
      return;
    }

    if (isMember && !permissionConfirmed) {
      setError(t.submit.requiredError);
      return;
    }

    if (!isMember && !description.trim()) {
      setError(t.submit.requiredError);
      return;
    }

    setSubmitting(true);
    try {
      const country = location.includes(",")
        ? location.split(",").slice(1).join(",").trim()
        : "Germany";

      await createSubmission({
        type: tabToType[activeTab],
        name: displayName,
        category: category.trim() || undefined,
        city,
        country: country || undefined,
        location: location.trim() || undefined,
        description:
          description.trim() ||
          (isMember
            ? `Member build: ${carMake} ${carModel} ${carYear}`.trim()
            : "Pending review"),
        instagram: instagram.trim() || undefined,
        website: website.trim() || undefined,
        clubName: clubName.trim() || undefined,
        carMake: carMake.trim() || undefined,
        carModel: carModel.trim() || undefined,
        carYear: carYear.trim() || undefined,
        buildTags: buildTags.trim() || undefined,
        permissionConfirmed: isMember ? permissionConfirmed : undefined,
      });

      setSuccess(true);
      setName("");
      setCategory("");
      setLocation("");
      setDescription("");
      setInstagram("");
      setWebsite("");
      setClubName("");
      setCarMake("");
      setCarModel("");
      setCarYear("");
      setBuildTags("");
      setPermissionConfirmed(false);
    } catch {
      setError(t.submit.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  const content = (
    <>
      {showHeader ? <PanelHeader title={t.submit.header} /> : null}
      <div className="border-b border-white/[0.06] px-4 pb-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-white/[0.06] bg-[#151B24]/60 p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-[10px] font-semibold transition min-w-[4.5rem]",
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

      <form
        className={cn("space-y-3 p-4 pt-3", compact && "text-xs")}
        onSubmit={handleSubmit}
      >
        {success ? (
          <p className="rounded-lg border border-[#22C55E]/40 bg-[#22C55E]/10 px-3 py-2 text-xs text-[#22C55E]">
            {t.submit.success}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#EF4444]">
            {error}
          </p>
        ) : null}

        {isMember ? (
          <Field
            label={t.submit.clubName}
            value={clubName}
            onChange={setClubName}
            placeholder="Bavarian Crew"
          />
        ) : null}

        <Field
          label={isMember ? t.submit.displayName : t.common.name}
          value={name}
          onChange={setName}
          placeholder={isMember ? "Alex" : "e.g. KMC Performance"}
        />

        {!isMember ? (
          <Field
            label={t.common.category}
            value={category}
            onChange={setCategory}
            placeholder="Turbo / Tuning Shop"
          />
        ) : null}

        {isMember ? (
          <>
            <Field
              label={t.submit.carMake}
              value={carMake}
              onChange={setCarMake}
              placeholder="BMW"
            />
            <Field
              label={t.submit.carModel}
              value={carModel}
              onChange={setCarModel}
              placeholder="M340i"
            />
            <Field
              label={t.submit.carYear}
              value={carYear}
              onChange={setCarYear}
              placeholder="2021"
            />
            <Field
              label={t.submit.buildTags}
              value={buildTags}
              onChange={setBuildTags}
              placeholder="B58, Stage 2, Exhaust"
            />
          </>
        ) : null}

        <Field
          label={t.common.location}
          value={location}
          onChange={setLocation}
          placeholder="Kaiserslautern, Germany"
        />

        {!isMember ? (
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
              {t.common.description}
            </label>
            <textarea
              rows={compact ? 2 : 3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#EF4444]/40"
            />
          </div>
        ) : null}

        <Field
          label={t.clubs.instagram}
          value={instagram}
          onChange={setInstagram}
          placeholder="@handle or https://instagram.com/..."
        />

        {!isMember && !compact ? (
          <Field
            label={t.common.website}
            value={website}
            onChange={setWebsite}
            placeholder="https://"
          />
        ) : null}

        {isMember ? (
          <label className="flex items-start gap-2 text-xs text-[#CBD5E1]">
            <input
              type="checkbox"
              checked={permissionConfirmed}
              onChange={(e) => setPermissionConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-white/[0.2]"
            />
            <span>{t.submit.permissionLabel}</span>
          </label>
        ) : null}

        {!compact && !isMember ? (
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
              Photos
            </label>
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-white/[0.1] bg-[#151B24]/40 text-[#64748B]">
              <ImagePlus className="mr-2 size-4" />
              <span className="text-xs">Drop photos or click to upload</span>
            </div>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC] hover:bg-[#EF4444]/30 disabled:opacity-50"
        >
          {submitting ? t.submit.submitting : t.submit.submitForReview}
        </Button>
      </form>
    </>
  );

  if (compact) {
    return <GlassPanel>{content}</GlassPanel>;
  }

  return <GlassPanel className="max-w-xl">{content}</GlassPanel>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 text-xs text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#EF4444]/40"
      />
    </div>
  );
}
