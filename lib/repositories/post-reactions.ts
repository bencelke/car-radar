import {
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";

import { postReactionDocId } from "@/lib/community/post-storage";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  deleteMockPostReaction,
  getMockPostReactions,
  setMockPostReaction,
} from "@/lib/mock-data/community-store";
import type { CommunityPost, PostReaction } from "@/lib/types";
import { getPostById } from "@/lib/repositories/posts";
import { logRepositoryFallback } from "@/lib/repositories/utils";

export async function hasUserLikedPost(
  postId: string,
  userId: string
): Promise<boolean> {
  const id = postReactionDocId(postId, userId);
  if (!db) {
    return getMockPostReactions().some((r) => r.id === id);
  }
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.postReactions, id));
    return snap.exists();
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.postReactions, error);
    return getMockPostReactions().some((r) => r.id === id);
  }
}

export async function getPostReactionCount(postId: string): Promise<number> {
  const post = await getPostById(postId);
  return post?.reactionCount ?? 0;
}

export async function togglePostLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; reactionCount: number }> {
  const post = await getPostById(postId);
  if (!post || post.status !== "published") {
    return { liked: false, reactionCount: 0 };
  }

  const reactionId = postReactionDocId(postId, userId);
  const now = new Date().toISOString();
  const existing = await hasUserLikedPost(postId, userId);

  if (!isFirebaseConfigured || !db) {
    if (existing) {
      deleteMockPostReaction(reactionId);
      const count = Math.max(0, post.reactionCount - 1);
      const { setMockPost } = await import("@/lib/mock-data/community-store");
      setMockPost({ ...post, reactionCount: count });
      return { liked: false, reactionCount: count };
    }
    const reaction: PostReaction = {
      id: reactionId,
      postId,
      userId,
      type: "like",
      createdAt: now,
    };
    setMockPostReaction(reaction);
    const count = post.reactionCount + 1;
    const { setMockPost } = await import("@/lib/mock-data/community-store");
    setMockPost({ ...post, reactionCount: count });
    return { liked: true, reactionCount: count };
  }

  const firestore = db;

  if (existing) {
    let count = post.reactionCount;
    await runTransaction(firestore, async (tx) => {
      const postRef = doc(firestore, COLLECTIONS.posts, postId);
      const postSnap = await tx.get(postRef);
      if (!postSnap.exists()) return;
      const current = postSnap.data() as CommunityPost;
      if (current.status !== "published") return;

      tx.delete(doc(firestore, COLLECTIONS.postReactions, reactionId));
      count = Math.max(0, (current.reactionCount ?? 0) - 1);
      tx.set(
        postRef,
        sanitizeFirestoreData({ reactionCount: count, updatedAt: now }),
        { merge: true }
      );
    });
    return { liked: false, reactionCount: count };
  }

  let count = post.reactionCount + 1;
  await runTransaction(firestore, async (tx) => {
    const postRef = doc(firestore, COLLECTIONS.posts, postId);
    const reactionRef = doc(firestore, COLLECTIONS.postReactions, reactionId);
    const postSnap = await tx.get(postRef);
    const reactionSnap = await tx.get(reactionRef);

    if (!postSnap.exists()) return;
    const current = postSnap.data() as CommunityPost;
    if (current.status !== "published") return;
    if (reactionSnap.exists()) return;

    const reaction: PostReaction = {
      id: reactionId,
      postId,
      userId,
      type: "like",
      createdAt: now,
    };
    tx.set(
      reactionRef,
      sanitizeFirestoreData(reaction as unknown as Record<string, unknown>)
    );
    count = (current.reactionCount ?? 0) + 1;
    tx.set(
      postRef,
      sanitizeFirestoreData({ reactionCount: count, updatedAt: now }),
      { merge: true }
    );
  });

  return { liked: true, reactionCount: count };
}
