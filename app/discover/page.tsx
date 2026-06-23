import { HomeSceneView } from "@/components/home/HomeSceneView";
import { loadDashboardData } from "@/lib/data/dashboard";

export default async function DiscoverPage() {
  const data = await loadDashboardData();
  return <HomeSceneView {...data} />;
}
