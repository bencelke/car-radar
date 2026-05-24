"use client";

import { usePathname } from "next/navigation";

import { TopNav } from "@/components/layout/TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/login";

  return (
    <>
      {!hideNav ? <TopNav /> : null}
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
