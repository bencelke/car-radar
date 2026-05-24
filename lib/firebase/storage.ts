import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from "firebase/storage";

import { storage } from "@/lib/firebase/client";

export type ProfileImageOwnerType = "user" | "member" | "club";

export type ClubStorageImageKind = "cover" | "logo";

export type UploadProfileImageParams = {
  file: Blob | File;
  ownerType: ProfileImageOwnerType;
  ownerId: string;
  fileExtension: "webp" | "jpg" | "jpeg" | "png";
  clubImageKind?: ClubStorageImageKind;
  onProgress?: (percent: number) => void;
};

export type UploadProfileImageResult = {
  downloadUrl: string;
  storagePath: string;
  sizeBytes: number;
  contentType: string;
};

export function isFirebaseStorageConfigured(): boolean {
  return (
    storage !== null &&
    Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim())
  );
}

export async function uploadProfileImage(
  params: UploadProfileImageParams
): Promise<UploadProfileImageResult> {
  if (!isFirebaseStorageConfigured() || !storage) {
    throw new Error("FIREBASE_STORAGE_NOT_CONFIGURED");
  }

  const { file, ownerType, ownerId, fileExtension, clubImageKind, onProgress } =
    params;
  const ext = fileExtension === "jpeg" ? "jpg" : fileExtension;
  const storagePath =
    ownerType === "club" && clubImageKind
      ? `club-images/${ownerId}/${clubImageKind}.${ext}`
      : `profile-images/${ownerType}/${ownerId}/profile.${ext}`;
  const contentType =
    file instanceof File && file.type
      ? file.type
      : ext === "webp"
        ? "image/webp"
        : ext === "png"
          ? "image/png"
          : "image/jpeg";

  const storageRef = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, file, { contentType });

  await new Promise<UploadTaskSnapshot>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const total = snapshot.totalBytes;
        const transferred = snapshot.bytesTransferred;
        const percent = total > 0 ? Math.round((transferred / total) * 100) : 0;
        onProgress?.(percent);
      },
      (error) => reject(error),
      () => resolve(task.snapshot)
    );
  });

  const downloadUrl = await getDownloadURL(storageRef);
  const sizeBytes = task.snapshot.totalBytes;

  return {
    downloadUrl,
    storagePath,
    sizeBytes,
    contentType,
  };
}
