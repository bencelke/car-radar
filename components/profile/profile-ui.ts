import { cn } from "@/lib/utils";

export const premiumPanelClass = cn(
  "rounded-[20px] border border-white/[0.08] bg-[#0B1118]/70",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_8px_32px_-16px_rgba(0,0,0,0.55)]",
  "backdrop-blur-xl"
);

export const elevatedPanelClass = cn(
  "rounded-2xl border border-white/[0.06] bg-[#151B24]/50"
);

export const sectionHeadingClass =
  "font-heading text-sm font-semibold tracking-tight text-[#F8FAFC]";

export const sectionSubtextClass = "mt-1 text-xs leading-relaxed text-[#64748B]";

export const statChipClass = cn(
  "inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-medium"
);

export const statusBadgeClass = cn(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
);
