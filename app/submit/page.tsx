import type { Metadata } from "next";

import { SubmitForm } from "@/components/forms/SubmitForm";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: "Submit",
  description: `Submit a shop, event, club, member, or correction to ${brand.appName}.`,
};

export default function SubmitPage() {
  return (
    <div className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 lg:px-6">
      <SubmitForm />
    </div>
  );
}
