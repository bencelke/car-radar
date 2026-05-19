import { getMarkerIconSvg } from "@/lib/map/marker-icons";
import { metaString } from "@/lib/map/map-utils";
import { isLeaderRole } from "@/lib/members/roles";
import { MARKER_STYLES } from "@/lib/map/map-utils";
import type { MapItem } from "@/lib/types";

const LEADER_BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#FACC15" stroke="#05070A" stroke-width="1.5" aria-hidden="true"><path d="M11.562 3.266a1 1 0 0 1 1.876 0L15.39 8.87l5.338.462a1 1 0 0 1 .548 1.79l-4.035 3.49 1.205 5.211a1 1 0 0 1-1.49 1.054L12 18.203l-4.955 2.674a1 1 0 0 1-1.49-1.054l1.205-5.211-4.035-3.49a1 1 0 0 1 .548-1.79l5.338-.462z"/></svg>`;

const ADMIN_BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" stroke-width="2.25" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`;

export function createMapMarkerElement(
  item: MapItem,
  selected: boolean,
  onClick: () => void,
  options?: {
    enhanced?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }
): HTMLDivElement {
  const style = MARKER_STYLES[item.type];
  const el = document.createElement("div");
  el.className = `carradar-marker carradar-marker--${item.type}${selected ? " is-selected" : ""}`;
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", item.title);
  el.tabIndex = 0;

  const size = item.type === "zone" ? 44 : 38;
  const verified = item.verified;
  const enhanced = options?.enhanced ?? false;
  const glowSize = selected ? 34 : enhanced ? 26 : 16;
  const borderWidth = selected ? 3 : enhanced ? 2.5 : 2;
  const markerScale = selected ? 1.18 : 1;
  const iconSize = item.type === "zone" ? 18 : 16;
  const outerGlow = selected
    ? `0 0 0 3px rgba(255,255,255,0.2), 0 0 ${glowSize}px ${style.glow}, 0 0 ${enhanced ? 16 : 10}px ${style.glow}`
    : `0 0 ${glowSize}px ${style.glow}, 0 0 ${enhanced ? 10 : 6}px ${style.glow}`;

  const role = item.type === "member" ? metaString(item, "role") : null;
  const showLeader = item.type === "member" && isLeaderRole(role);
  const roleBadge =
    showLeader && role === "club_admin"
      ? ADMIN_BADGE_SVG
      : showLeader
        ? LEADER_BADGE_SVG
        : "";

  el.innerHTML = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      border-radius: 9999px;
      background: ${style.bg};
      border: ${borderWidth}px solid ${style.border};
      box-shadow: ${outerGlow}, inset 0 0 10px rgba(255,255,255,0.07);
      transform: scale(${markerScale});
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      ${getMarkerIconSvg(item.type, style.iconColor, iconSize)}
      ${
        verified
          ? `<span style="
        position: absolute;
        top: -2px;
        right: -2px;
        width: 10px;
        height: 10px;
        border-radius: 9999px;
        background: #22C55E;
        border: 2px solid #05070A;
        box-shadow: 0 0 6px rgba(34,197,94,0.8);
      "></span>`
          : ""
      }
      ${
        roleBadge
          ? `<span style="
        position: absolute;
        bottom: -3px;
        right: -3px;
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: #05070A;
        border: 1px solid rgba(255,255,255,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 8px rgba(0,0,0,0.5);
      ">${roleBadge}</span>`
          : ""
      }
    </div>
  `;

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });

  if (item.type === "member" && options?.onMouseEnter) {
    el.addEventListener("mouseenter", options.onMouseEnter);
  }
  if (item.type === "member" && options?.onMouseLeave) {
    el.addEventListener("mouseleave", options.onMouseLeave);
  }

  return el;
}
