"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Radar, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05070A]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between gap-4 px-4 lg:px-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 font-heading text-lg font-bold tracking-wide text-[#F8FAFC]"
        >
          <span className="flex size-8 items-center justify-center rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444] shadow-[0_0_16px_-4px_rgba(239,68,68,0.4)]">
            <Radar className="size-4" strokeWidth={2.5} />
          </span>
          {brand.appName}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {brand.nav.main.map((item) => {
            const active =
              item.href === "/map"
                ? pathname === "/" || pathname === "/map"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-[#F8FAFC]"
                    : "text-[#64748B] hover:text-[#CBD5E1]"
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-[#EF4444] to-[#F97316]" />
                ) : null}
              </Link>
            );
          })}
          <Link
            href={brand.nav.garage.href}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#64748B] hover:text-[#CBD5E1]"
          >
            {brand.nav.garage.label}
            <span className="rounded-full border border-[#A855F7]/40 bg-[#A855F7]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#A855F7]">
              {brand.nav.garage.badge}
            </span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href={brand.nav.submit.href} />}
            size="sm"
            className="hidden h-8 border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC] shadow-[0_0_20px_-6px_rgba(239,68,68,0.5)] hover:bg-[#EF4444]/30 sm:inline-flex"
          >
            {brand.nav.submit.label}
          </Button>
          <button
            type="button"
            aria-label="Notifications"
            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0B1118] text-[#64748B] transition hover:border-white/[0.12] hover:text-[#CBD5E1]"
          >
            <Bell className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Profile"
            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-gradient-to-br from-[#3B82F6]/30 to-[#A855F7]/30 text-[#CBD5E1]"
          >
            <User className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
