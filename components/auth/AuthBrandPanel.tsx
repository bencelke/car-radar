"use client";

import { MapPin, MessageCircle, Sparkles, Wrench } from "lucide-react";

import { authUi } from "@/components/auth/auth-ui";
import { ShiftItLogo } from "@/components/brand/ShiftItLogo";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type AuthBrandPanelProps = {
  compact?: boolean;
  /** Mobile-only condensed benefits shown below the auth card */
  benefitsOnly?: boolean;
  className?: string;
};

export function AuthBrandPanel({
  compact = false,
  benefitsOnly = false,
  className,
}: AuthBrandPanelProps) {
  const { t } = useLocale();

  const bullets = [
    { icon: MapPin, text: t.auth.valueFindMeets },
    { icon: Sparkles, text: t.auth.valueFollowClubs },
    { icon: Wrench, text: t.auth.valueCreateGarage },
    { icon: MessageCircle, text: t.auth.valueJoinConversations },
  ];

  const visibleBullets = compact || benefitsOnly ? bullets.slice(0, 3) : bullets;

  if (benefitsOnly) {
    return (
      <ul className={cn("grid gap-3 sm:grid-cols-1", className)}>
        {visibleBullets.map(({ icon: Icon, text }) => (
          <li key={text} className={authUi.benefitRow}>
            <span className={authUi.benefitIcon}>
              <Icon className="size-[1.125rem]" aria-hidden />
            </span>
            <span className={authUi.type.benefit}>{text}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col justify-center",
        compact ? "items-center text-center" : "lg:py-2 lg:pr-6",
        className
      )}
    >
      {!compact ? (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl opacity-35"
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 18% 28%, rgba(239,68,68,0.1), transparent 40%),
                radial-gradient(circle at 72% 62%, rgba(59,130,246,0.1), transparent 38%),
                linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "100% 100%, 100% 100%, 40px 40px, 40px 40px",
            }}
          />
          <span className="absolute left-[16%] top-[24%] size-2 rounded-full bg-[#EF4444]/60 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
          <span className="absolute left-[58%] top-[42%] size-1.5 rounded-full bg-[#3B82F6]/60 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
          <span className="absolute left-[40%] top-[72%] size-2 rounded-full bg-[#A855F7]/50 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
        </div>
      ) : null}

      <div
        className={cn(
          "relative",
          compact ? "space-y-3" : "space-y-0"
        )}
      >
        {!compact ? (
          <ShiftItLogo variant="hero" priority className="lg:mx-0" />
        ) : null}

        {!compact ? (
          <div className="mt-7 max-w-md lg:mt-8">
            <h1 className={authUi.type.brandHeadline}>{t.auth.brandHeadline}</h1>
            <p className={cn("mt-3", authUi.type.brandSubcopy)}>{t.auth.brandSubcopy}</p>
          </div>
        ) : null}

        {compact ? (
          <div className="max-w-sm">
            <h2 className="font-heading text-lg font-bold leading-tight tracking-tight text-[#F8FAFC]">
              {t.auth.brandHeadline}
            </h2>
            <p className={cn("mt-2", authUi.type.brandSubcopy, "text-xs sm:text-sm")}>
              {t.auth.brandSubcopy}
            </p>
          </div>
        ) : null}

        {!compact ? (
          <ul className="relative mt-8 grid gap-3.5 lg:mt-9">
            {visibleBullets.map(({ icon: Icon, text }) => (
              <li key={text} className={authUi.benefitRow}>
                <span className={authUi.benefitIcon}>
                  <Icon className="size-[1.125rem]" aria-hidden />
                </span>
                <span className={authUi.type.benefit}>{text}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
