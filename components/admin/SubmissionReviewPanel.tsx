"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  ExternalLink,
  MessageSquareWarning,
  X,
} from "lucide-react";

import { PublishDraftEditor } from "@/components/admin/PublishDraftEditor";
import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { findPotentialDuplicatesForSubmission } from "@/lib/repositories/duplicate-detection";
import {
  createPublishDraftFromSubmission,
  validatePublishDraft,
  type PublishDraft,
  type PublishDraftValidation,
} from "@/lib/repositories/publish-draft";
import { canPublishSubmission } from "@/lib/repositories/submission-publish";
import {
  approveSubmission,
  markSubmissionNeedsChanges,
  rejectSubmission,
} from "@/lib/repositories/submissions";
import type { PotentialDuplicate } from "@/lib/repositories/duplicate-detection";
import type { Submission, SubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusFilter = SubmissionStatus | "all";

type ReviewAction = "reject" | "needs_changes";

type SubmissionReviewPanelProps = {
  initialSubmissions: Submission[];
};

const statusFilters: StatusFilter[] = [
  "pending",
  "approved",
  "rejected",
  "needs_changes",
  "all",
];

export function SubmissionReviewPanel({
  initialSubmissions,
}: SubmissionReviewPanelProps) {
  const { t } = useLocale();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSubmissions.find((s) => s.status === "pending")?.id ??
      initialSubmissions[0]?.id ??
      null
  );
  const [actingId, setActingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    id: string;
    action: ReviewAction;
  } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [draftById, setDraftById] = useState<Record<string, PublishDraft>>({});
  const [draftValidation, setDraftValidation] =
    useState<PublishDraftValidation | null>(null);
  const [duplicates, setDuplicates] = useState<PotentialDuplicate[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);

  const showMockNote =
    process.env.NODE_ENV === "development" && !isFirebaseConfigured;

  const filtered = useMemo(() => {
    if (filter === "all") return submissions;
    return submissions.filter((s) => s.status === filter);
  }, [submissions, filter]);

  const selected = submissions.find((s) => s.id === selectedId) ?? null;
  const selectedDraft = selected ? draftById[selected.id] : undefined;
  const canEditPublish =
    selected != null &&
    selected.status === "pending" &&
    canPublishSubmission(selected.type);

  useEffect(() => {
    if (!selected || !canEditPublish) {
      setDuplicates([]);
      setDraftValidation(null);
      return;
    }

    const initial = createPublishDraftFromSubmission(selected);
    if (!initial) return;

    setDraftById((prev) => {
      const existing = prev[selected.id];
      const next = existing ?? initial;
      setDraftValidation(validatePublishDraft(next));
      return existing ? prev : { ...prev, [selected.id]: initial };
    });
  }, [selected?.id, selected?.status, selected?.type, canEditPublish]);

  useEffect(() => {
    if (!selected || !canEditPublish) return;

    let cancelled = false;
    setLoadingDuplicates(true);
    const draft = draftById[selected.id] ?? createPublishDraftFromSubmission(selected);

    void findPotentialDuplicatesForSubmission(selected, draft ?? undefined).then(
      (found) => {
        if (!cancelled) setDuplicates(found);
      }
    ).finally(() => {
      if (!cancelled) setLoadingDuplicates(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selected, canEditPublish, draftById, selected?.name, selected?.city]);

  const handleDraftChange = useCallback((draft: PublishDraft) => {
    setDraftById((prev) => ({ ...prev, [draft.submissionId]: draft }));
    setDraftValidation(validatePublishDraft(draft));
  }, []);

  const filterLabel = (key: StatusFilter) => {
    switch (key) {
      case "pending":
        return t.admin.filterPending;
      case "approved":
        return t.admin.filterApproved;
      case "rejected":
        return t.admin.filterRejected;
      case "needs_changes":
        return t.admin.filterNeedsChanges;
      default:
        return t.admin.filterAll;
    }
  };

  const typeLabel = (type: Submission["type"]) => {
    switch (type) {
      case "shop":
        return t.admin.typeShop;
      case "event":
        return t.admin.typeEvent;
      case "club":
        return t.admin.typeClub;
      case "member":
        return t.admin.typeMember;
      case "correction":
        return t.admin.typeCorrection;
      default:
        return t.admin.typeCommunity;
    }
  };

  const statusLabel = (status: SubmissionStatus) => {
    switch (status) {
      case "pending":
        return t.admin.statusPending;
      case "approved":
        return t.admin.statusApproved;
      case "rejected":
        return t.admin.statusRejected;
      case "needs_changes":
        return t.admin.statusNeedsChanges;
    }
  };

  const patchLocal = useCallback((id: string, patch: Partial<Submission>) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setError(null);
    window.setTimeout(() => setToast(null), 4000);
  };

  async function handleApprove(id: string, type: Submission["type"]) {
    setActingId(id);
    setError(null);

    const draft = draftById[id];
    if (canPublishSubmission(type) && draft) {
      const validation = validatePublishDraft(draft);
      setDraftValidation(validation);
      if (!validation.valid) {
        setError(t.admin.draftValidationError);
        return;
      }
    }

    try {
      const result = await approveSubmission(
        id,
        undefined,
        undefined,
        canPublishSubmission(type) ? draft : undefined
      );
      if (!result.success) {
        setError(t.admin.actionError);
        return;
      }
      const now = new Date().toISOString();
      patchLocal(id, {
        status: "approved",
        reviewedAt: now,
        updatedAt: now,
        approvedEntityId: result.approvedEntityId,
        publishedCollection: result.publishedCollection,
      });
      if (result.published) {
        showToast(t.admin.actionPublishedSuccess);
      } else if (type === "correction") {
        showToast(t.admin.actionApprovedCorrectionOnly);
      } else {
        showToast(t.admin.actionSuccess);
      }
    } catch {
      setError(t.admin.actionError);
    } finally {
      setActingId(null);
    }
  }

  async function handleModalConfirm() {
    if (!modal) return;
    if (!reviewNote.trim()) {
      setError(t.admin.reviewNoteRequired);
      return;
    }
    setActingId(modal.id);
    setError(null);
    try {
      const ok =
        modal.action === "reject"
          ? await rejectSubmission(modal.id, reviewNote)
          : await markSubmissionNeedsChanges(modal.id, reviewNote);
      if (!ok) {
        setError(t.admin.actionError);
        return;
      }
      const now = new Date().toISOString();
      const status: SubmissionStatus =
        modal.action === "reject" ? "rejected" : "needs_changes";
      patchLocal(modal.id, {
        status,
        reviewedAt: now,
        updatedAt: now,
        reviewNote: reviewNote.trim(),
      });
      setModal(null);
      setReviewNote("");
      showToast(t.admin.actionSuccess);
    } catch {
      setError(t.admin.actionError);
    } finally {
      setActingId(null);
    }
  }

  function openModal(id: string, action: ReviewAction) {
    setModal({ id, action });
    setReviewNote("");
    setError(null);
  }

  return (
    <GlassPanel className="mt-6 overflow-hidden">
      <PanelHeader title={t.admin.reviewTitle} />
      <div className="border-b border-white/[0.06] px-4 py-3">
        {showMockNote ? (
          <p className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-200/90">
            {t.admin.mockModeNote}
          </p>
        ) : null}
        {toast ? (
          <p className="mb-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-200">
            {toast}
          </p>
        ) : null}
        {error && !modal ? (
          <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-200">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1">
          {statusFilters.map((key) => {
            const count =
              key === "all"
                ? submissions.length
                : submissions.filter((s) => s.status === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  filter === key
                    ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                    : "text-[#64748B] hover:bg-[#151B24] hover:text-[#CBD5E1]"
                )}
              >
                {filterLabel(key)}
                <span className="ml-1.5 text-[#64748B]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid min-h-[420px] lg:grid-cols-5">
        <ul className="divide-y divide-white/[0.05] border-b border-white/[0.06] lg:col-span-2 lg:border-b-0 lg:border-r">
          {filtered.length === 0 ? (
            <li className="px-4 py-12 text-center text-sm text-[#64748B]">
              {t.admin.empty}
            </li>
          ) : (
            filtered.map((sub) => (
              <li key={sub.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(sub.id)}
                  className={cn(
                    "flex w-full items-start gap-2 px-4 py-3 text-left transition hover:bg-white/[0.02]",
                    selectedId === sub.id && "bg-[#EF4444]/10"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                        {typeLabel(sub.type)}
                      </span>
                      <StatusBadge status={sub.status} label={statusLabel(sub.status)} />
                    </div>
                    <p className="truncate text-sm font-medium text-[#F8FAFC]">
                      {sub.name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {[sub.city, sub.country].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-[#94A3B8]">
                      {sub.description}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-[#64748B]" />
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="lg:col-span-3">
          {selected ? (
            <SubmissionDetail
              submission={selected}
              acting={actingId === selected.id}
              t={t}
              typeLabel={typeLabel(selected.type)}
              statusLabel={statusLabel(selected.status)}
              onApprove={() => handleApprove(selected.id, selected.type)}
              isCorrection={selected.type === "correction"}
              canEditPublish={canEditPublish}
              publishDraft={selectedDraft}
              onDraftChange={handleDraftChange}
              draftValidation={draftValidation}
              duplicates={duplicates}
              loadingDuplicates={loadingDuplicates}
              onReject={() => openModal(selected.id, "reject")}
              onNeedsChanges={() => openModal(selected.id, "needs_changes")}
            />
          ) : (
            <p className="px-6 py-16 text-center text-sm text-[#64748B]">
              {t.admin.selectSubmission}
            </p>
          )}
        </div>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#0B1118] p-5 shadow-xl">
            <h3 className="font-heading text-sm font-semibold text-[#F8FAFC]">
              {modal.action === "reject"
                ? t.admin.confirmReject
                : t.admin.confirmNeedsChanges}
            </h3>
            <label className="mt-4 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
              {t.admin.reviewNote}
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={4}
              placeholder={t.admin.reviewNotePlaceholder}
              className="mt-1 w-full rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#EF4444]/40"
            />
            {error && modal ? (
              <p className="mt-2 text-xs text-red-300">{error}</p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="text-[#94A3B8]"
                onClick={() => {
                  setModal(null);
                  setReviewNote("");
                  setError(null);
                }}
              >
                {t.admin.cancel}
              </Button>
              <Button
                type="button"
                className="border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC]"
                disabled={actingId === modal.id}
                onClick={() => void handleModalConfirm()}
              >
                {modal.action === "reject"
                  ? t.admin.reject
                  : t.admin.needsChanges}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </GlassPanel>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: SubmissionStatus;
  label: string;
}) {
  const styles: Record<SubmissionStatus, string> = {
    pending: "border-[#F97316]/40 bg-[#F97316]/15 text-[#F97316]",
    approved: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
    rejected: "border-red-500/40 bg-red-500/15 text-red-400",
    needs_changes: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        styles[status]
      )}
    >
      {label}
    </span>
  );
}

type DetailProps = {
  submission: Submission;
  acting: boolean;
  t: ReturnType<typeof useLocale>["t"];
  typeLabel: string;
  statusLabel: string;
  onApprove: () => void;
  onReject: () => void;
  onNeedsChanges: () => void;
  isCorrection?: boolean;
  canEditPublish?: boolean;
  publishDraft?: PublishDraft;
  onDraftChange?: (draft: PublishDraft) => void;
  draftValidation?: PublishDraftValidation | null;
  duplicates?: PotentialDuplicate[];
  loadingDuplicates?: boolean;
};

function SubmissionDetail({
  submission: sub,
  acting,
  t,
  typeLabel,
  statusLabel,
  onApprove,
  onReject,
  onNeedsChanges,
  isCorrection = false,
  canEditPublish = false,
  publishDraft,
  onDraftChange,
  draftValidation = null,
  duplicates = [],
  loadingDuplicates = false,
}: DetailProps) {
  const locationLine = [sub.area, sub.address].filter(Boolean).join(" · ");
  const coords =
    sub.lat != null && sub.lng != null
      ? `${sub.lat}, ${sub.lng}`
      : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-auto p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              {typeLabel}
            </p>
            <h3 className="font-heading text-lg font-semibold text-[#F8FAFC]">
              {sub.name}
            </h3>
            <p className="text-sm text-[#94A3B8]">
              {[sub.city, sub.country].filter(Boolean).join(", ")}
            </p>
          </div>
          <StatusBadge status={sub.status} label={statusLabel} />
        </div>

        <MetaRow label={t.admin.createdAt} value={formatDate(sub.createdAt)} />
        {sub.submittedByEmail ? (
          <MetaRow
            label={t.admin.submittedBy}
            value={sub.submittedByEmail}
          />
        ) : null}
        {sub.reviewedAt ? (
          <MetaRow label={t.admin.reviewedAt} value={formatDate(sub.reviewedAt)} />
        ) : null}
        {sub.reviewNote ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
              {t.admin.reviewNote}
            </p>
            <p className="mt-1 text-sm text-amber-200/90">{sub.reviewNote}</p>
          </div>
        ) : null}
        {sub.approvedEntityId ? (
          <MetaRow
            label={t.admin.approvedEntityId}
            value={sub.approvedEntityId}
          />
        ) : null}
        {sub.publishedCollection ? (
          <MetaRow
            label={t.admin.publishedCollection}
            value={sub.publishedCollection}
          />
        ) : null}

        <p className="text-sm leading-relaxed text-[#CBD5E1]">{sub.description}</p>

        <Section title={t.admin.sectionLocation}>
          {sub.category ? <Field label={t.common.category} value={sub.category} /> : null}
          {locationLine ? <Field label={t.common.location} value={locationLine} /> : null}
          {coords ? <Field label="Lat / Lng" value={coords} /> : null}
        </Section>

        <Section title={t.admin.sectionSocial}>
          <LinkField label="Instagram" href={sub.instagram} openLabel={t.admin.openLink} />
          <LinkField label="TikTok" href={sub.tiktok} openLabel={t.admin.openLink} />
          <LinkField label="YouTube" href={sub.youtube} openLabel={t.admin.openLink} />
          <LinkField label={t.common.website} href={sub.website} openLabel={t.admin.openLink} />
          <LinkField label="Source" href={sub.sourceUrl} openLabel={t.admin.openLink} />
        </Section>

        <TypeSpecificFields sub={sub} t={t} />

        {canEditPublish && publishDraft && onDraftChange ? (
          <PublishDraftEditor
            draft={publishDraft}
            onChange={onDraftChange}
            validation={draftValidation}
            duplicates={duplicates}
            loadingDuplicates={loadingDuplicates}
            t={t}
          />
        ) : null}
      </div>

      {sub.status === "pending" ? (
        <div className="flex flex-col gap-3 border-t border-white/[0.06] p-4">
          {isCorrection ? (
            <p className="text-xs text-amber-200/80">
              {t.admin.correctionPublishNote}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={acting}
              className="border border-emerald-500/50 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25"
              onClick={onApprove}
            >
              <Check className="mr-1.5 size-4" />
              {isCorrection ? t.admin.approveCorrection : t.admin.approve}
            </Button>
            <Button
              type="button"
              disabled={acting}
              variant="outline"
              className="border-amber-500/40 text-amber-200"
              onClick={onNeedsChanges}
            >
              <MessageSquareWarning className="mr-1.5 size-4" />
              {t.admin.needsChanges}
            </Button>
            <Button
              type="button"
              disabled={acting}
              variant="outline"
              className="border-red-500/40 text-red-300"
              onClick={onReject}
            >
              <X className="mr-1.5 size-4" />
              {t.admin.reject}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TypeSpecificFields({
  sub,
  t,
}: {
  sub: Submission;
  t: DetailProps["t"];
}) {
  const rows: { label: string; value?: string | number | boolean }[] = [];

  if (sub.type === "shop") {
    if (sub.services?.length)
      rows.push({ label: "Services", value: sub.services.join(", ") });
    if (sub.brandsSupported?.length)
      rows.push({ label: "Brands", value: sub.brandsSupported.join(", ") });
  }
  if (sub.type === "event") {
    if (sub.startTime) rows.push({ label: "Start", value: sub.startTime });
    if (sub.endTime) rows.push({ label: "End", value: sub.endTime });
    if (sub.organizerName)
      rows.push({ label: "Organizer", value: sub.organizerName });
  }
  if (sub.type === "club") {
    if (sub.clubType) rows.push({ label: "Club type", value: sub.clubType });
    if (sub.memberCountEstimate != null)
      rows.push({ label: "Members (est.)", value: sub.memberCountEstimate });
  }
  if (sub.type === "member") {
    if (sub.clubName) rows.push({ label: "Club", value: sub.clubName });
    if (sub.carMake || sub.carModel)
      rows.push({
        label: "Car",
        value: [sub.carYear, sub.carMake, sub.carModel, sub.carName]
          .filter(Boolean)
          .join(" "),
      });
    if (sub.buildSummary)
      rows.push({ label: "Build", value: sub.buildSummary });
    if (sub.buildTags?.length)
      rows.push({ label: "Build tags", value: sub.buildTags.join(", ") });
    rows.push({
      label: t.admin.permissionConfirmed,
      value: sub.permissionConfirmed ? t.admin.yes : t.admin.no,
    });
  }
  if (sub.type === "correction") {
    if (sub.targetType) rows.push({ label: "Target type", value: sub.targetType });
    if (sub.targetName) rows.push({ label: "Target", value: sub.targetName });
    if (sub.correctionDetails)
      rows.push({ label: "Correction", value: sub.correctionDetails });
  }
  if (sub.tags?.length) rows.push({ label: "Tags", value: sub.tags.join(", ") });

  if (rows.length === 0) return null;

  return (
    <Section title={t.admin.sectionTypeDetails}>
      {rows.map((row) => (
        <Field key={row.label} label={row.label} value={String(row.value)} />
      ))}
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs">
      <span className="text-[#64748B]">{label}: </span>
      <span className="text-[#CBD5E1]">{value}</span>
    </p>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs text-[#64748B]">
      <span className="font-medium uppercase tracking-wider">{label}: </span>
      <span className="text-[#94A3B8]">{value}</span>
    </p>
  );
}

function LinkField({
  label,
  href,
  openLabel,
}: {
  label: string;
  href?: string;
  openLabel: string;
}) {
  if (!href) return null;
  return (
    <p className="flex items-center gap-2 text-xs">
      <span className="text-[#64748B]">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[#3B82F6] hover:underline"
      >
        {openLabel}
        <ExternalLink className="size-3" />
      </a>
    </p>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
