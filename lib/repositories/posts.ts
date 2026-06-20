import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  canCreateEventPost,
  canModeratePost,
  canPinPost,
  canPostOfficial,
  MAX_PINNED_POSTS_PER_CONTEXT,
  OFFICIAL_POST_TYPES,
} from "@/lib/community/post-permissions";
import { resolveClubPostAccess } from "@/lib/community/can-post-to-club";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  getMockPosts,
  setMockPost,
} from "@/lib/mock-data/community-store";
import type {
  CarEvent,
  Club,
  ClubMember,
  CommunityPost,
  PostContextType,
  PostStatus,
  PostType,
} from "@/lib/types";
import { getApprovedClubMembershipForUser } from "@/lib/repositories/club-members";
import { RepositoryMutationError } from "@/lib/repositories/club-follows";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

export type PostActor = {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  instagramHandle?: string;
  roleSnapshot?: string;
  isGlobalAdmin?: boolean;
};

export type CreatePostInput = {
  contextType: "club" | "event";
  contextId: string;
  clubId?: string;
  eventId?: string;
  type: PostType;
  title?: string;
  body: string;
  imageUrl?: string;
  imageStoragePath?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageSizeBytes?: number;
  imageContentType?: string;
  isOfficial?: boolean;
};

export type PostsQueryOptions = {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot | null;
  officialOnly?: boolean;
};

const DEFAULT_PAGE_SIZE = 15;

function sortPosts(items: CommunityPost[]): CommunityPost[] {
  return [...items].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function filterPublished(items: CommunityPost[]): CommunityPost[] {
  return items.filter((p) => p.status === "published");
}

export async function getPostsByContext(
  contextType: PostContextType,
  contextId: string,
  options?: PostsQueryOptions
): Promise<{ posts: CommunityPost[]; cursor: QueryDocumentSnapshot | null }> {
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const fromMock = filterPublished(
    getMockPosts().filter(
      (p) =>
        p.contextType === contextType &&
        p.contextId === contextId &&
        (!options?.officialOnly || p.isOfficial)
    )
  );

  if (!db) {
    const sorted = sortPosts(fromMock);
    return { posts: sorted.slice(0, pageSize), cursor: null };
  }

  try {
    let q = query(
      collection(db, COLLECTIONS.posts),
      where("contextType", "==", contextType),
      where("contextId", "==", contextId),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (options?.officialOnly) {
      q = query(
        collection(db, COLLECTIONS.posts),
        where("contextType", "==", contextType),
        where("contextId", "==", contextId),
        where("status", "==", "published"),
        where("isOfficial", "==", true),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    }

    if (options?.cursor) {
      q = query(q, startAfter(options.cursor));
    }

    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as CommunityPost
    );
    const merged = items.length > 0 ? items : fromMock;
    const sorted = sortPosts(merged);
    const last = snap.docs[snap.docs.length - 1] ?? null;
    return {
      posts: sorted.slice(0, pageSize),
      cursor: last,
    };
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.posts, error);
    const sorted = sortPosts(fromMock);
    return { posts: sorted.slice(0, pageSize), cursor: null };
  }
}

export async function getPinnedPostsByContext(
  contextType: PostContextType,
  contextId: string
): Promise<CommunityPost[]> {
  const fromMock = filterPublished(
    getMockPosts().filter(
      (p) =>
        p.contextType === contextType &&
        p.contextId === contextId &&
        p.isPinned
    )
  );

  if (!db) return sortPosts(fromMock);

  try {
    const q = query(
      collection(db, COLLECTIONS.posts),
      where("contextType", "==", contextType),
      where("contextId", "==", contextId),
      where("status", "==", "published"),
      where("isPinned", "==", true),
      orderBy("createdAt", "desc"),
      limit(MAX_PINNED_POSTS_PER_CONTEXT)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as CommunityPost
    );
    return items.length > 0 ? sortPosts(items) : sortPosts(fromMock);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.posts, error);
    return sortPosts(fromMock);
  }
}

export async function getPostById(postId: string): Promise<CommunityPost | null> {
  const fromMock = getMockPosts().find((p) => p.id === postId);
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.posts, postId));
    if (!snap.exists()) return fromMock ?? null;
    return { id: snap.id, ...snap.data() } as CommunityPost;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.posts, error);
    return fromMock ?? null;
  }
}

