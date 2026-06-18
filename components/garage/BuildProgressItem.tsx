"use client";

import { Gauge, Sparkles } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { BuildProgressUpdate } from "@/lib/types";

type BuildProgressItemProps = {
  update: BuildProgressUpdate;
  onDelete: (id: string) => void;
};

export function BuildProgressItem({ update, onDelete }: BuildProgressItemProps) {
  const { t } = useLocale();

  return (
    <li className="relative">
      <span className="absolute -left-[1.35rem] top-2 size-2.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
      <article className="rounded-xl border border-white/[0.08] bg-[#151B24]/50 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {update.horsepowerSnapshot != null ? (
              <Gauge className="size-4 text-[#EF4444]" />
            ) : (
              <Sparkles className="size-4 text-[#A855F7]" />
            )}
            <p className="font-medium text-[#F8FAFC]">{update.title}</p>
          </div>
          <time className="text-[10px] text-[#64748B]">
            {new Date(update.createdAt).toLocaleDateString()}
          </time>
        </div>
        {update.body ? (
          <p className="mt-1 text-xs text-[#94A3B8]">{update.body}</p>
        ) : null}
        {update.horsepowerSnapshot != null ? (
          <p className="mt-1 text-xs text-[#FCA5A5]">
            {update.horsepowerSnapshot} {t.garage.horsepowerUnit}
          </p>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2 h-7 border-red-500/30 text-red-200"
          onClick={() => void onDelete(update.id)}
        >
          {t.garage.delete}
        </Button>
      </article>
    </li>
  );
}
