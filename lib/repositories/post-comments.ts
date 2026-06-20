import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  startAfter,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  getMockPostComments,
  setMockPostComment,
} from "@/lib/mock-data/community-store";
import type { CommunityPost, PostComment } from "@/lib/types";
import { RepositoryMutationError } from "@/lib/repositories/club-follows";
import { getPostById } from "@/lib/repositories/posts";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";
import type { PostActor } from "@/lib/repositories/posts";

export type CreateCommentInput = {
  postId: string;
  contextType: "club" | "event";
  contextId: string;
  body: string;
  parentCommentId?: string | null;
};

const DEFAULT_COMMENT_PAGE = 10;

export type CommentsQueryOptions = {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot | null;
};

export async function getCommentsByPostId(
  postId: string,
  options?: CommentsQueryOptions
): Promise<{ comments: PostComment[]; cursor: QueryDocumentSnapshot | null }> {
  const pageSize = options?.pageSize ?? DEFAULT_COMMENT_PAGE;
  const fromMock = getMockPostComments()
    .filter((c) => c.postId === postId && c.status === "published")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  if (!db) {
    return { comments: fromMock.slice(0, pageSize), cursor: null };
  }

  try {
    let q = query(
      collection(db, COLLECTIONS.postComments),
      where("postId", "==", postId),
      where("status", "==", "published"),
      orderBy("createdAt", "asc"),
      limit(pageSize)
    );
    if (options?.cursor) {
      q = query(q, startAfter(options.cursor));
    }
    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as PostComment
    );
    const merged = items.length > 0 ? items : fromMock;
    const last = snap.docs[snap.docs.length - 1] ?? null;
    return { comments: merged.slice(0, pageSize), cursor: last };
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.postComments, error);
    return { comments: fromMock.slice(0, pageSize), cursor: null };
  }
}

export async function createComment(
  input: CreateCommentInput,
  actor: PostActor
): Promise<PostComment> {
  const body = input.body.trim();
  if (!body || body.length > 1500) {
    throw new RepositoryMutationError("Comment must be 1–1500 characters.");
  }

  const post = await getPostById(input.postId);
  if (!post || post.status !== "published") {
    throw new RepositoryMutationError("Post not found.");
  }

  const now = new Date().toISOString();
  const id = generateId("cmt");
  const comment: PostComment = {
    id,
    postId: input.postId,
    contextType: input.contextType,
    contextId: input.contextId,
    authorUid: actor.uid,
    authorDisplayName: actor.displayName.trim(),
    authorAvatarUrl: actor.avatarUrl,
    body,
    parentCommentId: input.parentCommentId ?? null,
    status: "published",
    reactionCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockPostComment(comment);
    const updatedPost: CommunityPost = {
      ...post,
      commentCount: post.commentCount + 1,
    };
    const { setMockPost } = await import("@/lib/mock-data/community-store");
    setMockPost(updatedPost);
    if (post.authorUid !== actor.uid) {
      const { triggerPostComment } = await import("@/lib/notifications/triggers");
      triggerPostComment(comment, post, actor.uid);
    }
    return comment;
  }

  const firestore = db;
  await runTransaction(firestore, async (tx) => {
    const postRef = doc(firestore, COLLECTIONS.posts, input.postId);
    const postSnap = await tx.get(postRef);
    if (!postSnap.exists()) throw new RepositoryMutationError("Post not found.");
    const current = postSnap.data() as CommunityPost;
    if (current.status !== "published") {
      throw new RepositoryMutationError("Post not found.");
    }

    tx.set(
      doc(firestore, COLLECTIONS.postComments, id),
      sanitizeFirestoreData(comment as unknown as Record<string, unknown>)
    );
    tx.set(
      postRef,
      sanitizeFirestoreData({
        commentCount: Math.max(0, (current.commentCount ?? 0) + 1),
        updatedAt: now,
      }),
      { merge: true }
    );
  });

  if (post.authorUid !== actor.uid) {
    const { triggerPostComment } = await import("@/lib/notifications/triggers");
    triggerPostComment(comment, post, actor.uid);
  }

  return comment;
}

export async function updateOwnComment(
  commentId: string,
  body: string,
  actor: PostActor
): Promise<PostComment> {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 1500) {
    throw new RepositoryMutationError("Comment must be 1–1500 characters.");
  }

  const existing = await getCommentById(commentId);
  if (!existing) throw new RepositoryMutationError("Comment not found.");
  if (existing.authorUid !== actor.uid) {
    throw new RepositoryMutationError("Not authorized.");
  }

  const now = new Date().toISOString();
  const updated: PostComment = {
    ...existing,
    body: trimmed,
    editedAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockPostComment(updated);
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.postComments, commentId),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );
  return updated;
}

export async function deleteOwnComment(
  commentId: string,
  actor: PostActor
): Promise<PostComment> {
  return moderateComment(commentId, "remove", actor, { reason: "author_deleted" });
}

export type ModerateCommentAction = "hide" | "remove" | "restore";

export async function moderateComment(
  commentId: string,
  action: ModerateCommentAction,
  actor: PostActor,
  options?: { reason?: string; isModerator?: boolean }
): Promise<PostComment> {
  const existing = await getCommentById(commentId);
  if (!existing) throw new RepositoryMutationError("Comment not found.");

  const isAuthor = existing.authorUid === actor.uid;
  if (!isAuthor && !options?.isModerator && !actor.isGlobalAdmin) {
    throw new RepositoryMutationError("Not authorized.");
  }

  const now = new Date().toISOString();
  const wasPublished = existing.status === "published";
  const status =
    action === "restore" ? "published" : action === "hide" ? "hidden" : "removed";

  const updated: PostComment = {
    ...existing,
    status,
    removedAt: action !== "restore" ? now : undefined,
    removedByUid: action !== "restore" ? actor.uid : undefined,
    removalReason: options?.reason,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockPostComment(updated);
    if (wasPublished && status === "removed") {
      await decrementPostCommentCount(existing.postId);
    }
    return updated;
  }

  const firestore = db;
  await runTransaction(firestore, async (tx) => {
    const commentRef = doc(firestore, COLLECTIONS.postComments, commentId);
    tx.set(
      commentRef,
      sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
      { merge: true }
    );

    if (wasPublished && status === "removed") {
      const postRef = doc(firestore, COLLECTIONS.posts, existing.postId);
      const postSnap = await tx.get(postRef);
      if (postSnap.exists()) {
        const count = (postSnap.data() as CommunityPost).commentCount ?? 0;
        tx.set(
          postRef,
          sanitizeFirestoreData({
            commentCount: Math.max(0, count - 1),
            updatedAt: now,
          }),
          { merge: true }
        );
      }
    }
  });

  return updated;
}

async function decrementPostCommentCount(postId: string): Promise<void> {
  const post = await getPostById(postId);
  if (!post) return;
  const { setMockPost } = await import("@/lib/mock-data/community-store");
  setMockPost({
    ...post,
    commentCount: Math.max(0, post.commentCount - 1),
  });
}

export async function getPostCommentById(
  commentId: string
): Promise<PostComment | null> {
  return getCommentById(commentId);
}

async function getCommentById(commentId: string): Promise<PostComment | null> {
  const fromMock = getMockPostComments().find((c) => c.id === commentId);
  if (!db) return fromMock ?? null;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.postComments, commentId));
    if (!snap.exists()) return fromMock ?? null;
    return { id: snap.id, ...snap.data() } as PostComment;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.postComments, error);
    return fromMock ?? null;
  }
}
