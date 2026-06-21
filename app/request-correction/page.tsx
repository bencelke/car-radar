import { CorrectionRequestPageContent } from "@/components/claims/CorrectionRequestPageContent";
import { brand } from "@/lib/config/brand";

export const metadata = {
  title: `Request correction | ${brand.appName}`,
  description: "Request a correction or removal for a ShiftIt listing.",
};

export default function RequestCorrectionPage() {
  return <CorrectionRequestPageContent />;
}
