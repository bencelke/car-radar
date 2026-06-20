"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type LanguageDropdownProps = {
  variant?: "menu" | "standalone";
  onSelect?: () => void;
  className?: string;
};

const LOCALES = [
  { code: "en" as const, label: "English" },
  { code: "de" as const, label: "Deutsch" },
];

export function LanguageDropdown({
  variant = "standalone",
  onSelect,
  className,
}: LanguageDropdownProps) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const activeLabel =
    LOCALES.find((item) => item.code === locale)?.label ?? locale.toUpperCase();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectLocale(code: "en" | "de") {
    setLocale(code);
    setOpen(false);
    onSelect?.();
  }

  const triggerClass =
    variant === "menu"
      ? "flex w-full min-h-11 items-center justify-between gap-2 rounded-xl px-3 text-sm text-[#CBD5E1] transition hover:bg-white/[0.04] hover:text-[#F8FAFC]"
      : "flex h-11 min-h-11 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#0B1118]/90 px-3 text-xs font-medium text-[#CBD5E1] transition hover:border-white/[0.12] hover:text-[#F8FAFC]";

  return (
    <div ref={panelRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
      >
        <span className="inline-flex items-center gap-2">
          <Globe className="size-4 shrink-0 text-[#64748B]" />
          <span>{variant === "menu" ? t.profile.language : activeLabel}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[#64748B] transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t.profile.language}
          className={cn(
            "absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B1118] py-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)]",
            variant === "menu" ? "left-0 right-0" : "right-0"
          )}
        >
          {LOCALES.map((item) => {
            const active = locale === item.code;
            return (
              <li key={item.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full min-h-10 items-center justify-between gap-2 px-3 text-left text-sm transition",
                    active
                      ? "bg-white/[0.06] text-[#F8FAFC]"
                      : "text-[#CBD5E1] hover:bg-white/[0.04]"
                  )}
                  onClick={() => selectLocale(item.code)}
                >
                  <span>{item.label}</span>
                  {active ? <Check className="size-4 text-[#3B82F6]" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
