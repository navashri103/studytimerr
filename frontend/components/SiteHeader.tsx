import Link from "next/link";
import { FullscreenToggle } from "@/components/FullscreenToggle";
import { LogoutButton } from "@/components/LogoutButton";

export function SiteHeader({
  backLink = false,
  large = false,
}: {
  backLink?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href="/"
        className={`font-[family-name:var(--font-serif)] text-[#1f231a] ${
          large ? "text-4xl sm:text-5xl" : "text-2xl"
        }`}
      >
        StudyTimer
      </Link>
      <div className="flex items-center gap-4">
        {backLink && (
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-widest text-black/45 transition-colors hover:text-black"
          >
            Back to dashboard
          </Link>
        )}
        <FullscreenToggle />
        <Link
          href="/workspace"
          className="text-xs font-medium uppercase tracking-widest text-black/45 transition-colors hover:text-black"
        >
          Workspace
        </Link>
        <Link
          href="/report"
          className="text-xs font-medium uppercase tracking-widest text-black/45 transition-colors hover:text-black"
        >
          Report
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
