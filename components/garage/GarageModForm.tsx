"use client";

import { useState } from "react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { GarageMod, GarageModCategory, GarageModStatus } from "@/lib/types";

const categories: GarageModCategory[] = [
  "engine",
  "turbo",
  "exhaust",
  "intake",
  "tune",
  "suspension",
  "wheels",
  "tires",
  "brakes",
  "body",
  "interior",
  "audio",
  "lighting",
  "other",
];

type GarageModFormProps = {
  initial?: GarageMod;
  onSubmit: (values: {
    category: GarageModCategory;
    name: string;
    brand?: string;
    description?: string;
    status: GarageModStatus;
    installedAt?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export function GarageModForm({ initial, onSubmit, onCancel }: GarageModFormProps) {
  const { t } = useLocale();
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState<GarageModCategory>(
    initial?.category ?? "engine"
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<GarageModStatus>(
    initial?.status ?? "planned"
  );

  return (
    <form
      className="space-y-3 rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        setBusy(true);
        void onSubmit({
          category,
          name,
          brand: brand || undefined,
          description: description || undefined,
          status,
        }).finally(() => setBusy(false));
      }}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-[#94A3B8]">
          {t.garage.category}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GarageModCategory)}
            className="mt-1 h-9 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-2 text-sm text-[#F8FAFC]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#94A3B8]">
          {t.garage.modStatus}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as GarageModStatus)}
            className="mt-1 h-9 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-2 text-sm text-[#F8FAFC]"
          >
            <option value="planned">{t.garage.planned}</option>
            <option value="ordered">{t.garage.ordered}</option>
            <option value="installed">{t.garage.installed}</option>
          </select>
        </label>
      </div>
      <label className="block text-xs text-[#94A3B8]">
        {t.garage.modName}
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 h-9 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-3 text-sm text-[#F8FAFC]"
        />
      </label>
      <label className="block text-xs text-[#94A3B8]">
        Brand
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="mt-1 h-9 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-3 text-sm text-[#F8FAFC]"
        />
      </label>
      <label className="block text-xs text-[#94A3B8]">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#151B24] px-3 py-2 text-sm text-[#F8FAFC]"
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy} size="sm">
          {t.garage.save}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          {t.garage.cancel}
        </Button>
      </div>
    </form>
  );
}
