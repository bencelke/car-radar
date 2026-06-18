"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/providers/AuthProvider";

/** Completes navigation after social sign-in redirect on any page. */
export function PostAuthRedirect() {
  const router = useRouter();
  const { user, loading, postAuthRedirect, clearPostAuthRedirect } = useAuth();

  useEffect(() => {
    if (!loading && user && postAuthRedirect) {
      router.replace(postAuthRedirect);
      router.refresh();
      clearPostAuthRedirect();
    }
  }, [loading, user, postAuthRedirect, router, clearPostAuthRedirect]);

  return null;
}
