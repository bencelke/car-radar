import { getMarkerIconSvg } from "@/lib/map/marker-icons";
import { MARKER_STYLES } from "@/lib/map/map-utils";
import type { MapItem } from "@/lib/types";

export function createMapMarkerElement(
  item: MapItem,
  selected: boolean,
  onClick: () => void,
  options?: { enhanced?: boolean }
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
  const glowSize = selected ? 30 : enhanced ? 24 : 16;
  const borderWidth = selected ? 3 : enhanced ? 2.5 : 2;
  const markerScale = selected ? 1.16 : 1;
  const iconSize = item.type === "zone" ? 18 : 16;
  const outerGlow = selected
    ? `0 0 0 3px rgba(255,255,255,0.18), 0 0 ${glowSize}px ${style.glow}, 0 0 ${enhanced ? 14 : 10}px ${style.glow}`
    : `0 0 ${glowSize}px ${style.glow}, 0 0 ${enhanced ? 10 : 6}px ${style.glow}`;

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
    </div>
  `;

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
