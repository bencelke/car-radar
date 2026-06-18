"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { CarEvent, Club } from "@/lib/types";

export type EventFormValues = {
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  city: string;
  country: string;
  area: string;
  address: string;
  description: string;
  meetingRoute: string;
  maxAttendance: string;
  organizerName: string;
  organizerInstagram: string;
  lat: string;
  lng: string;
};

type EventFormProps = {
  club: Club;
  initial?: Partial<CarEvent>;
  onSubmit: (values: EventFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function EventForm({ club, initial, onSubmit, onCancel }: EventFormProps) {
  const { t } = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<EventFormValues>({
    title: initial?.title ?? "",
    type: initial?.type ?? "Meet",
    startTime: initial?.startTime?.slice(0, 16) ?? "",
    endTime: initial?.endTime?.slice(0, 16) ?? "",
    city: initial?.city ?? club.city,
    country: initial?.country ?? club.country,
    area: initial?.area ?? club.area ?? "",
    address: initial?.address ?? "",
    description: initial?.description ?? "",
    meetingRoute: initial?.meetingRoute ?? "",
    maxAttendance: initial?.maxAttendance?.toString() ?? "",
    organizerName: initial?.organizerName ?? club.ownerName ?? "",
    organizerInstagram: initial?.organizerInstagram ?? club.contactInstagram ?? "",
    lat: initial?.lat?.toString() ?? "",
    lng: initial?.lng?.toString() ?? "",
  });

  function setField<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch {
      setError(t.community.saveError);
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "h-9 w-full rounded-lg border border-white/[0.08] bg-[#0B1118] px-3 text-sm text-[#F8FAFC]";
  const labelClass = "mb-1 block text-[10px] uppercase tracking-wider text-[#64748B]";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Title *</label>
          <input
            required
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <input
            value={values.type}
            onChange={(e) => setField("type", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Start *</label>
          <input
            required
            type="datetime-local"
            value={values.startTime}
            onChange={(e) => setField("startTime", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>End</label>
          <input
            type="datetime-local"
            value={values.endTime}
            onChange={(e) => setField("endTime", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <input
            required
            value={values.city}
            onChange={(e) => setField("city", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Country *</label>
          <input
            required
            value={values.country}
            onChange={(e) => setField("country", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Address / location *</label>
          <input
            required
            value={values.address}
            onChange={(e) => setField("address", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>{t.community.meetingRoute}</label>
          <input
            value={values.meetingRoute}
            onChange={(e) => setField("meetingRoute", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t.community.maxAttendance}</label>
          <input
            type="number"
            min={1}
            value={values.maxAttendance}
            onChange={(e) => setField("maxAttendance", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Organizer</label>
          <input
            value={values.organizerName}
            onChange={(e) => setField("organizerName", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description *</label>
          <textarea
            required
            rows={4}
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-[#0B1118] px-3 py-2 text-sm text-[#F8FAFC]"
          />
        </div>
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={busy}
          className="border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC]"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : t.community.saveEvent}
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
