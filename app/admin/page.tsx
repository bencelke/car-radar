import type { Metadata } from "next";

import { AdminOverview } from "@/components/admin/AdminOverview";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: `Founder Console · ${brand.metadata.siteName}`,
  description: `${brand.appName} admin control center.`,
};

export default function AdminOverviewPage() {
  return <AdminOverview />;
}
