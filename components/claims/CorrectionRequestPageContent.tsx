"use client";

import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { PageShell } from "@/components/layout/PageShell";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { createCorrectionRequest } from "@/lib/repositories/correction-requests";
import type {
  CorrectionRequestTargetType,
  CorrectionRequestType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const REQUEST_TYPES: CorrectionRequestType[] = [
  "correction",
  "removal",
  "duplicate",
  "privacy",
];

const TARGET_TYPES: CorrectionRequestTargetType[] = [
  "club",
  "member",
  "shop",
  "event",
];

function isTargetType(value: string | null): value is CorrectionRequestTargetType {
  return TARGET_TYPES.includes(value as CorrectionRequestTargetType);
}

function isRequestType(value: string | null): value is CorrectionRequestType {
  return REQUEST_TYPES.includes(value as CorrectionRequestType);
}

function targetBackPath(type: CorrectionRequestTargetType, id: string): string {
  if (type === "member") return `/members/${id}`;
  if (type === "club") return `/clubs/${id}`;
  if (type === "shop") return `/shops/${id}`;
  return `/events/${id}`;
}

export function CorrectionRequestPageContent() {
  return (
    <Suspense
      fallback={
        <PageShell maxWidth="default">
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-[#64748B]" />
          </div>
        </PageShell>
      }
    >
      <CorrectionRequestPageInner />
    </Suspense>
  );
}

function CorrectionRequestPageInner() {
  const { t } = useLocale();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();

  const targetTypeParam = searchParams.get("targetType");
  const targetId = searchParams.get("targetId")?.trim() ?? "";
  const targetNameParam = searchParams.get("targetName")?.trim() ?? "";
  const requestTypeParam = searchParams.get("requestType");
  const targetType = isTargetType(targetTypeParam) ? targetTypeParam : null;
  const requestType = isRequestType(requestTypeParam)
    ? requestTypeParam
    : "correction";

  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.displayName) setRequesterName(user.displayName);
    if (user?.email) setRequesterEmail(user.email);
  }, [user?.displayName, user?.email]);

  if (loading) {
    return (
      <PageShell maxWidth="default">
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-[#64748B]" />
        </div>
      </PageShell>
    );
  }

  if (!targetType || !targetId) {
    return (
      <PageShell maxWidth="default">
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-300" />
          <p className="text-sm text-[#FDE68A]">{t.corrections.missingTarget}</p>
        </div>
      </PageShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    if (!requesterName.trim() || !requesterEmail.trim() || !message.trim()) {
      setError(t.corrections.requiredError);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await createCorrectionRequest({
        targetType: targetType!,
        targetId,
        targetName: targetNameParam || null,
        requestType,
        requesterUid: user?.uid ?? null,
        requesterName,
        requesterEmail,
        message,
      });
      setSuccess(true);
    } catch {
      setError(t.corrections.submitFailed);
    } finally {
      setBusy(false);
    }
  }

  const backHref = targetBackPath(targetType, targetId);

  if (success) {
    return (
      <PageShell maxWidth="default">
        <PublicPageHeader
          title={t.corrections.successTitle}
          subtitle={t.corrections.successBody}
        />
        <Link
          href={backHref}
          className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-[#3B82F6]/40 bg-[#3B82F6]/15 px-4 text-sm font-medium text-[#F8FAFC]"
        >
          {t.corrections.backToListing}
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="default">
      <PublicPageHeader
        title={t.corrections.formTitle}
        subtitle={t.corrections.formBody}
      />

      {targetNameParam ? (
        <p className="mt-4 rounded-xl border border-white/[0.08] bg-[#151B24]/50 px-4 py-3 text-sm text-[#CBD5E1]">
          {targetNameParam}
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
        <Field label={t.corrections.fieldRequestType}>
          <select
            value={requestType}
            onChange={() => {}}
            disabled
            className={inputClass}
          >
            <option value={requestType}>{t.corrections.requestTypes[requestType]}</option>
          </select>
        </Field>
        <Field label={t.corrections.fieldName}>
          <input
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </Field>
        <Field label={t.corrections.fieldEmail}>
          <input
            type="email"
            value={requesterEmail}
            onChange={(e) => setRequesterEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </Field>
        <Field label={t.corrections.fieldMessage}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className={cn(inputClass, "resize-y")}
            placeholder={t.corrections.messagePlaceholder}
          />
        </Field>

        {error ? (
          <p className="text-sm text-[#F87171]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#3B82F6]/40 bg-[#3B82F6]/15 px-4 text-sm font-semibold text-[#F8FAFC] disabled:opacity-50 sm:w-auto"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {t.corrections.submitRequest}
        </button>
      </form>
    </PageShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[#94A3B8]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-[#151B24]/80 px-3 py-2.5 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#3B82F6]/40";
