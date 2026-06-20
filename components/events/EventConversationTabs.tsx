"use client";

import { useState } from "react";

import type { ReactNode } from "react";

import { ContextFeed } from "@/components/community/ContextFeed";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { CarEvent, Club } from "@/lib/types";
import { cn } from "@/lib/utils";

type EventTab = "details" | "updates" | "discussion";

type EventConversationTabsProps = {
  event: CarEvent;
  club?: Club | null;
  details: ReactNode;
};

export function EventConversationTabs({
  event,
  club,
  details,
}: EventConversationTabsProps) {
  const { t } = useLocale();
  const [tab, setTab] = useState<EventTab>("details");

  const tabs: { id: EventTab; label: string }[] = [
    { id: "details", label: t.communityPosts.details },
    { id: "updates", label: t.communityPosts.updates },
    { id: "discussion", label: t.communityPosts.discussion },
  ];

  return (
    <div className="space-y-4">
      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0B1118]/60 p-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-xs font-medium sm:text-sm",
              tab === id
                ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "details" ? details : null}
      {tab === "updates" ? (
        <ContextFeed
          contextType="event"
          contextId={event.id}
          club={club}
          event={event}
          officialOnly
          emptyMessage={t.communityPosts.noUpdatesYet}
        />
      ) : null}
      {tab === "discussion" ? (
        <ContextFeed
          contextType="event"
          contextId={event.id}
          club={club}
          event={event}
          emptyMessage={t.communityPosts.eventDiscussionEmpty}
        />
      ) : null}
    </div>
  );
}
