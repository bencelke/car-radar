import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginPageContent } from "@/components/auth/LoginPageContent";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: `Login · ${brand.metadata.siteName}`,
  description: brand.description,
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-[#64748B]">
          …
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
