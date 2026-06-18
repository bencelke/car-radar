"use client";

type ProfilePageBackgroundProps = {
  children: React.ReactNode;
};

export function ProfilePageBackground({ children }: ProfilePageBackgroundProps) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-[#05070A]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-0 size-[420px] rounded-full bg-[#A855F7]/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 top-1/3 size-[380px] rounded-full bg-[#3B82F6]/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 size-[300px] rounded-full bg-[#EF4444]/8 blur-[90px]"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
