import { memberCarLine } from "@/lib/members/roles";
import type { ClubMember } from "@/lib/types";
import { formatMemberHandleLabel } from "@/lib/utils/instagram";

/** Accessible alt text for member car / avatar images. */
export function memberImageAlt(member: ClubMember): string {
  const handle = formatMemberHandleLabel(member);
  const car = member.carName?.trim() || memberCarLine(member);
  if (car) return `${handle} — ${car}`;
  return handle;
}
