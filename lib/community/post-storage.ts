export function communityPostImagePath(
  contextType: "club" | "event",
  contextId: string,
  postId: string,
  ext: "webp" | "jpg" | "jpeg" | "png" = "webp"
): string {
  const normalized = ext === "jpeg" ? "jpg" : ext;
  if (contextType === "club") {
    return `community-posts/clubs/${contextId}/${postId}/image.${normalized}`;
  }
  return `community-posts/events/${contextId}/${postId}/image.${normalized}`;
}

export function postReactionDocId(postId: string, userId: string): string {
  return `${postId}_${userId}`;
}
