import { AdminSubmissionsPageClient } from "@/components/admin/AdminSubmissionsPageClient";
import { getSubmissionsByStatus } from "@/lib/repositories/submissions";

export default async function AdminSubmissionsPage() {
  const submissions = await getSubmissionsByStatus("all");
  return <AdminSubmissionsPageClient initialSubmissions={submissions} />;
}
