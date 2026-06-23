import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { ROUTES } from "@/lib/config/routes";

export default function NotFound() {
  return (
    <PageShell
      title="Page not found"
      description="This listing or page does not exist, or is not public yet."
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href={ROUTES.home}
          className="rounded-lg border border-white/[0.08] bg-[#151B24]/60 px-4 py-2 text-sm text-[#CBD5E1] hover:text-[#F8FAFC]"
        >
          Home
        </Link>
        <Link
          href="/map"
          className="rounded-lg border border-[#3B82F6]/40 bg-[#3B82F6]/15 px-4 py-2 text-sm text-[#93C5FD]"
        >
          Map
        </Link>
      </div>
    </PageShell>
  );
}
