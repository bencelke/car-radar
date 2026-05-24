"use client";

import { Check } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club, ClubMember } from "@/lib/types";
import { memberInstagramUrl } from "@/lib/utils/instagram";
import { cn } from "@/lib/utils";

type MemberProfileCompletenessProps = {
  member: ClubMember;
  club?: Club | null;
  className?: string;
};

function Pill({
  label,
  done,
}: {
  label: string;
  done: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium",
        done
          ? "border-[#22C55E]/30 bg-[#22C55E]/10 text-[#86EFAC]"
          : "border-white/10 bg-white/[0.03] text-[#64748B]"
      )}
    >
      {done ? <Check className="size-2.5 shrink-0" aria-hidden /> : null}
      {label}
    </span>
  );
}

export function MemberProfileCompleteness({
  member,
  club,
  className,
}: MemberProfileCompletenessProps) {
  const { t } = useLocale();
  const hasPhoto = Boolean(member.imageUrl ?? member.avatarUrl);
  const hasInstagram = Boolean(memberInstagramUrl(member));
  const hasClub = Boolean(club ?? member.clubId ?? member.clubName);

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <Pill label={t.members.basicProfile} done />
      <Pill label={t.members.photoAdded} done={hasPhoto} />
      <Pill label={t.members.instagramLinked} done={hasInstagram} />
      <Pill label={t.members.clubLinked} done={hasClub} />
    </div>
  );
}
