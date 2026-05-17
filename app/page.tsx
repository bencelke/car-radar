import { DashboardView } from "@/components/dashboard/DashboardView";
import { loadDashboardData } from "@/lib/data/dashboard";

export default async function HomePage() {
  const data = await loadDashboardData();
  return <DashboardView {...data} />;
}
