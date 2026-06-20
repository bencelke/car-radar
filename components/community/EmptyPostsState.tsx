"use client";

import { MessageCircle, Camera, Wrench } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { PostType } from "@/lib/types";
import { cn } from "@/lib/utils";

type EmptyPostsStateProps = {
  canPost: boolean;
  onQuickStart?: (type: PostType) => void;
  className?: string;
};

const QUICK_ACTIONS: { type: PostType; icon: typeof MessageCircle }[] = [
  { type: "question", icon: MessageCircle },
  { type: "car_update", icon: Wrench },
  { type: "meet_photo", icon: Camera },
];

export function EmptyPostsState({
  canPost,
  onQuickStart,
  className,
}: EmptyPostsStateProps) {
  const { t } = useLocale();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#151B24]/70 via-[#0B1118]/80 to-[#0B1118]/60 p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[#3B82F6]/10 blur-2xl"
        aria-hidden
      />
      <div className="relative">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[#151B24]/80 text-[#93C5FD]">
          <MessageCircle className="size-6" />
        </div>
        <h3 className="font-heading text-base font-semibold text-[#F8FAFC]">
          {t.communityPosts.startFirstConversation}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#94A3B8]">
          {t.communityPosts.startFirstConversationHint}
        </p>
        {canPost && onQuickStart ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {QUICK_ACTIONS.map(({ type, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => onQuickStart(type)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#151B24]/60 px-3 text-xs font-medium text-[#CBD5E1] transition hover:border-[#3B82F6]/30 hover:text-[#F8FAFC]"
              >
                <Icon className="size-3.5" />
                {type === "question"
                  ? t.communityPosts.askQuestion
                  : type === "car_update"
                    ? t.communityPosts.shareCarUpdate
                    : t.communityPosts.addMeetPhoto}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
