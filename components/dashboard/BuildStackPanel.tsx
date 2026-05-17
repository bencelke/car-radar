import { Check, Globe } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import {
  buildFlow,
  monetizationTiers,
  scaleChecklist,
  techStack,
} from "@/lib/mock-data/car-radar";
import { cn } from "@/lib/utils";

export function HowItsBuiltPanel() {
  return (
    <GlassPanel>
      <PanelHeader title="How It's Built" />
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-4">
        {buildFlow.map((item, i) => (
          <div key={item.step} className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold",
                item.status === "active"
                  ? "border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]"
                  : "border-white/[0.06] bg-[#151B24]/60 text-[#64748B]"
              )}
            >
              {item.step}
              {item.status === "later" ? (
                <span className="ml-1 text-[#64748B]/70">(later)</span>
              ) : null}
            </span>
            {i < buildFlow.length - 1 ? (
              <span className="text-[#64748B]">→</span>
            ) : null}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

export function ScaledPanel() {
  return (
    <GlassPanel>
      <PanelHeader title="Scaled for 100K Users" />
      <div className="grid gap-4 p-4 pt-0 lg:grid-cols-[1fr_auto]">
        <ul className="space-y-2">
          {scaleChecklist.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-xs text-[#CBD5E1]"
            >
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/15 text-[#22C55E]">
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="relative flex h-28 w-full items-center justify-center rounded-xl border border-white/[0.06] bg-[#05070A] lg:w-36">
          <Globe className="size-12 text-[#3B82F6]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_60%)]" />
        </div>
      </div>
    </GlassPanel>
  );
}

export function TechStackPanel() {
  return (
    <GlassPanel>
      <PanelHeader title="Tech Stack" />
      <div className="flex flex-wrap gap-2 p-4 pt-0">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-white/[0.08] bg-[#151B24]/80 px-3 py-1 text-[10px] font-medium text-[#CBD5E1]"
          >
            {tech}
          </span>
        ))}
      </div>
    </GlassPanel>
  );
}

export function MonetizationPanel() {
  return (
    <GlassPanel>
      <PanelHeader title="Monetization Potential" />
      <ul className="divide-y divide-white/[0.05]">
        {monetizationTiers.map((tier) => (
          <li
            key={tier.title}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <span className="text-xs text-[#CBD5E1]">{tier.title}</span>
            <span className="shrink-0 text-[10px] font-semibold text-[#FACC15]">
              {tier.price}
            </span>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
