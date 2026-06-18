"use client";

import { ProfileImageUploader } from "@/components/images/ProfileImageUploader";
import { ResponsiveSheet } from "@/components/mobile/ResponsiveSheet";
import { useLocale } from "@/components/providers/LocaleProvider";

type ProfilePhotoSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  currentImageUrl?: string;
  onUploaded: () => Promise<void>;
};

export function ProfilePhotoSheet({
  open,
  onOpenChange,
  ownerId,
  currentImageUrl,
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
      panelClassName="max-h-[90dvh] overflow-y-auto"
    >
      <div className="[&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&_h3]:sr-only [&_p]:first-of-type:sr-only">
        <ProfileImageUploader
          ownerType="user"
          ownerId={ownerId}
          currentImageUrl={currentImageUrl}
          compactPreview
          onUploaded={async () => {
            await onUploaded();
            onOpenChange(false);
          }}
        />
      </div>
    </ResponsiveSheet>
  );
}