async function assertCanCreate(
  input: CreatePostInput,
  actor: PostActor,
  club?: Club | null,
  event?: CarEvent | null,
  membership?: ClubMember | null
): Promise<void> {
  const body = input.body.trim();
  if (!body || body.length > 3000) {
    throw new RepositoryMutationError("Post body must be 1–3000 characters.");
  }
  if (input.title && input.title.trim().length > 120) {
    throw new RepositoryMutationError("Title must be 120 characters or less.");
  }

  const wantsOfficial = Boolean(input.isOfficial) || OFFICIAL_POST_TYPES.includes(input.type);
  const canOfficial = canPostOfficial(
    input.contextType,
    club,
    event,
    actor.uid,
    Boolean(actor.isGlobalAdmin)
  );

  if (wantsOfficial && !canOfficial) {
    throw new RepositoryMutationError("Not authorized for official posts.");
  }

  if (input.contextType === "club") {
    if (!club) throw new RepositoryMutationError("Club not found.");
    const access = resolveClubPostAccess({
      club,
      uid: actor.uid,
      isGlobalAdmin: Boolean(actor.isGlobalAdmin),
      membership:
        membership ?? (await getApprovedClubMembershipForUser(club.id, actor.uid)),
    });
    if (!access.allowed) {
      const message =
        access.reason === "club_inactive"
          ? "This club is not accepting posts."
          : access.reason === "firebase_unavailable"
            ? "Posting is temporarily unavailable."
            : "Club membership required to post.";
      throw new RepositoryMutationError(message);
    }
  }

  if (input.contextType === "event") {
    if (!event) throw new RepositoryMutationError("Event not found.");
    if (!canCreateEventPost(event, actor.uid)) {
      throw new RepositoryMutationError("Sign in to post about this event.");
    }
  }
}

export async function createPost(
  input: CreatePostInput,
  actor: PostActor,
  context?: { club?: Club | null; event?: CarEvent | null; membership?: ClubMember | null }
): Promise<CommunityPost> {
  await assertCanCreate(input, actor, context?.club, context?.event, context?.membership);

  const now = new Date().toISOString();
  const id = generateId("post");
  const isOfficial =
    Boolean(input.isOfficial) || OFFICIAL_POST_TYPES.includes(input.type);

  const post: CommunityPost = {
    id,
    contextType: input.contextType,
    contextId: input.contextId,
    clubId: input.clubId,
    eventId: input.eventId,
    authorUid: actor.uid,
    authorDisplayName: actor.displayName.trim(),
    authorAvatarUrl: actor.avatarUrl,
    authorInstagramHandle: actor.instagramHandle,
    authorRoleSnapshot: actor.roleSnapshot,
    type: input.type,
    title: input.title?.trim() || undefined,
    body: input.body.trim(),
    imageUrl: input.imageUrl,
    imageStoragePath: input.imageStoragePath,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    imageSizeBytes: input.imageSizeBytes,
    imageContentType: input.imageContentType,
    isOfficial,
    isPinned: false,
    status: "published",
    commentCount: 0,
    reactionCount: 0,
    reportCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockPost(post);
    if (isOfficial) {
      void import("@/lib/notifications/triggers").then(({ triggerCommunityPostOfficial }) =>
        triggerCommunityPostOfficial(post, actor.uid)
      );
    }
    return post;
  }

  await setDoc(
    doc(db, COLLECTIONS.posts, id),
    sanitizeFirestoreData(post as unknown as Record<string, unknown>)
  );

  if (isOfficial) {
    const { triggerCommunityPostOfficial } = await import(
      "@/lib/notifications/triggers"
    );
    triggerCommunityPostOfficial(post, actor.uid);
  }

  return post;
}

export async function updatePost(
  postId: string,
  patch: Partial<
    Pick<
      CommunityPost,
      | "title"
      | "body"
      | "type"
      | "imageUrl"
      | "imageStoragePath"
      | "imageWidth"
      | "imageHeight"
      | "imageSizeBytes"
      | "imageContentType"
      | "editedAt"
    >
  >,
  actor: PostActor
): Promise<CommunityPost> {
  const existing = await getPostById(postId);
  if (!existing) throw new RepositoryMutationError("Post not found.");
  if (existing.authorUid !== actor.uid && !actor.isGlobalAdmin) {
    throw new RepositoryMutationError("Not authorized to edit this post.");
  }
  if (existing.status !== "published") {
    throw new RepositoryMutationError("Post cannot be edited.");
  }

  const now = new Date().toISOString();
  const updated: CommunityPost = {
    ...existing,
    ...patch,
    body: patch.body?.trim() ?? existing.body,
    title: patch.title !== undefined ? patch.title?.trim() : existing.title,
    editedAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockPost(updated);
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.posts, postId),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );
  return updated;
}

