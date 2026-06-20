import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: `Privacy · ${brand.metadata.siteName}`,
  description: `Privacy policy for ${brand.appName}.`,
};

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      description={`Last updated: May 2026 · ${brand.appName}`}
    >
      <div className="prose prose-invert max-w-3xl space-y-4 text-sm leading-relaxed text-[#CBD5E1]">
        <p>
          {brand.appName} collects information you provide when you create an account, build a
          garage profile, or interact with clubs and events. We use Firebase Authentication and
          Firestore to store account and profile data securely.
        </p>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">What we collect</h2>
        <ul className="list-disc space-y-2 pl-5 text-[#94A3B8]">
          <li>Account email, display name, and authentication provider metadata.</li>
          <li>Public profile and garage content you choose to publish.</li>
          <li>Usage data needed to operate maps, feeds, and notifications.</li>
        </ul>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">What we do not do</h2>
        <ul className="list-disc space-y-2 pl-5 text-[#94A3B8]">
          <li>We do not sell your personal data.</li>
          <li>Instagram handles are public profile fields — not login credentials.</li>
          <li>Guest browsing does not create an account or Firestore profile.</li>
        </ul>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">Contact</h2>
        <p className="text-[#94A3B8]">
          Privacy questions? Visit{" "}
          <Link href="/support" className="text-[#93C5FD] hover:underline">
            Support
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
