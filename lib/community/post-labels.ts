import type { Dictionary } from "@/lib/i18n";
import type { PostType } from "@/lib/types";

export function postTypeLabel(type: PostType, t: Dictionary): string {
  const labels = t.communityPosts.postTypes;
  return labels[type] ?? type;
}

export function officialBadgeLabel(
  post: { type: PostType; isOfficial: boolean },
  t: Dictionary
): string | null {
  if (!post.isOfficial) return null;
  if (post.type === "route_update") return t.communityPosts.routeUpdate;
  if (post.type === "announcement" || post.type === "event_update") {
    if (post.type === "event_update") return t.communityPosts.organizerUpdate;
    return t.communityPosts.officialClubPost;
  }
  if (post.type === "club_news") return t.communityPosts.officialClubPost;
  return t.communityPosts.organizerUpdate;
}

export function formatPostTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
