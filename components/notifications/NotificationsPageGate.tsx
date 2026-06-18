"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { NotificationsPageContent } from "@/components/notifications/NotificationsPageContent";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export function NotificationsPageGate() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/notifications");
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-[#94A3B8]">Redirecting to login…</p>
        <Link href="/login?next=/notifications" className="text-sm text-[#3B82F6] hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  return <NotificationsPageContent />;
}
