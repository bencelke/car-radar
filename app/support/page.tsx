import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: `Support · ${brand.metadata.siteName}`,
  description: `Get help with ${brand.appName}.`,
};

export default function SupportPage() {
  return (
    <PageShell title="Support" description={`Help with ${brand.appName}`}>
      <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-[#94A3B8]">
        <p>
          Need help signing in, claiming a club, or reporting content? We are here to help during
          private beta.
        </p>
        <div className="rounded-xl border border-white/[0.08] bg-[#0B1118]/80 p-4">
          <h2 className="font-heading text-base font-semibold text-[#F8FAFC]">Common topics</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/login" className="text-[#93C5FD] hover:underline">
                Sign in or create an account
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-[#93C5FD] hover:underline">
                Terms of use
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-[#93C5FD] hover:underline">
                Privacy policy
              </Link>
            </li>
          </ul>
        </div>
        <p>
          Email:{" "}
          <a
            href="mailto:support@shiftit.club"
            className="text-[#93C5FD] hover:underline"
          >
            support@shiftit.club
          </a>
        </p>
      </div>
    </PageShell>
  );
}
