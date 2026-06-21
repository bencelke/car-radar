"use client";

import { cn } from "@/lib/utils";

type AdminSectionCardProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
};

export function AdminSectionCard({
  title,
  subtitle,
  children,
  className,
}: AdminSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-white/[0.06] bg-[#0B1118]/80 p-4 sm:p-5",
        className
      )}
    >
      <div className="mb-4">
        <h2 className="font-heading text-base font-semibold text-[#F8FAFC]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function AdminPageHeader({
  title,
  subtitle,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm text-[#64748B]">{subtitle}</p>
        ) : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
