"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { postTypeLabel } from "@/lib/community/post-labels";
import { postTypesForContext } from "@/lib/community/post-permissions";
import type { PostContextType, PostType } from "@/lib/types";
import { cn } from "@/lib/utils";

type PostTypeSelectorProps = {
  contextType: PostContextType;
  value: PostType;
  onChange: (type: PostType) => void;
  canPostOfficial: boolean;
};

export function PostTypeSelector({
  contextType,
  value,
  onChange,
  canPostOfficial,
}: PostTypeSelectorProps) {
  const { t } = useLocale();
  const types = postTypesForContext(
    contextType === "club" || contextType === "event" ? contextType : "club",
    canPostOfficial
  );

  return (
    <div className="flex flex-wrap gap-2">
      {types.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            value === type
              ? "border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#93C5FD]"
              : "border-white/[0.08] bg-[#151B24]/50 text-[#94A3B8] hover:text-[#CBD5E1]"
          )}
        >
          {postTypeLabel(type, t)}
        </button>
      ))}
    </div>
  );
}
