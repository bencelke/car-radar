import { ClaimPageContent } from "@/components/claims/ClaimPageContent";
import { brand } from "@/lib/config/brand";

export const metadata = {
  title: `Claim profile | ${brand.appName}`,
  description: "Request ownership of a club, garage, or shop on ShiftIt.",
};

export default function ClaimPage() {
  return <ClaimPageContent />;
}
