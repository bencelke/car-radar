"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { FeedFilterCategory } from "@/lib/garage/feed-generator";
import { cn } from "@/lib/utils";

type FeedFilterBarProps = {
  value: FeedFilterCategory;
  onChange: (value: FeedFilterCategory) => void;
};

export function FeedFilterBar({ value, onChange }: FeedFilterBarProps) {
  const { t } = useLocale();
  const filters: { id: FeedFilterCategory; label: string }[] = [
    { id: "all", label: t.social.filterAll },
    { id: "mods", label: t.social.filterMods },
    { id: "progress", label: t.social.filterProgress },
    { id: "horsepower", label: t.social.filterHorsepower },
    { id: "photos", label: t.social.filterPhotos },
    { id: "milestones", label: t.social.filterMilestones },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {filters.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide",
            value === id
              ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
              : "text-[#64748B] hover:text-[#CBD5E1]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
