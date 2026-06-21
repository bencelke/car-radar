"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  ClipboardList,
  Loader2,
  Mail,
  ShieldCheck,
  Store,
} from "lucide-react";

import { AdminActionCard } from "@/components/admin/AdminActionCard";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminPageHeader } from "@/components/admin/AdminSectionCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { UserTitleBadge } from "@/components/profile/UserTitleBadge";
import { ADMIN_ROUTES } from "@/lib/config/admin-routes";
import { getUserDisplayTitle, isFounderUser } from "@/lib/auth/permissions";
import { displayNameFromUserLike } from "@/lib/auth/user-display";
import {
  getAdminDashboardMetrics,
} from "@/lib/repositories/admin-data";
import type { AdminDashboardMetrics, AdminMetricValue } from "@/lib/types/admin";

function formatMetric(
  value: AdminMetricValue | undefined,
  loading: boolean
): string | number | undefined {
  if (loading) return undefined;
  if (value === null || value === undefined) return "—";
  return value;
}

type ReviewRowProps = {
  label: string;
  count: AdminMetricValue | undefined;
  href: string;
  loading: boolean;
};

function ReviewRow({ label, count, href, loading }: ReviewRowProps) {
  const { t } = useLocale();
  const display = formatMetric(count, loading);

  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#0B1118]/40 px-3 py-2.5 transition hover:border-[#3B82F6]/25"
    >
      <span className="text-sm text-[#CBD5E1]">{label}</span>
      <div className="text-right">
        <span className="font-heading text-lg font-semibold text-[#F8FAFC]">
          {display ?? "…"}
        </span>
        {count === null && !loading ? (
          <p className="text-[10px] text-[#64748B]">{t.admin.notConnectedYet}</p>
        ) : null}
      </div>
    </Link>
  );
}

