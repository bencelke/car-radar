"use client";

import { SubmissionReviewPanel } from "@/components/admin/SubmissionReviewPanel";
import { AdminPageHeader } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Submission } from "@/lib/types";

type AdminSubmissionsPageClientProps = {
  initialSubmissions: Submission[];
};

export function AdminSubmissionsPageClient({
  initialSubmissions,
}: AdminSubmissionsPageClientProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navSubmissions}
        subtitle={t.admin.submissionsSectionSubtitle}
      />
      <SubmissionReviewPanel initialSubmissions={initialSubmissions} />
    </div>
  );
}
