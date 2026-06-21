"use client";

import type { User } from "firebase/auth";

import { UserAvatarEditor } from "@/components/profile/UserAvatarEditor";
import { ResponsiveSheet } from "@/components/mobile/ResponsiveSheet";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { UserProfile } from "@/lib/types";

type ProfilePhotoSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  profile: UserProfile | null;
  onUploaded: () => Promise<void>;
};

export function ProfilePhotoSheet({
  open,
  onOpenChange,
  user,
  profile,
  onUploaded,
}: ProfilePhotoSheetProps) {
  const { t } = useLocale();

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      side="bottom"
      title={t.profile.changePhoto}
      closeLabel={t.garage.cancel}
      panelClassName="max-h-[90dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
    >
      <UserAvatarEditor
        uid={user.uid}
        profile={profile}
        authUser={user}
        onUpdated={async () => {
          await onUploaded();
        }}
      />
    </ResponsiveSheet>
  );
}