export async function deleteOwnPost(
  postId: string,
  actor: PostActor
): Promise<CommunityPost> {
  return moderatePost(postId, "remove", actor, { reason: "author_deleted" });
}

export type ModeratePostAction = "hide" | "remove" | "restore";

export async function moderatePost(
  postId: string,
  action: ModeratePostAction,
  actor: PostActor,
  options?: { reason?: string; club?: Club | null; event?: CarEvent | null }
): Promise<CommunityPost> {
  const existing = await getPostById(postId);
  if (!existing) throw new RepositoryMutationError("Post not found.");

  const isAuthor = existing.authorUid === actor.uid;
  const isModerator = canModeratePost(
    existing.contextType,
    options?.club ?? null,
    options?.event ?? null,
    actor.uid,
    Boolean(actor.isGlobalAdmin)
  );

  if (!isAuthor && !isModerator && !actor.isGlobalAdmin) {
    throw new RepositoryMutationError("Not authorized to moderate this post.");
  }

  const now = new Date().toISOString();
  const status: PostStatus =
    action === "restore" ? "published" : action === "hide" ? "hidden" : "removed";

  const updated: CommunityPost = {
    ...existing,
    status,
    isPinned: action === "remove" || action === "hide" ? false : existing.isPinned,
    removedAt: action === "remove" || action === "hide" ? now : undefined,
    removedByUid: action === "remove" || action === "hide" ? actor.uid : undefined,
    removalReason: options?.reason,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockPost(updated);
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.posts, postId),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );
  return updated;
}

export async function setPostPinned(
  postId: string,
  pinned: boolean,
  actor: PostActor,
  context?: { club?: Club | null; event?: CarEvent | null }
): Promise<CommunityPost> {
  const existing = await getPostById(postId);
  if (!existing) throw new RepositoryMutationError("Post not found.");

  if (
    !canPinPost(
      existing.contextType,
      context?.club ?? null,
      context?.event ?? null,
      actor.uid,
      Boolean(actor.isGlobalAdmin)
    )
  ) {
    throw new RepositoryMutationError("Not authorized to pin posts.");
  }

  if (pinned) {
    const pinnedPosts = await getPinnedPostsByContext(
      existing.contextType,
      existing.contextId
    );
    if (
      pinnedPosts.length >= MAX_PINNED_POSTS_PER_CONTEXT &&
      !pinnedPosts.some((p) => p.id === postId)
    ) {
      throw new RepositoryMutationError(
        `Maximum ${MAX_PINNED_POSTS_PER_CONTEXT} pinned posts per context.`
      );
    }
  }

  const updated: CommunityPost = {
    ...existing,
    isPinned: pinned,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    setMockPost(updated);
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.posts, postId),
    sanitizeFirestoreData({ isPinned: pinned, updatedAt: updated.updatedAt }),
    { merge: true }
  );
  return updated;
}

export async function getRecentClubPosts(
  clubIds: string[],
  limitCount = 10
): Promise<CommunityPost[]> {
  if (clubIds.length === 0) return [];
  const results: CommunityPost[] = [];

  for (const clubId of clubIds.slice(0, 5)) {
    const { posts } = await getPostsByContext("club", clubId, {
      pageSize: limitCount,
    });
    results.push(...posts);
  }

  return sortPosts(results).slice(0, limitCount);
}

export async function getRecentEventPosts(
  eventIds: string[],
  limitCount = 10
): Promise<CommunityPost[]> {
  if (eventIds.length === 0) return [];
  const results: CommunityPost[] = [];

  for (const eventId of eventIds.slice(0, 5)) {
    const { posts } = await getPostsByContext("event", eventId, {
      pageSize: limitCount,
    });
    results.push(...posts);
  }

  return sortPosts(results).slice(0, limitCount);
}
