import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { brand } from "@/lib/config/brand";
import { submissionToAdminSubmission } from "@/lib/mappers/ui";
import { getPendingSubmissions } from "@/lib/repositories/submissions";

export const metadata: Metadata = {
  title: "Admin",
  description: `${brand.appName} admin dashboard.`,
};

export default async function AdminPage() {
  const submissions = (await getPendingSubmissions()).map(
    submissionToAdminSubmission
  );

  return <AdminDashboard submissions={submissions} />;
}
