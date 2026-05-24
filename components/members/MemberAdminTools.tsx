"use client";

import { Wrench } from "lucide-react";

import { EditableMemberImagePanel } from "@/components/members/EditableMemberImagePanel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { isFirebaseStorageConfigured } from "@/lib/firebase/storage";
import type { ClubMember } from "@/lib/types";

const isDev = process.env.NODE_ENV === "development";

type MemberAdminToolsProps = {
  member: ClubMember;
  onMemberUpdate?: (member: ClubMember) => void;
};

export function MemberAdminTools({ member, onMemberUpdate }: MemberAdminToolsProps) {
  const { t } = useLocale();
  const { isAdmin, isDevAdminBypass } = useAuth();

  const canFirebaseUpload =
    isAdmin &&
    isFirebaseConfigured &&
    isFirebaseStorageConfigured() &&
    !isDevAdminBypass;

  const showLocalOptimizer = isDev && !canFirebaseUpload;
  const visible = showLocalOptimizer || canFirebaseUpload;

  if (!visible) return null;

  return (
    <details className="group rounded-xl border border-amber-500/20 bg-[#0B1118]/50 backdrop-blur-xl">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <Wrench className="size-3.5 text-amber-400/70" aria-hidden />
          <span className="font-heading text-xs font-semibold text-[#E2E8F0]">
            {t.members.profileTools}
          </span>
          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-amber-200/90">
            Dev
          </span>
        </span>
        <span className="text-[10px] text-[#64748B] group-open:hidden">
          {t.members.tapToExpand}
        </span>
      </summary>
      <div className="border-t border-amber-500/10 px-3 pb-3 pt-2">
        <EditableMemberImagePanel
          member={member}
          onMemberUpdate={onMemberUpdate}
          embedded
        />
      </div>
    </details>
  );
}
