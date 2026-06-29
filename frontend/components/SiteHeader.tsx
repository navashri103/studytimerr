import Link from "next/link";

export function SiteHeader({ backLink = false }: { backLink?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href="/"
        className="font-[family-name:var(--font-serif)] text-2xl text-[#1f231a]"
      >
        StudyTimer
      </Link>
      {backLink && (
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-widest text-black/45 transition-colors hover:text-black"
        >
          Back to dashboard
        </Link>
      )}
    </div>
  );
}
