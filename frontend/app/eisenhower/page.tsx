import { PageShell } from "@/components/PageShell";
import { SiteHeader } from "@/components/SiteHeader";

export default function EisenhowerPage() {
  return (
    <PageShell>
      <SiteHeader backLink />
      <p className="mt-16 font-[family-name:var(--font-serif)] text-3xl italic text-[#1f231a]">
        Eisenhower Matrix — coming in Phase 3
      </p>
    </PageShell>
  );
}
