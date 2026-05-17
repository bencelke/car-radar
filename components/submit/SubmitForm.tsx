"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { createSubmission } from "@/lib/repositories/submissions";
import type { SubmissionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const tabToType: Record<string, SubmissionType> = {
  Place: "shop",
  Event: "event",
  Community: "community",
  Correction: "correction",
};

const tabs = ["Place", "Event", "Community", "Correction"] as const;

type SubmitFormProps = {
  compact?: boolean;
  showHeader?: boolean;
};

export function SubmitForm({ compact = false, showHeader = true }: SubmitFormProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Place");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const city = location.split(",")[0]?.trim() || location.trim();
    if (!name.trim() || !city || !description.trim()) {
      setError("Name, location, and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const country =
        location.includes(",") ? location.split(",").slice(1).join(",").trim() : "Germany";

      await createSubmission({
        type: tabToType[activeTab],
        name: name.trim(),
        category: category.trim() || undefined,
        city,
        country: country || undefined,
        location: location.trim() || undefined,
        description: description.trim(),
        instagram: instagram.trim() || undefined,
        website: website.trim() || undefined,
      });

      setSuccess(true);
      setName("");
      setCategory("");
      setLocation("");
      setDescription("");
      setInstagram("");
      setWebsite("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const content = (
    <>
      {showHeader ? (
        <PanelHeader title="Submit New Place / Event" />
      ) : null}
      <div className="border-b border-white/[0.06] px-4 pb-3">
        <div className="flex gap-1 rounded-lg border border-white/[0.06] bg-[#151B24]/60 p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-[10px] font-semibold transition",
                activeTab === tab
                  ? "bg-[#EF4444]/20 text-[#F8FAFC] shadow-[0_0_12px_-4px_rgba(239,68,68,0.3)]"
                  : "text-[#64748B] hover:text-[#CBD5E1]"
              )}
            >
              {tab}
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
            Submitted for review — thank you!
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#EF4444]">
            {error}
          </p>
        ) : null}

        <Field label="Name" value={name} onChange={setName} placeholder="e.g. KMC Performance" />
        <Field
          label="Category"
          value={category}
          onChange={setCategory}
          placeholder="Turbo / Tuning Shop"
        />
        <Field
          label="Location"
          value={location}
          onChange={setLocation}
          placeholder="Kaiserslautern, Germany"
        />
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
            Description
          </label>
          <textarea
            rows={compact ? 2 : 3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell enthusiasts what makes this spot special..."
            className="w-full resize-none rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#EF4444]/40"
          />
        </div>
        <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="@handle" />
        {!compact ? (
          <Field label="Website" value={website} onChange={setWebsite} placeholder="https://" />
        ) : null}
        {!compact ? (
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
          {submitting ? "Submitting…" : "Submit for Review"}
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
