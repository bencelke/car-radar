"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";
import { ROUTES } from "@/lib/config/routes";

export function EventListBackLink() {
  const { t } = useLocale();

  return (
    <Link
      href={ROUTES.events}
      className="mb-5 inline-flex min-h-11 items-center text-sm font-medium text-[#3B82F6] transition hover:text-[#60A5FA]"
    >
      ← {t.community.backToEvents}
    </Link>
  );
}
