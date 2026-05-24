/**
 * WBN club seed — loaded from public JSON (source of truth for local dev).
 * Place optimized member photos at public/data/clubs/wbn/images/{member-id}.webp
 * (see README — do not store image binaries in Firestore or this JSON).
 */
import type { Club, ClubMember } from "@/lib/types";
import wbnSeedJson from "../../../public/data/clubs/wbn/wbn.json";

type WbnSeedFile = {
  club: Club;
  members: ClubMember[];
};

const seed = wbnSeedJson as WbnSeedFile;

export const wbnClub: Club = seed.club;
export const wbnMembers: ClubMember[] = seed.members;
