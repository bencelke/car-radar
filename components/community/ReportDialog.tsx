"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { createPostReport } from "@/lib/repositories/post-reports";
import type { PostContextType, PostReportReason, PostReportTargetType } from "@/lib/types";
import { cn } from "@/lib/utils";

const REASONS: PostReportReason[] = [
  "spam",
  "harassment",
  "unsafe",
  "hate",
  "illegal",
  "misinformation",
  "other",
];

type ReportDialogProps = {
  open: boolean;
  onClose: () => void;
  targetType: PostReportTargetType;
  targetId: string;
  postId?: string;
  contextType?: PostContextType;
  contextId?: string;
};

export function ReportDialog({
  open,
  onClose,
  targetType,
  targetId,
  postId,
  contextType,
  contextId,
}: ReportDialogProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [reason, setReason] = useState<PostReportReason>("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!user) return;
    setBusy(true);
    try {
      await createPostReport(
        {
          targetType,
          targetId,
          postId,
          contextType,
          contextId,
          reason,
          details,
        },
        user.uid
      );
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#0B1118] p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F8FAFC]">
            {targetType === "post"
              ? t.communityPosts.reportPost
              : t.communityPosts.reportComment}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-lg text-[#94A3B8]"
          >
            <X className="size-4" />
          </button>
        </div>

        {done ? (
          <p className="text-sm text-[#94A3B8]">{t.communityPosts.postReported}</p>
        ) : (
          <>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm",
                    reason === r
                      ? "border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#F8FAFC]"
                      : "border-white/[0.08] text-[#94A3B8]"
                  )}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="sr-only"
                  />
                  {t.communityPosts.reportReasons[r]}
                </label>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder={t.communityPosts.reportDetailsOptional}
              className="mt-3 w-full rounded-lg border border-white/[0.08] bg-[#151B24]/80 px-3 py-2 text-sm text-[#F8FAFC] outline-none"
            />
            <button
              type="button"
              disabled={busy || !user}
              onClick={() => void handleSubmit()}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#EF4444]/35 bg-[#EF4444]/15 text-sm font-semibold text-[#F8FAFC] disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {t.communityPosts.submitReport}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
