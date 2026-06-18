"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { GaragePageContent } from "@/components/garage/GaragePageContent";
import { useAuth } from "@/components/providers/AuthProvider";

export function GaragePageGate() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/garage");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#64748B]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-sm text-[#94A3B8]">Redirecting…</p>
        <Link href="/login?next=/garage" className="text-sm text-[#3B82F6] hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  return <GaragePageContent />;
}
