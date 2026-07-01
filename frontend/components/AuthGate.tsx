"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";
import { useAuth } from "@/lib/auth";

function AuthGateInner({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isAuthRoute = pathname === "/login";
  // Overlay mode is a standalone mini timer — no login required.
  const isOverlay = searchParams.get("overlay") === "true";

  useEffect(() => {
    if (loading || isOverlay) return;
    if (!session && !isAuthRoute) router.replace("/login");
    if (session && isAuthRoute) router.replace("/");
  }, [loading, session, isAuthRoute, isOverlay, router]);

  if (isOverlay) return <>{children}</>;
  if (loading) return null;
  if (!session && !isAuthRoute) return null;
  if (session && isAuthRoute) return null;

  return (
    <>
      {children}
      {session && <SpotifyPlayer />}
    </>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AuthGateInner>{children}</AuthGateInner>
    </Suspense>
  );
}
