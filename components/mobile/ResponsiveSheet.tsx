"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils";

type ResponsiveSheetSide = "bottom" | "left";

type ResponsiveSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: ResponsiveSheetSide;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  panelClassName?: string;
  showHandle?: boolean;
};

export function ResponsiveSheet({
  open,
  onOpenChange,
  side = "bottom",
  title,
  closeLabel,
  children,
  footer,
  className,
  panelClassName,
  showHandle = side === "bottom",
}: ResponsiveSheetProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const isBottom = side === "bottom";

  return (
    <div
      className={cn("fixed inset-0 z-[70]", className)}
      role="presentation"
    >
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute flex flex-col border border-white/[0.1] bg-[#0B1118]/98 shadow-[0_-24px_64px_rgba(0,0,0,0.65)] backdrop-blur-xl",
          isBottom
            ? "inset-x-0 bottom-0 max-h-[min(92dvh,920px)] rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            : "inset-y-0 left-0 w-[min(100vw-3rem,320px)] rounded-r-2xl pt-[env(safe-area-inset-top)]",
          panelClassName
        )}
      >
        {showHandle && isBottom ? (
          <div className="flex shrink-0 justify-center pt-2" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-white/20" />
          </div>
        ) : null}

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <h2
            id={titleId}
            className="font-heading text-sm font-semibold tracking-tight text-[#F8FAFC]"
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={closeLabel}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition hover:bg-white/5 hover:text-[#F8FAFC]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-white/[0.06] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
