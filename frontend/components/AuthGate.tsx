"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (!session && !isAuthRoute) router.replace("/login");
    if (session && isAuthRoute) router.replace("/");
  }, [loading, session, isAuthRoute, router]);

  if (loading) return null;
  if (!session && !isAuthRoute) return null;
  if (session && isAuthRoute) return null;

  return <>{children}</>;
}
