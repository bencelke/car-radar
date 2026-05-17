import Link from "next/link";
import { Users } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { accentStyles } from "@/lib/config/accents";
import type { CommunityItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type CommunitiesPanelProps = {
  communities: CommunityItem[];
};

export function CommunitiesPanel({ communities }: CommunitiesPanelProps) {
  return (
    <GlassPanel>
      <PanelHeader
        title="Communities"
        action={
          <Link
            href="/communities"
            className="text-[10px] font-medium text-[#3B82F6] hover:underline"
          >
            View all
          </Link>
        }
      />
      <ul className="divide-y divide-white/[0.05]">
        {communities.map((community) => {
          const accent = accentStyles[community.accent];
          return (
            <li
              key={community.id}
              className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[#151B24]/50"
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                  community.gradient
                )}
              >
                <Users className={cn("size-4", accent.text)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                  {community.name}
                </p>
                <p className="text-[10px] text-[#64748B]">
                  {community.members} members · {community.city}
                </p>
                <p className="truncate text-[10px] text-[#64748B]/80">
                  {community.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
