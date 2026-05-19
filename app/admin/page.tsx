import type { Metadata } from "next";

import { AdminGate } from "@/components/admin/AdminGate";
import { brand } from "@/lib/config/brand";
import { getSubmissionsByStatus } from "@/lib/repositories/submissions";

export const metadata: Metadata = {
  title: "Admin",
  description: `${brand.appName} admin dashboard.`,
};

export default async function AdminPage() {
  const submissions = await getSubmissionsByStatus("all");

  return <AdminGate initialSubmissions={submissions} />;
}
