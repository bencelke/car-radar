"use client";

import Link from "next/link";

import { MemberCard } from "@/components/cards/MemberCard";
import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { Club, ClubMember } from "@/lib/types";

type ClubMembersSectionProps = {
  club: Club;
  members: ClubMember[];
};

export function ClubMembersSection({ club, members }: ClubMembersSectionProps) {
  const { t } = useLocale();

  return (
    <GlassPanel className="p-0">
      <PanelHeader
        title={t.clubs.memberCars}
        action={
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/submit?type=member&club=${encodeURIComponent(club.name)}`}
              />
            }
            size="sm"
            className="h-7 border border-[#EF4444]/40 bg-[#EF4444]/15 text-[10px] text-[#F8FAFC]"
          >
            {t.clubs.submitMember}
          </Button>
        }
      />
      <div className="p-4 pt-0">
        {members.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} club={club} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[#64748B]">
            {t.clubs.noMembers}
          </p>
        )}
      </div>
    </GlassPanel>
  );
}
