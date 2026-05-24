"use client";

import { useLocale } from "@/components/providers/LocaleProvider";

/** Muted placeholder when no extended build data exists */
export function MemberBuildDetailsCard() {
  const { t } = useLocale();

  return (
    <p className="rounded-xl border border-dashed border-white/[0.06] bg-[#151B24]/30 px-3 py-2.5 text-center text-[11px] leading-relaxed text-[#64748B]">
      {t.members.buildDetailsEmpty}
    </p>
  );
}
