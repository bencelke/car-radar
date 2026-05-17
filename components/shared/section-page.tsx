import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

type SectionPageProps = {
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
};

export function SectionPage({
  title,
  description,
  badge = "Preview",
  children,
}: SectionPageProps) {
  return (
    <PageShell>
      <div className="mb-6 flex items-center gap-3">
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          render={<Link href="/" />}
          className="border-white/[0.08] bg-[#0B1118] text-[#CBD5E1]"
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Dashboard
        </Button>
        <span className="rounded-full border border-[#A855F7]/40 bg-[#A855F7]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#A855F7]">
          {badge}
        </span>
      </div>
      <h1 className="font-heading text-3xl font-bold text-[#F8FAFC]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#64748B]">{description}</p>
      <div className="mt-8">
        {children ?? (
          <GlassPanel className="p-8">
            <p className="text-center text-sm text-[#64748B]">
              Full {title.toLowerCase()} experience coming soon. Use the main
              dashboard to preview mock data.
            </p>
          </GlassPanel>
        )}
      </div>
    </PageShell>
  );
}
