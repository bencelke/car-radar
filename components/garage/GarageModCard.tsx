"use client";

import { Pencil, Trash2 } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { GarageMod } from "@/lib/types";

type GarageModCardProps = {
  mod: GarageMod;
  onEdit: () => void;
  onDelete: () => void;
};

const statusClass: Record<GarageMod["status"], string> = {
  planned: "border-[#64748B]/40 bg-[#64748B]/10 text-[#CBD5E1]",
  ordered: "border-amber-500/35 bg-amber-500/10 text-amber-100",
  installed: "border-[#22C55E]/35 bg-[#22C55E]/10 text-[#86EFAC]",
  removed: "border-red-500/30 bg-red-500/10 text-red-200",
};

export function GarageModCard({ mod, onEdit, onDelete }: GarageModCardProps) {
  const { t } = useLocale();
  const statusLabel =
    mod.status === "planned"
      ? t.garage.planned
      : mod.status === "ordered"
        ? t.garage.ordered
        : mod.status === "installed"
          ? t.garage.installed
          : mod.status;

  return (
    <article className="rounded-xl border border-white/[0.08] bg-[#151B24]/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-[#64748B]">
            {mod.category}
          </p>
          <p className="font-medium text-[#F8FAFC]">{mod.name}</p>
          {mod.brand ? (
            <p className="text-xs text-[#94A3B8]">{mod.brand}</p>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${statusClass[mod.status]}`}
        >
          {statusLabel}
        </span>
      </div>
      {mod.description ? (
        <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
          {mod.description}
        </p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onEdit}>
          <Pencil className="size-3.5" />
          {t.garage.editMod}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-red-500/30 text-red-200"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </article>
  );
}
