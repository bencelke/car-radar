"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getAdminOverviewStats } from "@/lib/repositories/admin-data";
import type { AdminOverviewStats } from "@/lib/repositories/admin-data";

type AdminOverviewPanelProps = {
  pendingCount: number;
};

export function AdminOverviewPanel({ pendingCount }: AdminOverviewPanelProps) {
  const { t } = useLocale();
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getAdminOverviewStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: t.admin.overviewClubs, value: stats?.clubCount },
    { label: t.admin.overviewMembers, value: stats?.memberCount },
    { label: t.admin.overviewEvents, value: stats?.upcomingEventCount },
    {
      label: t.admin.overviewPending,
      value: pendingCount || stats?.pendingSubmissionCount,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">
          {t.admin.overviewTitle}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">{t.admin.overviewSubtitle}</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <Loader2 className="size-4 animate-spin" />
          {t.admin.loading}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <GlassPanel key={card.label} className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
                {card.label}
              </p>
              <p className="mt-2 font-heading text-2xl font-bold text-[#F8FAFC]">
                {card.value ?? "—"}
              </p>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
