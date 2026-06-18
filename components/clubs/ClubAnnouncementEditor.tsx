"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { AnnouncementType } from "@/lib/types";

const ANNOUNCEMENT_TYPES: AnnouncementType[] = [
  "general",
  "meet",
  "route_change",
  "cancellation",
  "sponsor",
  "club_news",
];

type ClubAnnouncementEditorProps = {
  onSubmit: (input: {
    title: string;
    body: string;
    type: AnnouncementType;
  }) => Promise<void>;
  onCancel?: () => void;
};

export function ClubAnnouncementEditor({
  onSubmit,
  onCancel,
}: ClubAnnouncementEditorProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<AnnouncementType>("general");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ title, body, type });
      setTitle("");
      setBody("");
      setType("general");
    } catch {
      setError(t.community.saveError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-3 rounded-xl border border-white/[0.08] bg-[#151B24]/50 p-3"
    >
      <h3 className="text-sm font-semibold text-[#F8FAFC]">
        {t.community.createAnnouncement}
      </h3>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748B]">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AnnouncementType)}
          className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#0B1118] px-2 text-sm text-[#F8FAFC]"
        >
          {ANNOUNCEMENT_TYPES.map((key) => (
            <option key={key} value={key}>
              {t.community.announcementTypes[key]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748B]">
          Title
        </label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#0B1118] px-3 text-sm text-[#F8FAFC]"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748B]">
          Body
        </label>
        <textarea
          required
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg border border-white/[0.08] bg-[#0B1118] px-3 py-2 text-sm text-[#F8FAFC]"
        />
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={busy}
          className="border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC]"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : t.community.publish}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
