import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { brand } from "@/lib/config/brand";
import { getSubmissionsByStatus } from "@/lib/repositories/submissions";

export const metadata: Metadata = {
  title: "Admin",
  description: `${brand.appName} admin dashboard.`,
};

export default async function AdminPage() {
  const submissions = await getSubmissionsByStatus("all");

  return <AdminDashboard initialSubmissions={submissions} />;
}
