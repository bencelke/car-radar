import type { AccentColor } from "@/lib/types";

export const accentStyles: Record<
  AccentColor,
  { text: string; bg: string; border: string; glow: string; dot: string }
> = {
  red: {
    text: "text-[#EF4444]",
    bg: "bg-[#EF4444]/15",
    border: "border-[#EF4444]/40",
    glow: "shadow-[0_0_20px_-4px_rgba(239,68,68,0.5)]",
    dot: "bg-[#EF4444]",
  },
  orange: {
    text: "text-[#F97316]",
    bg: "bg-[#F97316]/15",
    border: "border-[#F97316]/40",
    glow: "shadow-[0_0_20px_-4px_rgba(249,115,22,0.5)]",
    dot: "bg-[#F97316]",
  },
  purple: {
    text: "text-[#A855F7]",
    bg: "bg-[#A855F7]/15",
    border: "border-[#A855F7]/40",
    glow: "shadow-[0_0_20px_-4px_rgba(168,85,247,0.5)]",
    dot: "bg-[#A855F7]",
  },
  blue: {
    text: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/15",
    border: "border-[#3B82F6]/40",
    glow: "shadow-[0_0_20px_-4px_rgba(59,130,246,0.5)]",
    dot: "bg-[#3B82F6]",
  },
  green: {
    text: "text-[#22C55E]",
    bg: "bg-[#22C55E]/15",
    border: "border-[#22C55E]/40",
    glow: "shadow-[0_0_20px_-4px_rgba(34,197,94,0.5)]",
    dot: "bg-[#22C55E]",
  },
  gold: {
    text: "text-[#FACC15]",
    bg: "bg-[#FACC15]/15",
    border: "border-[#FACC15]/40",
    glow: "shadow-[0_0_20px_-4px_rgba(250,204,21,0.5)]",
    dot: "bg-[#FACC15]",
  },
};
