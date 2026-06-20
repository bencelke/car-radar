"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { createComment } from "@/lib/repositories/post-comments";
import type { CommunityPost } from "@/lib/types";

type CommentComposerProps = {
  post: CommunityPost;
  onCreated: () => void;
};

export function CommentComposer({ post, onCreated }: CommentComposerProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <p className="text-xs text-[#64748B]">{t.communityPosts.signInToJoin}</p>
    );
  }

  async function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await createComment(
        {
          postId: post.id,
          contextType: post.contextType === "event" ? "event" : "club",
          contextId: post.contextId,
          body: trimmed,
        },
        {
          uid: user!.uid,
          displayName: user!.displayName ?? user!.email ?? "Driver",
          avatarUrl: user!.photoURL ?? undefined,
        }
      );
      setBody("");
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={1500}
        rows={2}
        placeholder={t.communityPosts.writeComment}
        className="w-full resize-y rounded-lg border border-white/[0.08] bg-[#151B24]/80 px-3 py-2 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#3B82F6]/40"
      />
      <button
        type="button"
        disabled={busy || !body.trim()}
        onClick={() => void handleSubmit()}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#3B82F6]/35 bg-[#3B82F6]/15 px-4 text-xs font-semibold text-[#F8FAFC] disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        {t.communityPosts.comment}
      </button>
    </div>
  );
}
