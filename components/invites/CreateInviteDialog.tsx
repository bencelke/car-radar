"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import {
  createInvite,
  invitePublicUrl,
} from "@/lib/repositories/user-invites";
import { trackShareAction } from "@/lib/repositories/share-analytics";
import { copyShareLink } from "@/lib/share/web-share";
import type { UserInviteType } from "@/lib/types";

type InvitePreset =
  | "join_shiftit"
  | { clubId: string }
  | { eventId: string }
  | { memberId: string; instagramHandle?: string };

type CreateInviteDialogProps = {
  open: boolean;
  onClose: () => void;
  preset: InvitePreset;
};

function presetToInviteType(preset: InvitePreset): UserInviteType {
  if (preset === "join_shiftit") return "join_shiftit";
  if ("clubId" in preset) return "join_club";
  if ("eventId" in preset) return "event_invite";
  return "claim_profile";
}

function presetFields(preset: InvitePreset) {
  if (preset === "join_shiftit") {
    return {};
  }
  if ("clubId" in preset) {
    return { clubId: preset.clubId };
  }
  if ("eventId" in preset) {
    return { eventId: preset.eventId };
  }
  return {
    memberId: preset.memberId,
    targetInstagramHandle: preset.instagramHandle,
  };
}

export function CreateInviteDialog({ open, onClose, preset }: CreateInviteDialogProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleCreate() {
    if (!user) {
      setError(t.share.signInToInvite);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const invite = await createInvite({
        inviterUid: user.uid,
        inviteType: presetToInviteType(preset),
        ...presetFields(preset),
      });
      const url = invitePublicUrl(invite);
      setInviteUrl(url);
    } catch {
      setError(t.share.inviteCreateFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0B1118] p-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-[#64748B] hover:text-[#F8FAFC]"
        >
          <X className="size-4" />
        </button>
        <h3 className="font-heading text-lg font-semibold text-[#F8FAFC]">
          {t.share.createInvite}
        </h3>

        {!inviteUrl ? (
          <>
            <p className="mt-2 text-sm text-[#94A3B8]">{t.share.createInviteHint}</p>
            <Button
              type="button"
              disabled={busy}
              className="mt-4 w-full border border-[#3B82F6]/30 bg-[#3B82F6]/15"
              onClick={() => void handleCreate()}
            >
              {t.share.createInvite}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-[#22C55E]">{t.share.inviteLinkCreated}</p>
            <p className="mt-2 break-all rounded-lg bg-[#151B24] p-2 text-xs text-[#CBD5E1]">
              {inviteUrl}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full gap-2 border-white/10"
              onClick={() => {
                void copyShareLink(inviteUrl).then((ok) => {
                  setCopied(ok);
                  if (ok && user) {
                    void trackShareAction({
                      action: "link_copied",
                      entityType: "invite",
                      entityId: inviteUrl,
                      userId: user.uid,
                      source: "invite_dialog",
                    });
                  }
                });
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? t.share.linkCopied : t.share.copyLink}
            </Button>
          </>
        )}

        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}
