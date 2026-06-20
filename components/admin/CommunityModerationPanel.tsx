"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getPostById } from "@/lib/repositories/posts";
import {
  getPendingReports,
  reviewReport,
} from "@/lib/repositories/post-reports";
import { moderatePost } from "@/lib/repositories/posts";
import type { CommunityPost, PostReport } from "@/lib/types";

export function CommunityModerationPanel() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [reports, setReports] = useState<PostReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setReports(await getPendingReports());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDismiss(report: PostReport) {
    if (!user) return;
    setBusyId(report.id);
    try {
      await reviewReport(report.id, "dismiss", user.uid, "dismissed");
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } finally {
      setBusyId(null);
    }
  }

  async function handleAction(report: PostReport) {
    if (!user) return;
    setBusyId(report.id);
    try {
      if (report.targetType === "post") {
        await moderatePost(
          report.targetId,
          "remove",
          {
            uid: user.uid,
            displayName: user.displayName ?? "Admin",
            isGlobalAdmin: true,
          },
          { reason: `report:${report.reason}` }
        );
      }
      await reviewReport(report.id, "actioned", user.uid, "content_removed");
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-[#64748B]" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <p className="rounded-xl border border-white/[0.08] bg-[#151B24]/40 px-4 py-8 text-center text-sm text-[#64748B]">
        {t.communityPosts.pendingReports}: 0
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-[#F8FAFC]">
        {t.communityPosts.pendingReports}
      </h2>
      {reports.map((report) => (
        <ReportRow
          key={report.id}
          report={report}
          busy={busyId === report.id}
          onDismiss={() => void handleDismiss(report)}
          onAction={() => void handleAction(report)}
        />
      ))}
    </div>
  );
}

function ReportRow({
  report,
  busy,
  onDismiss,
  onAction,
}: {
  report: PostReport;
  busy: boolean;
  onDismiss: () => void;
  onAction: () => void;
}) {
  const { t } = useLocale();
  const [preview, setPreview] = useState<CommunityPost | null>(null);

  useEffect(() => {
    if (report.targetType === "post") {
      void getPostById(report.targetId).then(setPreview);
    }
  }, [report]);

  const contextHref =
    report.contextType === "club" && report.contextId
      ? `/clubs/${report.contextId}`
      : report.contextType === "event" && report.contextId
        ? `/events/${report.contextId}`
        : null;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0B1118]/80 p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
        <span className="rounded-full bg-[#EF4444]/15 px-2 py-0.5 text-[#FCA5A5]">
          {report.targetType}
        </span>
        <span>{t.communityPosts.reportReasons[report.reason]}</span>
        <span>{new Date(report.createdAt).toLocaleString()}</span>
      </div>
      {preview ? (
        <p className="mt-2 line-clamp-3 text-sm text-[#CBD5E1]">{preview.body}</p>
      ) : null}
      {contextHref ? (
        <Link href={contextHref} className="mt-2 inline-block text-xs text-[#3B82F6]">
          View context
        </Link>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onDismiss}
          className="inline-flex min-h-11 items-center rounded-lg border border-white/[0.1] px-3 text-xs text-[#94A3B8]"
        >
          {t.communityPosts.dismissReport}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onAction}
          className="inline-flex min-h-11 items-center rounded-lg border border-[#EF4444]/35 bg-[#EF4444]/15 px-3 text-xs font-semibold text-[#F8FAFC]"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : t.communityPosts.actionReport}
        </button>
      </div>
    </div>
  );
}
