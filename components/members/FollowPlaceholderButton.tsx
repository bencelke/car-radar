"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FollowPlaceholderButtonProps = {
  className?: string;
  fullWidth?: boolean;
};

export function FollowPlaceholderButton({
  className,
  fullWidth,
}: FollowPlaceholderButtonProps) {
  const { t } = useLocale();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Button
        type="button"
        onClick={() => setMessage(t.members.followingComingSoon)}
        className={cn(
          "gap-2 border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC] hover:bg-[#EF4444]/25",
          fullWidth && "w-full"
        )}
      >
        <UserPlus className="size-4" />
        {t.members.follow}
      </Button>
      {message ? (
        <p className="text-center text-[10px] text-[#94A3B8]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
