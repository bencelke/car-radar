"use client";

import Link from "next/link";
import { Home } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";

type AdminAccessDeniedProps = {
  onRefresh?: () => void;
};

export function AdminAccessDenied({ onRefresh }: AdminAccessDeniedProps) {
  const { t } = useLocale();

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-red-500/25 bg-red-500/10 p-8 text-center">
        <h1 className="font-heading text-xl font-bold text-[#F8FAFC]">
          {t.profile.accessDenied}
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8]">{t.profile.accessDeniedHint}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href={brand.nav.main[0]?.href ?? "/"} />}
            className="border border-white/[0.08] bg-[#151B24] text-[#CBD5E1]"
          >
            <Home className="mr-2 size-4" />
            {t.admin.backToHome}
          </Button>
          {onRefresh ? (
            <Button
              type="button"
              variant="outline"
              className="border-white/[0.08] text-[#CBD5E1]"
              onClick={onRefresh}
            >
              {t.auth.refreshAccess}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
