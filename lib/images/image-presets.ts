export type ImagePresetId =
  | "member_car"
  | "club_cover"
  | "event_cover"
  | "announcement"
  | "profile_avatar"
  | "club_logo"
  | "garage_primary";

export type ImagePreset = {
  id: ImagePresetId;
  maxDimension: number;
  maxSizeMB: number;
  initialQuality: number;
  preferredFormat: "webp" | "jpeg";
};

export const IMAGE_PRESETS: Record<ImagePresetId, ImagePreset> = {
  member_car: {
    id: "member_car",
    maxDimension: 1200,
    maxSizeMB: 0.22,
    initialQuality: 0.78,
    preferredFormat: "webp",
  },
  club_cover: {
    id: "club_cover",
    maxDimension: 1600,
    maxSizeMB: 0.42,
    initialQuality: 0.78,
    preferredFormat: "webp",
  },
  event_cover: {
    id: "event_cover",
    maxDimension: 1600,
    maxSizeMB: 0.42,
    initialQuality: 0.78,
    preferredFormat: "webp",
  },
  announcement: {
    id: "announcement",
    maxDimension: 1400,
    maxSizeMB: 0.32,
    initialQuality: 0.78,
    preferredFormat: "webp",
  },
  profile_avatar: {
    id: "profile_avatar",
    maxDimension: 800,
    maxSizeMB: 0.16,
    initialQuality: 0.78,
    preferredFormat: "webp",
  },
  club_logo: {
    id: "club_logo",
    maxDimension: 512,
    maxSizeMB: 0.12,
    initialQuality: 0.82,
    preferredFormat: "webp",
  },
  garage_primary: {
    id: "garage_primary",
    maxDimension: 1400,
    maxSizeMB: 0.32,
    initialQuality: 0.78,
    preferredFormat: "webp",
  },
};

export function getImagePreset(id: ImagePresetId): ImagePreset {
  return IMAGE_PRESETS[id];
}
