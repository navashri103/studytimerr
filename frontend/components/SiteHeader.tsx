"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { FullscreenToggle } from "@/components/FullscreenToggle";
import { LogoutButton } from "@/components/LogoutButton";

export function SiteHeader({
  backLink = false,
  large = false,
}: {
  backLink?: boolean;
  large?: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    backLink ? { href: "/", label: "Back to dashboard" } : null,
    pathname !== "/workspace" ? { href: "/workspace", label: "Workspace" } : null,
    pathname !== "/report" ? { href: "/report", label: "Report" } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  const linkClass =
    "text-xs font-medium uppercase tracking-widest text-black/45 transition-colors hover:text-black";

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className={`font-[family-name:var(--font-serif)] text-[#1f231a] ${
            large ? "text-4xl sm:text-5xl" : "text-2xl"
          }`}
        >
          StudyTimer
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 sm:flex">
          <FullscreenToggle />
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
          <LogoutButton />
        </div>

        {/* Mobile: fullscreen icon + hamburger */}
        <div className="flex items-center gap-3 sm:hidden">
          <FullscreenToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="text-black/60 transition-colors hover:text-black"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-3 shadow-xl sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-black/60 transition-colors hover:bg-black/5"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-1 border-t border-black/5 pt-2 px-3">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
