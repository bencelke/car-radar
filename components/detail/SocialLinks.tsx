import { ExternalLink, Share2 } from "lucide-react";

import { normalizeSocialUrl } from "@/lib/utils/social";
import { cn } from "@/lib/utils";

export type SocialLinkItem = {
  href: string;
  label: string;
  kind: "instagram" | "tiktok" | "youtube" | "website" | "source";
};

type SocialLinksProps = {
  links: SocialLinkItem[];
  title?: string;
  className?: string;
};

export function SocialLinks({ links, title, className }: SocialLinksProps) {
  const visible = links.filter((l) => l.href.trim());
  if (visible.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {title ? (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
          {title}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {visible.map((link) => (
          <a
            key={`${link.kind}-${link.href}`}
            href={normalizeSocialUrl(link.href)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#151B24]/60 px-3 py-2 text-xs font-medium text-[#CBD5E1] transition hover:border-white/[0.12] hover:text-[#F8FAFC]"
          >
            {link.kind === "instagram" ? (
              <Share2 className="size-3.5" />
            ) : (
              <ExternalLink className="size-3.5" />
            )}
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
