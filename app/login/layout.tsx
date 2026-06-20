import Link from "next/link";

import { ShiftItLogo } from "@/components/brand/ShiftItLogo";
import { LanguageDropdown } from "@/components/language/LanguageDropdown";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-white/[0.06] bg-[#05070A]/88 px-4 backdrop-blur-xl sm:h-[3.75rem] sm:px-6">
        <Link
          href="/"
          className="group shrink-0 transition duration-200 hover:brightness-110"
          aria-label="Home"
        >
          <ShiftItLogo
            variant="nav"
            className="transition-[filter,opacity] duration-200 group-hover:opacity-95 group-hover:drop-shadow-[0_0_14px_rgba(239,68,68,0.22)]"
          />
        </Link>
        <LanguageDropdown className="shrink-0" />
      </header>
      <div className="pt-14 sm:pt-[3.75rem]">{children}</div>
    </>
  );
}
