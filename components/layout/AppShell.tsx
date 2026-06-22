"use client";

import { usePathname } from "next/navigation";

import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { TopNav } from "@/components/layout/TopNav";
import { shouldShowMobileBottomNav } from "@/lib/navigation/mobile-bottom-nav";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/login";
  const showBottomNav = shouldShowMobileBottomNav(pathname);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {!hideNav ? <TopNav /> : null}
      <main
        className={cn(
          "flex flex-1 flex-col",
          showBottomNav && "mobile-shell-main pb-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom))] md:pb-0"
        )}
      >
        {children}
      </main>
      {showBottomNav ? <MobileBottomNav /> : null}
    </div>
  );
}
