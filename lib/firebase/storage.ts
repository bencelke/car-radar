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
  clubId?: string;
  memberId?: string;
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

export type UploadGarageCarImageParams = {
  file: Blob | File;
  ownerUid: string;
  carId: string;
  fileExtension: "webp" | "jpg" | "jpeg" | "png";
  onProgress?: (percent: number) => void;
};

export type UploadCommunityPostImageParams = {
  file: Blob | File;
  contextType: "club" | "event";
  contextId: string;
  postId: string;
  fileExtension: "webp" | "jpg" | "jpeg" | "png";
  onProgress?: (percent: number) => void;
};

export async function uploadBlobToPath(
  storagePath: string,
  file: Blob | File,
  ext: string,
  onProgress?: (percent: number) => void
): Promise<UploadProfileImageResult> {
  if (!storage) throw new Error("FIREBASE_STORAGE_NOT_CONFIGURED");

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
  return {
    downloadUrl,
    storagePath,
    sizeBytes: task.snapshot.totalBytes,
    contentType,
  };
}

export async function uploadCommunityPostImage(
  params: UploadCommunityPostImageParams
): Promise<UploadProfileImageResult> {
  if (!isFirebaseStorageConfigured() || !storage) {
    throw new Error("FIREBASE_STORAGE_NOT_CONFIGURED");
  }

  const { file, contextType, contextId, postId, fileExtension, onProgress } =
    params;
  const ext = fileExtension === "jpeg" ? "jpg" : fileExtension;
  const storagePath =
    contextType === "club"
      ? `community-posts/clubs/${contextId}/${postId}/image.${ext}`
      : `community-posts/events/${contextId}/${postId}/image.${ext}`;

  return uploadBlobToPath(storagePath, file, ext, onProgress);
}

export async function uploadGarageCarImage(
  params: UploadGarageCarImageParams
): Promise<UploadProfileImageResult> {
  if (!isFirebaseStorageConfigured() || !storage) {
    throw new Error("FIREBASE_STORAGE_NOT_CONFIGURED");
  }

  const { file, ownerUid, carId, fileExtension, onProgress } = params;
  const ext = fileExtension === "jpeg" ? "jpg" : fileExtension;
  const storagePath = `garage-images/${ownerUid}/${carId}/primary.${ext}`;

  return uploadBlobToPath(storagePath, file, ext, onProgress);
}

export async function uploadProfileImage(
  params: UploadProfileImageParams
): Promise<UploadProfileImageResult> {
  if (!isFirebaseStorageConfigured() || !storage) {
    throw new Error("FIREBASE_STORAGE_NOT_CONFIGURED");
  }

  const { file, ownerType, ownerId, fileExtension, clubImageKind, clubId, memberId, onProgress } =
    params;
  const ext = fileExtension === "jpeg" ? "jpg" : fileExtension;
  let storagePath: string;
  if (ownerType === "member" && clubId && memberId) {
    storagePath = `member-images/${clubId}/${memberId}/primary.${ext}`;
  } else if (ownerType === "club" && clubImageKind) {
    storagePath = `club-images/${ownerId}/${clubImageKind === "cover" ? "cover" : "logo"}.${ext}`;
  } else {
    storagePath = `profile-images/${ownerType}/${ownerId}/profile.${ext}`;
  }

  return uploadBlobToPath(storagePath, file, ext, onProgress);
}
