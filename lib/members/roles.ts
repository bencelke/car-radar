import type { ClubMember } from "@/lib/types";

export type MemberRole =
  | "member"
  | "club_owner"
  | "club_admin"
  | "founder"
  | "road_captain"
  | "photographer";

export const LEADER_ROLES: MemberRole[] = [
  "club_owner",
  "club_admin",
  "founder",
];

export function normalizeMemberRole(
  role?: string | null
): MemberRole | undefined {
  if (!role) return undefined;
  const valid: MemberRole[] = [
    "member",
    "club_owner",
    "club_admin",
    "founder",
    "road_captain",
    "photographer",
  ];
  return valid.includes(role as MemberRole) ? (role as MemberRole) : undefined;
}

export function isLeaderRole(role?: MemberRole | string | null): boolean {
  const r = normalizeMemberRole(role);
  return r != null && LEADER_ROLES.includes(r);
}

export function isStaffRole(role?: MemberRole | string | null): boolean {
  const r = normalizeMemberRole(role);
  return r != null && r !== "member";
}

const ROLE_LABEL_KEYS = {
  member: "roleMember",
  club_owner: "roleClubOwner",
  club_admin: "roleClubAdmin",
  founder: "roleFounder",
  road_captain: "roleRoadCaptain",
  photographer: "rolePhotographer",
} as const;

export type MemberRoleLabelKey =
  (typeof ROLE_LABEL_KEYS)[keyof typeof ROLE_LABEL_KEYS];

export function memberRoleLabelKey(
  role?: MemberRole | string | null
): MemberRoleLabelKey {
  const r = normalizeMemberRole(role) ?? "member";
  return ROLE_LABEL_KEYS[r];
}

export function memberAvatarGradient(member: ClubMember): string {
  const make = member.carMake?.toLowerCase() ?? "";
  if (make.includes("bmw")) return "from-blue-600/70 via-indigo-900/50 to-[#05070A]";
  if (make.includes("toyota") || make.includes("honda") || make.includes("nissan")) {
    return "from-red-600/60 via-rose-900/40 to-[#05070A]";
  }
  if (make.includes("ford") || make.includes("dodge")) {
    return "from-amber-600/60 via-orange-900/40 to-[#05070A]";
  }
  let hash = 0;
  for (let i = 0; i < member.id.length; i++) {
    hash = (hash + member.id.charCodeAt(i)) % 997;
  }
  const palettes = [
    "from-violet-600/60 via-purple-900/40 to-[#05070A]",
    "from-cyan-600/50 via-slate-900/40 to-[#05070A]",
    "from-emerald-600/50 via-teal-900/40 to-[#05070A]",
  ];
  return palettes[hash % palettes.length];
}

export function memberDisplayTitle(member: ClubMember): string {
  const car = [member.carYear, member.carMake, member.carModel]
    .filter(Boolean)
    .join(" ");
  return member.carName ?? (car || member.displayName);
}

export function memberCarLine(member: ClubMember): string {
  const parts = [member.carYear, member.carMake, member.carModel].filter(Boolean);
  return parts.join(" ") || member.carName || "";
}
