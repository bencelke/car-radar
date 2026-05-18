"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex rounded-lg border border-white/[0.08] bg-[#0B1118] p-0.5">
      {(["en", "de"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={cn(
            "rounded-md px-2 py-1 text-[10px] font-semibold uppercase transition",
            locale === code
              ? "bg-[#EF4444]/20 text-[#F8FAFC]"
              : "text-[#64748B] hover:text-[#CBD5E1]"
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
