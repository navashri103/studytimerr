"use client";

import { useAuth } from "@/lib/auth";

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={logout}
      className="text-xs font-medium uppercase tracking-widest text-black/45 transition-colors hover:text-black"
    >
      Log out
    </button>
  );
}
