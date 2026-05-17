import type { Metadata } from "next";

import { SubmitForm } from "@/components/submit/SubmitForm";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: "Submit",
  description: `Submit a place to ${brand.appName}.`,
};

export default function SubmitPage() {
  return (
    <PageShell
      title="Submit a Place"
      description="Help grow the map — submit meets, shops, clubs, and enthusiast spots for review."
    >
      <SubmitForm />
    </PageShell>
  );
}
