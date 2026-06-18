"use client";

import { premiumPanelClass } from "@/components/profile/profile-ui";
import { cn } from "@/lib/utils";

export function ProfilePageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className={cn(premiumPanelClass, "h-36 sm:h-32")} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#151B24]/60" />
        ))}
      </div>
      <div className={cn(premiumPanelClass, "h-56")} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-64 rounded-2xl bg-[#151B24]/60" />
          <div className="h-48 rounded-2xl bg-[#151B24]/60" />
        </div>
        <div className="space-y-6">
          <div className="h-40 rounded-2xl bg-[#151B24]/60" />
          <div className="h-36 rounded-2xl bg-[#151B24]/60" />
        </div>
      </div>
    </div>
  );
}
