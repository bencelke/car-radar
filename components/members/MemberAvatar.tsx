import type { ClubMember } from "@/lib/types";
import { memberAvatarGradient } from "@/lib/members/roles";
import { cn } from "@/lib/utils";

type MemberAvatarProps = {
  member: ClubMember;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-10 text-sm",
  md: "size-14 text-base",
  lg: "size-24 text-2xl sm:size-28",
};

export function MemberAvatar({
  member,
  size = "md",
  className,
}: MemberAvatarProps) {
  const src = member.avatarUrl ?? member.imageUrl;
  const initial = (member.displayName?.[0] ?? "?").toUpperCase();
  const gradient = memberAvatarGradient(member);
  const boxClass = cn(
    "relative shrink-0 overflow-hidden rounded-xl border border-white/10",
    sizeClasses[size],
    className
  );

  if (src) {
    return (
      <div className={boxClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        boxClass,
        "flex items-center justify-center bg-gradient-to-br font-heading font-bold text-white/90",
        gradient
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}

