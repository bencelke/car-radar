"use client";

import { Car, X } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";

type GaragePlaceholderDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function GaragePlaceholderDialog({
  open,
  onClose,
}: GaragePlaceholderDialogProps) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garage-soon-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0B1118]/95 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-white/5 hover:text-[#F8FAFC]"
          aria-label={t.home.garageClose}
        >
          <X className="size-4" />
        </button>
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-[#A855F7]/30 bg-gradient-to-br from-[#3B82F6]/20 to-[#A855F7]/20 text-[#A855F7]">
          <Car className="size-6" />
        </div>
        <h2
          id="garage-soon-title"
          className="font-heading text-lg font-semibold text-[#F8FAFC]"
        >
          {t.home.garageComingSoonTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
          {t.home.garageComingSoonBody}
        </p>
        <Button
          type="button"
          onClick={onClose}
          className="mt-6 w-full border border-white/10 bg-white/5 text-[#F8FAFC] hover:bg-white/10"
        >
          {t.home.garageClose}
        </Button>
      </div>
    </div>
  );
}
