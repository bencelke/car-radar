"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProfileImageUploader } from "@/components/images/ProfileImageUploader";
import type { ProfileImageUploadedPayload } from "@/components/images/ProfileImageUploader";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { isLikelyLocalSeedMemberId } from "@/lib/members/club-member-firestore";
import {
  memberImagePublicPath,
  suggestedMemberImageFileName,
} from "@/lib/members/member-image-path";
import { withImageCacheBust } from "@/lib/members/member-local-image-url";
import { clubMemberExistsInFirestore } from "@/lib/repositories/club-members";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { isFirebaseStorageConfigured } from "@/lib/firebase/storage";
import type { ClubMember } from "@/lib/types";

const isDev = process.env.NODE_ENV === "development";

type EditableMemberImagePanelProps = {
  member: ClubMember;
  onMemberUpdate?: (member: ClubMember) => void;
  /** Nested inside admin tools — lighter chrome */
  embedded?: boolean;
};

export function EditableMemberImagePanel({
  member,
  onMemberUpdate,
  embedded = false,
}: EditableMemberImagePanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const { isAdmin, isDevAdminBypass } = useAuth();
  const [inFirestore, setInFirestore] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    member.avatarUrl ?? member.imageUrl ?? ""
  );

  const clubId = member.clubId?.trim() || "wbn";

  const canFirebaseUpload =
    isAdmin &&
    isFirebaseConfigured &&
    isFirebaseStorageConfigured() &&
    !isDevAdminBypass;

  const showLocalOptimizer = isDev && !canFirebaseUpload;

  useEffect(() => {
    setImageUrl(member.avatarUrl ?? member.imageUrl ?? "");
  }, [member.avatarUrl, member.imageUrl]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setInFirestore(null);
      return;
    }
    void clubMemberExistsInFirestore(member.id).then(setInFirestore);
  }, [member.id]);

  if (!canFirebaseUpload && !showLocalOptimizer) {
    return null;
  }

  const showSeedNote =
    canFirebaseUpload &&
    isLikelyLocalSeedMemberId(member.id) &&
    inFirestore === false;

  const handleUploaded = (result: ProfileImageUploadedPayload) => {
    const url = result.localSave
      ? withImageCacheBust(result.imageUrl)
      : result.imageUrl;

    const updated: ClubMember = {
      ...member,
      avatarUrl: url,
      imageUrl: url,
      ...(result.storagePath
        ? {
            imageStoragePath: result.storagePath,
            imageUpdatedAt: new Date().toISOString(),
            imageSizeBytes: result.sizeBytes,
            imageContentType: result.contentType,
          }
        : {}),
    };
    setImageUrl(url);
    setSuccess(true);
    if (result.storagePath) setInFirestore(true);
    onMemberUpdate?.(updated);
    if (result.localSave) {
      router.refresh();
    }
  };

  const expectedPath = memberImagePublicPath(member);
  const suggestedFile = suggestedMemberImageFileName(member.id);

  const panelClass = embedded
    ? "overflow-hidden rounded-xl border border-white/[0.08] bg-[#151B24]/40"
    : "overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-[#0B1118]/90 shadow-[0_0_32px_-12px_rgba(245,158,11,0.35)]";

  return (
    <div className="space-y-4">
      {showLocalOptimizer ? (
        <section className={panelClass}>
          <ProfileImageUploader
            mode="local-save"
            ownerType="member"
            ownerId={member.id}
            clubId={clubId}
            memberId={member.id}
            currentImageUrl={imageUrl}
            memberPreview={{ ...member, avatarUrl: imageUrl, imageUrl }}
            imageKind="member_car"
            suggestedFileName={suggestedFile}
            expectedPublicPath={expectedPath}
            compactPreview
            onUploaded={handleUploaded}
          />
        </section>
      ) : null}

      {canFirebaseUpload ? (
        <section className={panelClass}>
          <div className="border-b border-amber-500/15 px-4 py-3">
            <p className="font-heading text-sm font-semibold text-amber-100/95">
              {t.profileImages.adminUploadTitle}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              {t.profileImages.memberPhotoHint}
            </p>
          </div>

          {showSeedNote ? (
            <p className="mx-4 mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/80">
              {t.profileImages.localSeedNote}
            </p>
          ) : null}

          <div className="p-1">
            <ProfileImageUploader
              mode="firebase"
              ownerType="member"
              ownerId={member.id}
              currentImageUrl={imageUrl}
              memberPreview={{ ...member, avatarUrl: imageUrl, imageUrl }}
              baseMember={member}
              imageKind="member_car"
              suggestedFileName={suggestedFile}
              compactPreview
              onUploaded={handleUploaded}
            />
          </div>

          {success ? (
            <p className="px-4 pb-4 text-sm text-emerald-400/90" role="status">
              {t.profileImages.memberImageUpdated}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
