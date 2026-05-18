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
  el.className = `carradar-marker${selected ? " is-selected" : ""}`;
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", item.title);
  el.tabIndex = 0;

  const size = item.type === "zone" ? 44 : 36;
  const verified = item.verified;
  const enhanced = options?.enhanced ?? false;
  const glowSize = enhanced ? 22 : 14;
  const borderWidth = enhanced ? 2.5 : 2;

  el.innerHTML = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      border-radius: 9999px;
      background: ${style.bg};
      border: ${borderWidth}px solid ${style.border};
      box-shadow: 0 0 ${glowSize}px ${style.glow}, 0 0 ${enhanced ? 8 : 4}px ${style.glow}, inset 0 0 8px rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading, system-ui), sans-serif;
      font-size: ${item.type === "zone" ? "11px" : "13px"};
      font-weight: 700;
      color: ${style.border};
      letter-spacing: 0.02em;
    ">
      ${style.letter}
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
