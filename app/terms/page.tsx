import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: `Terms · ${brand.metadata.siteName}`,
  description: `Terms of use for ${brand.appName}.`,
};

export default function TermsPage() {
  return (
    <PageShell title="Terms of Use" description={`Last updated: May 2026 · ${brand.appName}`}>
      <div className="prose prose-invert max-w-3xl space-y-4 text-sm leading-relaxed text-[#CBD5E1]">
        <p>
          {brand.appName} helps drivers discover clubs, meets, builds, shops, and local automotive
          communities. By using the service you agree to use it responsibly and in compliance with
          applicable laws.
        </p>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">Acceptable use</h2>
        <ul className="list-disc space-y-2 pl-5 text-[#94A3B8]">
          <li>Do not harass, spam, or post unsafe or illegal content.</li>
          <li>Do not impersonate clubs, organizers, or other members.</li>
          <li>Respect intellectual property and privacy of others.</li>
        </ul>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">Accounts</h2>
        <p className="text-[#94A3B8]">
          You are responsible for activity on your account. We may suspend accounts that violate
          these terms or community guidelines.
        </p>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">Contact</h2>
        <p className="text-[#94A3B8]">
          Questions about these terms? Visit{" "}
          <Link href="/support" className="text-[#93C5FD] hover:underline">
            Support
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
