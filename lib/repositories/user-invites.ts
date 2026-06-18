import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { generateInviteCode } from "@/lib/share/invite-code";
import { buildInviteUrl } from "@/lib/share/share-url";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  getMockUserInvites,
  setMockUserInvite,
} from "@/lib/mock-data/share-store";
import type { UserInvite, UserInviteType } from "@/lib/types";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

export class InviteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InviteError";
  }
}

export type CreateInviteInput = {
  inviterUid: string;
  inviteType: UserInviteType;
  clubId?: string;
  eventId?: string;
  memberId?: string;
  targetInstagramHandle?: string;
  expiresInDays?: number;
};

function isInviteActive(invite: UserInvite): boolean {
  if (invite.status !== "active") return false;
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
    return false;
  }
  return true;
}

export async function createInvite(input: CreateInviteInput): Promise<UserInvite> {
  const inviteCode = generateInviteCode(10);
  const now = new Date().toISOString();
  const expiresAt =
    input.expiresInDays != null
      ? new Date(Date.now() + input.expiresInDays * 86400000).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString();

  const invite: UserInvite = {
    id: inviteCode,
    inviterUid: input.inviterUid,
    inviteType: input.inviteType,
    clubId: input.clubId,
    eventId: input.eventId,
    memberId: input.memberId,
    targetInstagramHandle: input.targetInstagramHandle,
    inviteCode,
    status: "active",
    createdAt: now,
    expiresAt,
  };

  if (!isFirebaseConfigured || !db) {
    setMockUserInvite(invite);
    return invite;
  }

  await setDoc(
    doc(db, COLLECTIONS.userInvites, inviteCode),
    sanitizeFirestoreData(invite as unknown as Record<string, unknown>)
  );
  return invite;
}

export async function getInviteByCode(code: string): Promise<UserInvite | null> {
  const normalized = code.trim().toUpperCase();
  const mock = getMockUserInvites().find((i) => i.inviteCode === normalized);

  if (!db) {
    if (!mock) return null;
    if (!isInviteActive(mock) && mock.status === "active") {
      return { ...mock, status: "expired" };
    }
    return mock;
  }

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.userInvites, normalized));
    if (!snap.exists()) return mock ?? null;
    const invite = { id: snap.id, ...snap.data() } as UserInvite;
    if (invite.status === "active" && !isInviteActive(invite)) {
      return { ...invite, status: "expired" };
    }
    return invite;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.userInvites, error);
    return mock ?? null;
  }
}

export async function getUserInvites(inviterUid: string): Promise<UserInvite[]> {
  if (!db) {
    return getMockUserInvites().filter((i) => i.inviterUid === inviterUid);
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.userInvites),
      where("inviterUid", "==", inviterUid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserInvite);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.userInvites, error);
    return getMockUserInvites().filter((i) => i.inviterUid === inviterUid);
  }
}

export async function markInviteUsed(code: string, uid: string): Promise<UserInvite | null> {
  const invite = await getInviteByCode(code);
  if (!invite || invite.status !== "active") return invite;

  const updated: UserInvite = {
    ...invite,
    status: "used",
    usedAt: new Date().toISOString(),
    usedByUid: uid,
  };

  if (!isFirebaseConfigured || !db) {
    setMockUserInvite(updated);
    return updated;
  }

  await updateDoc(doc(db, COLLECTIONS.userInvites, invite.inviteCode), {
    status: "used",
    usedAt: updated.usedAt,
    usedByUid: uid,
  });
  return updated;
}

export async function cancelInvite(
  inviteId: string,
  inviterUid: string
): Promise<void> {
  const mock = getMockUserInvites().find((i) => i.id === inviteId);
  if (mock && mock.inviterUid !== inviterUid) {
    throw new InviteError("Not allowed.");
  }

  if (!isFirebaseConfigured || !db) {
    if (mock) setMockUserInvite({ ...mock, status: "cancelled" });
    return;
  }

  const ref = doc(db, COLLECTIONS.userInvites, inviteId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new InviteError("Invite not found.");
  const data = snap.data() as UserInvite;
  if (data.inviterUid !== inviterUid) throw new InviteError("Not allowed.");
  await updateDoc(ref, { status: "cancelled" });
}

export function invitePublicUrl(invite: UserInvite): string {
  return buildInviteUrl(invite.inviteCode);
}
