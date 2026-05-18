import type { Metadata } from "next";
import { Suspense } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { SubmitForm } from "@/components/submit/SubmitForm";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: "Submit",
  description: `Submit a place to ${brand.appName}.`,
};

export default function SubmitPage() {
  return (
    <PageShell
      title="Submit"
      description="Help grow the map — submit meets, shops, clubs, members, and enthusiast spots for review."
    >
      <Suspense fallback={<div className="text-sm text-[#64748B]">Loading…</div>}>
        <SubmitForm />
      </Suspense>
    </PageShell>
  );
}
