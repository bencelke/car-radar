import { HomeSceneView } from "@/components/home/HomeSceneView";
import { loadDashboardData } from "@/lib/data/dashboard";

export default async function HomePage() {
  const data = await loadDashboardData();
  return <HomeSceneView {...data} />;
}
