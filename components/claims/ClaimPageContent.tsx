"use client";

import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { PageShell } from "@/components/layout/PageShell";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import {
  createProfileClaim,
  loadClaimTargetName,
} from "@/lib/repositories/profile-claims";
import type { ProfileClaimProofType, ProfileClaimTargetType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROOF_TYPES: ProfileClaimProofType[] = [
  "instagram_dm",
  "club_manager_invite",
  "email_match",
  "manual",
  "other",
];

function isValidTargetType(value: string | null): value is ProfileClaimTargetType {
  return value === "club" || value === "member" || value === "shop";
}

function targetBackPath(
  targetType: ProfileClaimTargetType,
  targetId: string
): string {
  if (targetType === "member") return `/members/${targetId}`;
  if (targetType === "club") return `/clubs/${targetId}`;
  return `/shops/${targetId}`;
}

export function ClaimPageContent() {
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
      <ClaimPageInner />
    </Suspense>
  );
}

function ClaimPageInner() {
  const { t } = useLocale();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();

  const rawType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId")?.trim() ?? "";
  const targetType = isValidTargetType(rawType) ? rawType : null;

  const [targetName, setTargetName] = useState<string | null>(null);
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [proofType, setProofType] = useState<ProfileClaimProofType>("instagram_dm");
  const [proofUrl, setProofUrl] = useState("");
  const [proofText, setProofText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.displayName) setRequesterName(user.displayName);
    if (user?.email) setRequesterEmail(user.email);
  }, [user?.displayName, user?.email]);

  useEffect(() => {
    if (!targetType || !targetId) return;
    void loadClaimTargetName(targetType, targetId).then(setTargetName);
  }, [targetType, targetId]);

  if (loading) {
    return (
      <PageShell maxWidth="default">
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-[#64748B]" />
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell maxWidth="default">
        <PublicPageHeader title={t.claims.formTitle} subtitle={t.claims.formBody} />
        <p className="mt-4 text-sm text-[#94A3B8]">{t.auth.signIn}</p>
        <Link
          href={`/login?next=${encodeURIComponent(`/claim?targetType=${targetType ?? "member"}&targetId=${targetId}`)}`}
          className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-[#3B82F6]/40 bg-[#3B82F6]/15 px-4 text-sm font-medium text-[#F8FAFC]"
        >
          {t.auth.login}
        </Link>
      </PageShell>
    );
  }

  if (!targetType || !targetId) {
    return (
      <PageShell maxWidth="default">
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-300" />
          <p className="text-sm text-[#FDE68A]">{t.claims.missingTarget}</p>
        </div>
      </PageShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || busy) return;

    if (!requesterName.trim() || !requesterEmail.trim() || !proofText.trim()) {
      setError(t.claims.requiredError);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await createProfileClaim({
        targetType: targetType!,
        targetId,
        targetName: targetName ?? undefined,
        requestedByUid: user.uid,
        requesterEmail,
        requesterName,
        proofType,
        proofUrl: proofUrl.trim() || null,
        proofText,
      });
      setSuccess(true);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      setError(
        code === "CLAIM_ALREADY_PENDING" ? t.claims.alreadyPending : t.claims.submitFailed
      );
    } finally {
      setBusy(false);
    }
  }

  const backHref = targetBackPath(targetType, targetId);

  if (success) {
    return (
      <PageShell maxWidth="default">
        <PublicPageHeader title={t.claims.successTitle} subtitle={t.claims.successBody} />
        <Link
          href={backHref}
          className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-[#3B82F6]/40 bg-[#3B82F6]/15 px-4 text-sm font-medium text-[#F8FAFC]"
        >
          {t.claims.backToProfile}
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="default">
      <PublicPageHeader title={t.claims.formTitle} subtitle={t.claims.formBody} />

      {targetName ? (
        <p className="mt-4 rounded-xl border border-white/[0.08] bg-[#151B24]/50 px-4 py-3 text-sm text-[#CBD5E1]">
          {targetName}
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
        <Field label={t.claims.fieldName}>
          <input
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </Field>
        <Field label={t.claims.fieldEmail}>
          <input
            type="email"
            value={requesterEmail}
            onChange={(e) => setRequesterEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </Field>
        <Field label={t.claims.fieldProofType}>
          <select
            value={proofType}
            onChange={(e) => setProofType(e.target.value as ProfileClaimProofType)}
            className={inputClass}
          >
            {PROOF_TYPES.map((type) => (
              <option key={type} value={type}>
                {t.claims.proofTypes[type]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.claims.fieldProofUrl}>
          <input
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://instagram.com/..."
            className={inputClass}
          />
        </Field>
        <Field label={t.claims.fieldMessage}>
          <textarea
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
            rows={4}
            className={cn(inputClass, "resize-y")}
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
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#EF4444]/45 bg-[#EF4444]/20 px-4 text-sm font-semibold text-[#F8FAFC] disabled:opacity-50 sm:w-auto"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {t.claims.submitClaim}
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
