"use client";

import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";

import { authUi } from "@/components/auth/auth-ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import { resolveGuestDestination } from "@/lib/auth/guest-routes";
import { cn } from "@/lib/utils";

type GuestBrowseButtonProps = {
  nextUrl?: string;
  disabled?: boolean;
  className?: string;
};

export function GuestBrowseButton({
  nextUrl,
  disabled = false,
  className,
}: GuestBrowseButtonProps) {
  const { t } = useLocale();
  const router = useRouter();

  function handleGuest() {
    const destination = resolveGuestDestination(nextUrl);
    router.replace(destination);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleGuest}
        className={authUi.button.guest}
      >
        <Compass className="size-[1.125rem] shrink-0 text-[#64748B]" aria-hidden />
        <span>{t.auth.continueAsGuest}</span>
      </button>
      <p className={cn("mx-auto max-w-[18rem] text-center sm:max-w-[20rem]", authUi.type.helper)}>
        {t.auth.guestBrowseLaterHint}
      </p>
    </div>
  );
}
