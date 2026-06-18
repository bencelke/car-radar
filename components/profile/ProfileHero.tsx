"use client";

import Link from "next/link";
import { Camera, ExternalLink, Pencil } from "lucide-react";
import { useState } from "react";

import { ProfilePhotoSheet } from "@/components/profile/ProfilePhotoSheet";
import {
  premiumPanelClass,
  statusBadgeClass,
} from "@/components/profile/profile-ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { ClubMember, GarageProfile, UserProfile } from "@/lib/types";
import type { User } from "firebase/auth";
import { formatInstagramHandle } from "@/lib/utils/instagram";
import { cn } from "@/lib/utils";

type ProfileHeroProps = {
  user: User;
  profile: UserProfile | null;
  garage: GarageProfile | null;
  claimedMember: ClubMember | null;
  onPhotoUpdated: () => Promise<void>;
  onEditProfile?: () => void;
  publicProfileHref?: string | null;
};

function formatJoinedDate(value?: string, locale = "en"): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ProfileHero({
  user,
  profile,
  garage,
  claimedMember,
  onPhotoUpdated,
  onEditProfile,
  publicProfileHref,
}: ProfileHeroProps) {
  const { t, locale } = useLocale();
  const [photoOpen, setPhotoOpen] = useState(false);

  const avatarUrl =
    profile?.avatarUrl ?? profile?.imageUrl ?? user.photoURL ?? undefined;
  const displayName =
    profile?.displayName ??
    garage?.displayName ??
    user.displayName ??
    t.profile.account;
  const instagram =
    profile?.instagramHandle ?? garage?.instagramHandle ?? garage?.instagram;
  const clubName = garage?.clubName ?? claimedMember?.clubName;
  const joined = formatJoinedDate(profile?.createdAt, locale);
  const displayEmail = user.email?.includes("@privaterelay.appleid.com")
    ? t.auth.applePrivateEmailNote
    : user.email;

  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <section
        className={cn(
          premiumPanelClass,
          "relative overflow-hidden p-5 sm:p-6",
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#EF4444]/40 before:to-transparent"
        )}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#3B82F6]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-[#A855F7]/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="size-[4.5rem] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#151B24] shadow-[0_0_24px_-8px_rgba(59,130,246,0.45)] sm:size-28">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#3B82F6]/30 to-[#A855F7]/25 font-heading text-xl font-bold text-[#F8FAFC]">
                    {initials || "?"}
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label={t.profile.changePhoto}
                onClick={() => setPhotoOpen(true)}
                className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border border-white/[0.12] bg-[#0B1118] text-[#CBD5E1] shadow-lg transition hover:border-[#3B82F6]/40 hover:text-[#F8FAFC]"
              >
                <Camera className="size-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-xl font-bold tracking-tight text-[#F8FAFC] sm:text-2xl">
                  {displayName}
                </h1>
                <span
                  className={cn(
                    statusBadgeClass,
                    "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#93C5FD]"
                  )}
                >
                  {clubName ? clubName : t.profile.member}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-[#94A3B8]">
                {displayEmail}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
                {joined ? (
                  <span>
                    {t.profile.joined} {joined}
                  </span>
                ) : null}
                {instagram ? (
                  <a
                    href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#94A3B8] hover:text-[#CBD5E1]"
                  >
                    {formatInstagramHandle(instagram)}
                    <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[#151B24]/80 px-4 text-sm font-medium text-[#CBD5E1] transition hover:border-[#3B82F6]/35 hover:text-[#F8FAFC]"
            >
              <Pencil className="size-4" />
              {t.profile.editProfile}
            </button>
            {publicProfileHref ? (
              <Link
                href={publicProfileHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#3B82F6]/35 bg-[#3B82F6]/15 px-4 text-sm font-medium text-[#F8FAFC] transition hover:bg-[#3B82F6]/25"
              >
                <ExternalLink className="size-4" />
                {t.profile.viewPublicProfile}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <ProfilePhotoSheet
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        ownerId={user.uid}
        currentImageUrl={avatarUrl}
        onUploaded={onPhotoUpdated}
      />
    </>
  );
}
