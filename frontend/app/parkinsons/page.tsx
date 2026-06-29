import { PageShell } from "@/components/PageShell";
import { SiteHeader } from "@/components/SiteHeader";

export default function ParkinsonsPage() {
  return (
    <PageShell>
      <SiteHeader backLink />
      <p className="mt-16 font-[family-name:var(--font-serif)] text-3xl italic text-[#1f231a]">
        Parkinson&apos;s Law — coming in Phase 5
      </p>
    </PageShell>
  );
}
