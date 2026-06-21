"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import type { QueryDocumentSnapshot } from "firebase/firestore";

import {
  PostImageUploader,
  type PostImageValue,
} from "@/components/community/PostImageUploader";
import { PostTypeSelector } from "@/components/community/PostTypeSelector";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { canPostOfficial, OFFICIAL_POST_TYPES } from "@/lib/community/post-permissions";
import { getAvatarUrlFromProfile } from "@/lib/auth/user-avatar";
import { createPost, type PostActor } from "@/lib/repositories/posts";
import { generateId } from "@/lib/repositories/utils";
import type { CarEvent, Club, ClubMember, CommunityPost, PostType } from "@/lib/types";
import { cn } from "@/lib/utils";

type PostComposerProps = {
  contextType: "club" | "event";
  contextId: string;
  club?: Club | null;
  event?: CarEvent | null;
  membership?: ClubMember | null;
  clubName?: string;
  defaultExpanded?: boolean;
  defaultType?: PostType;
  onExpandedChange?: (expanded: boolean) => void;
  onPublished: (post: CommunityPost) => void;
};

export function PostComposer({
  contextType,
  contextId,
  club,
  event,
  membership,
  clubName,
  defaultExpanded = false,
  defaultType = "discussion",
  onExpandedChange,
  onPublished,
}: PostComposerProps) {
  const { t } = useLocale();
  const { user, profile, isAdmin } = useAuth();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PostType>(defaultType);
  const [image, setImage] = useState<PostImageValue | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftPostId = useMemo(() => generateId("post"), []);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  function setExpandedState(value: boolean) {
    setExpanded(value);
    onExpandedChange?.(value);
  }

  const allowsOfficial = canPostOfficial(
    contextType,
    club,
    event,
    user?.uid,
    isAdmin
  );

  if (!user) return null;

  const actor: PostActor = {
    uid: user.uid,
    displayName: user.displayName ?? user.email ?? "Driver",
    avatarUrl: getAvatarUrlFromProfile(profile, user) ?? undefined,
    isGlobalAdmin: isAdmin,
    roleSnapshot: membership?.roleLabel ?? membership?.role,
  };

  const collapsedLabel =
    contextType === "club" && clubName
      ? t.communityPosts.startConversationInClub.replace("{club}", clubName)
      : t.communityPosts.startConversation;

  async function handlePublish() {
    const trimmed = body.trim();
    if (!trimmed) {
      setError(t.communityPosts.bodyRequired);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const post = await createPost(
        {
          contextType,
          contextId,
          clubId: contextType === "club" ? contextId : event?.clubId,
          eventId: contextType === "event" ? contextId : undefined,
          type,
          title: title.trim() || undefined,
          body: trimmed,
          isOfficial: OFFICIAL_POST_TYPES.includes(type),
          ...image,
        },
        actor,
        { club, event, membership }
      );
      setBody("");
      setTitle("");
      setType("discussion");
      setImage(null);
      setExpandedState(false);
      onPublished(post);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.community.saveError);
    } finally {
      setBusy(false);
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpandedState(true)}
        className="flex min-h-[3.25rem] w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#151B24]/50 px-4 text-left transition hover:border-white/[0.12] hover:bg-[#151B24]/70"
      >
        <UserAvatar profile={profile} authUser={user} size="sm" rounded="full" />
        <span className="min-w-0 flex-1 truncate text-sm text-[#94A3B8]">
          {collapsedLabel}
        </span>
        <Camera className="size-4 shrink-0 text-[#64748B]" aria-hidden />
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-3">
        <UserAvatar profile={profile} authUser={user} size="sm" rounded="full" />
        <p className="text-xs font-medium text-[#94A3B8]">{t.communityPosts.writePost}</p>
      </div>
      <PostTypeSelector
        contextType={contextType}
        value={type}
        onChange={setType}
        canPostOfficial={allowsOfficial}
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        placeholder={t.communityPosts.titleOptional}
        className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#151B24]/80 px-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#3B82F6]/40"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={3000}
        rows={4}
        placeholder={t.communityPosts.writePost}
        className="w-full resize-y rounded-lg border border-white/[0.08] bg-[#151B24]/80 px-3 py-2.5 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#3B82F6]/40"
      />
      <PostImageUploader
        contextType={contextType}
        contextId={contextId}
        postId={draftPostId}
        value={image}
        onChange={setImage}
        disabled={busy}
      />
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setExpandedState(false);
            setError(null);
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-white/[0.1] px-4 text-sm text-[#94A3B8] sm:flex-none"
        >
          {t.communityPosts.cancel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePublish()}
          className={cn(
            "inline-flex min-h-11 flex-[2] items-center justify-center gap-2 rounded-lg border border-[#3B82F6]/40 bg-[#3B82F6]/20 px-4 text-sm font-semibold text-[#F8FAFC] sm:flex-none sm:min-w-[8rem]"
          )}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {t.communityPosts.publish}
        </button>
      </div>
    </div>
  );
}
