"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

import { ShareMenu, type ShareMenuInviteOptions } from "@/components/share/ShareMenu";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { ShareEntityInput } from "@/lib/share/share-types";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  entity: ShareEntityInput;
  inviteOptions?: ShareMenuInviteOptions;
  label?: string;
  className?: string;
  compact?: boolean;
};

export function ShareButton({
  entity,
  inviteOptions,
  label,
  className,
  compact = false,
}: ShareButtonProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const buttonLabel =
    label ??
    (entity.type === "garage"
      ? t.share.shareGarage
      : entity.type === "member"
        ? t.share.shareProfile
        : entity.type === "club"
          ? t.share.shareClub
          : entity.type === "event"
            ? t.share.shareEvent
            : t.share.shareShop);

  return (
    <>
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "gap-2 border-white/[0.12] bg-[#0B1118]/80 text-[#CBD5E1] hover:text-[#F8FAFC]",
          compact ? "h-9" : "h-10",
          className
        )}
      >
        <Share2 className="size-4" />
        {buttonLabel}
      </Button>
      <ShareMenu
        open={open}
        onClose={() => setOpen(false)}
        entity={entity}
        inviteOptions={inviteOptions}
      />
    </>
  );
}