export function AdminOverview() {
  const { t } = useLocale();
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName = displayNameFromUserLike(profile, user);
  const greetingTitle = isFounderUser(profile)
    ? t.admin.founderConsoleTitle
    : t.admin.dashboardTitle;

  useEffect(() => {
    let cancelled = false;
    void getAdminDashboardMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = [
    { label: t.admin.overviewClubs, value: metrics?.clubCount, accent: "blue" as const },
    { label: t.admin.navUsers, value: metrics?.userCount, accent: "purple" as const, nullable: true },
    { label: t.admin.overviewMembers, value: metrics?.memberCount, accent: "purple" as const },
    { label: t.admin.statPendingClubRequests, value: null, accent: "amber" as const, nullable: true },
    { label: t.admin.statPendingClaims, value: metrics?.pendingClaimCount, accent: "amber" as const },
    { label: t.admin.statUnclaimedProfiles, value: metrics?.unclaimedMemberCount, accent: "amber" as const },
    { label: t.admin.overviewPending, value: metrics?.pendingSubmissionCount, accent: "red" as const },
    { label: t.admin.overviewEvents, value: metrics?.upcomingEventCount, accent: "blue" as const },
    { label: t.admin.overviewShops, value: metrics?.shopCount, accent: "blue" as const },
    { label: t.admin.navReports, value: metrics?.pendingReportCount, accent: "red" as const, nullable: true },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={greetingTitle}
        subtitle={t.admin.controlCenterSubtitle}
      >
        <UserTitleBadge profile={profile} />
      </AdminPageHeader>

      <div className="rounded-xl border border-white/[0.06] bg-[#151B24]/40 p-4 sm:p-5">
        <p className="text-sm text-[#94A3B8]">{t.admin.welcomeBack}</p>
        <p className="mt-1 font-heading text-xl font-semibold text-[#F8FAFC]">
          {displayName}
        </p>
        {getUserDisplayTitle(profile) ? (
          <p className="mt-1 text-xs text-[#64748B]">
            {getUserDisplayTitle(profile)}
          </p>
        ) : null}
      </div>

      <AdminSectionCard title={t.admin.primaryActions}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AdminActionCard
            title={t.admin.actionCreateClub}
            href={`${ADMIN_ROUTES.clubs}?action=create`}
            icon={Building2}
          />
          <AdminActionCard
            title={t.admin.actionInviteUser}
            href={`${ADMIN_ROUTES.invitations}?action=create`}
            icon={Mail}
          />
          <AdminActionCard
            title={t.admin.actionReviewClaims}
            href={ADMIN_ROUTES.claims}
            icon={ShieldCheck}
          />
          <AdminActionCard
            title={t.admin.actionReviewSubmissions}
            href={ADMIN_ROUTES.submissions}
            icon={ClipboardList}
          />
          <AdminActionCard
            title={t.admin.actionAddEvent}
            href={`${ADMIN_ROUTES.events}?action=create`}
            icon={Calendar}
          />
          <AdminActionCard
            title={t.admin.actionAddShop}
            href={`${ADMIN_ROUTES.shops}?action=create`}
            icon={Store}
          />
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title={t.admin.platformStats}
        subtitle={t.admin.statsWiredNote}
      >
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Loader2 className="size-4 animate-spin" />
            {t.admin.loading}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {statCards.map((card) => (
              <AdminStatCard
                key={card.label}
                label={card.label}
                value={formatMetric(
                  card.nullable ? (card.value as AdminMetricValue) : (card.value ?? 0),
                  loading
                )}
                hint={
                  card.nullable && card.value === null && !loading
                    ? t.admin.notConnectedYet
                    : undefined
                }
                accent={card.accent}
              />
            ))}
          </div>
        )}
      </AdminSectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminSectionCard
          title={t.admin.needsReview}
          subtitle={t.admin.needsReviewSubtitle}
        >
          <div className="space-y-2">
            <ReviewRow
              label={t.admin.reviewProfileClaims}
              count={metrics?.pendingClaimCount ?? 0}
              href={ADMIN_ROUTES.claims}
              loading={loading}
            />
            <ReviewRow
              label={t.admin.overviewPending}
              count={metrics?.pendingSubmissionCount ?? 0}
              href={ADMIN_ROUTES.submissions}
              loading={loading}
            />
            <ReviewRow
              label={t.admin.reviewReportedContent}
              count={metrics?.pendingReportCount}
              href={ADMIN_ROUTES.reports}
              loading={loading}
            />
            <ReviewRow
              label={t.admin.reviewClubRequests}
              count={null}
              href={ADMIN_ROUTES.clubs}
              loading={loading}
            />
            <ReviewRow
              label={t.admin.reviewShopSubmissions}
              count={null}
              href={ADMIN_ROUTES.submissions}
              loading={loading}
            />
            <ReviewRow
              label={t.admin.reviewEventSubmissions}
              count={null}
              href={ADMIN_ROUTES.submissions}
              loading={loading}
            />
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title={t.admin.growthQueue}
          subtitle={t.admin.growthQueueSubtitle}
        >
          <div className="space-y-2">
            <ReviewRow
              label={t.admin.queueUnclaimedProfiles}
              count={metrics?.unclaimedMemberCount ?? 0}
              href={ADMIN_ROUTES.members}
              loading={loading}
            />
            <ReviewRow
              label={t.admin.queueClubsMissingOwner}
              count={metrics?.clubsMissingOwnerCount ?? 0}
              href={ADMIN_ROUTES.clubs}
              loading={loading}
            />
            <ReviewRow
              label={t.admin.queueClubsMissingLogo}
              count={metrics?.clubsMissingLogoCount ?? 0}
              href={ADMIN_ROUTES.clubs}
              loading={loading}
            />
            <ReviewRow
              label={t.admin.queueMembersMissingImages}
              count={metrics?.membersMissingImageCount ?? 0}
              href={ADMIN_ROUTES.members}
              loading={loading}
            />
            <ReviewRow
              label={t.admin.queueInvitations}
              count={metrics?.activeInviteCount}
              href={ADMIN_ROUTES.invitations}
              loading={loading}
            />
          </div>
        </AdminSectionCard>
      </div>

      <AdminSectionCard title={t.admin.quickLinks}>
        <div className="flex flex-wrap gap-2 text-sm">
          {Object.entries(ADMIN_ROUTES).map(([key, href]) => (
            <Link
              key={key}
              href={href}
              className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-[#93C5FD] hover:border-[#3B82F6]/30"
            >
              {href}
            </Link>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  );
}
