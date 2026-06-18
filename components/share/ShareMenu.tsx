"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Download, Link2, Share2, UserPlus, X } from "lucide-react";

import { CreateInviteDialog } from "@/components/invites/CreateInviteDialog";
import { ShareCardPreview } from "@/components/share/ShareCardPreview";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import {
  buildShareCardModel,
  buildSharePayload,
  trackShare,
} from "@/lib/share/share-service";
import type { ShareEntityInput } from "@/lib/share/share-types";
import {
  canUseNativeShare,
  copyShareLink,
  shareViaWebShare,
} from "@/lib/share/web-share";

export type ShareMenuInviteOptions = {
  joinShiftIt?: boolean;
  joinClub?: { clubId: string };
  claimProfile?: { memberId: string; instagramHandle?: string };
  eventInvite?: { eventId: string };
};

type InvitePreset =
  | "join_shiftit"
  | { clubId: string }
  | { eventId: string }
  | { memberId: string; instagramHandle?: string };

type ShareMenuProps = {
  open: boolean;
  onClose: () => void;
  entity: ShareEntityInput;
  inviteOptions?: ShareMenuInviteOptions;
};

export function ShareMenu({
  open,
  onClose,
  entity,
  inviteOptions,
}: ShareMenuProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitePreset, setInvitePreset] = useState<InvitePreset>("join_shiftit");

  const payload = buildSharePayload(entity, { source: "share_menu" });
  const cardModel = buildShareCardModel(entity, { source: "share_card" });

  const resetFeedback = () => {
    setCopied(false);
    setMessage(null);
  };

  const handleNativeShare = useCallback(async () => {
    setBusy(true);
    resetFeedback();
    try {
      const result = await shareViaWebShare(payload);
      if (result === "shared") {
        setMessage(t.share.share);
        void trackShare({
          action: "native_share",
          entityType: payload.entityType,
          entityId: payload.entityId,
          userId: user?.uid,
          source: "share_menu",
        });
      } else if (result === "unsupported") {
        const ok = await copyShareLink(payload.url);
        setCopied(ok);
        setMessage(ok ? t.share.linkCopied : t.share.copyFailed);
      }
    } catch {
      setMessage(t.share.shareFailed);
    } finally {
      setBusy(false);
    }
  }, [payload, t, user?.uid]);

  const handleCopy = useCallback(async () => {
    setBusy(true);
    resetFeedback();
    const ok = await copyShareLink(payload.url);
    setCopied(ok);
    setMessage(ok ? t.share.linkCopied : t.share.copyFailed);
    if (ok) {
      void trackShare({
        action: "link_copied",
        entityType: payload.entityType,
        entityId: payload.entityId,
        userId: user?.uid,
        source: "share_menu",
      });
    }
    setBusy(false);
  }, [payload, t, user?.uid]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0B1118]/95 p-5 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-white/5 hover:text-[#F8FAFC]"
            aria-label={t.garage.cancel}
          >
            <X className="size-4" />
          </button>

          <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">
            {t.share.share}
          </h2>
          <p className="mt-1 truncate text-xs text-[#64748B]">{payload.url}</p>

          <div className="mt-4 grid gap-2">
            {canUseNativeShare() ? (
              <Button
                type="button"
                disabled={busy}
                onClick={() => void handleNativeShare()}
                className="h-11 w-full justify-start gap-2 border border-[#3B82F6]/30 bg-[#3B82F6]/15 text-[#F8FAFC]"
              >
                <Share2 className="size-4" />
                {t.share.share}
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={busy}
              variant="outline"
              onClick={() => void handleCopy()}
              className="h-11 w-full justify-start gap-2 border-white/10 text-[#CBD5E1]"
            >
              {copied ? <Check className="size-4 text-[#22C55E]" /> : <Copy className="size-4" />}
              {t.share.copyLink}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCard((v) => !v)}
              className="h-11 w-full justify-start gap-2 border-white/10 text-[#CBD5E1]"
            >
              <Download className="size-4" />
              {t.share.downloadShareCard}
            </Button>
          </div>

          {showCard ? (
            <div className="mt-4">
              <ShareCardPreview model={cardModel} payload={payload} userId={user?.uid} />
            </div>
          ) : null}

          <div className="mt-4 border-t border-white/[0.08] pt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
              {t.share.inviteToShiftIt}
            </p>
            <div className="grid gap-2">
              {inviteOptions?.joinShiftIt !== false ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 justify-start gap-2 border-white/10 text-xs text-[#CBD5E1]"
                  onClick={() => {
                    setInvitePreset("join_shiftit");
                    setInviteOpen(true);
                  }}
                >
                  <UserPlus className="size-4" />
                  {t.share.inviteToShiftIt}
                </Button>
              ) : null}
              {inviteOptions?.joinClub ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 justify-start gap-2 border-white/10 text-xs text-[#CBD5E1]"
                  onClick={() => {
                    setInvitePreset(inviteOptions.joinClub!);
                    setInviteOpen(true);
                  }}
                >
                  <Link2 className="size-4" />
                  {t.share.inviteToClub}
                </Button>
              ) : null}
              {inviteOptions?.claimProfile ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 justify-start gap-2 border-white/10 text-xs text-[#CBD5E1]"
                  onClick={() => {
                    setInvitePreset(inviteOptions.claimProfile!);
                    setInviteOpen(true);
                  }}
                >
                  <UserPlus className="size-4" />
                  {t.share.inviteOwnerToClaim}
                </Button>
              ) : null}
              {inviteOptions?.eventInvite ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 justify-start gap-2 border-white/10 text-xs text-[#CBD5E1]"
                  onClick={() => {
                    setInvitePreset(inviteOptions.eventInvite!);
                    setInviteOpen(true);
                  }}
                >
                  <UserPlus className="size-4" />
                  {t.share.inviteToEvent}
                </Button>
              ) : null}
            </div>
          </div>

          {message ? <p className="mt-3 text-xs text-[#94A3B8]">{message}</p> : null}
        </div>
      </div>

      <CreateInviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        preset={invitePreset}
      />
    </>
  );
}
