import { PageShell } from "@/components/PageShell";
import { SiteHeader } from "@/components/SiteHeader";

export default function PomodoroPage() {
  return (
    <PageShell>
      <SiteHeader backLink />
      <p className="mt-16 font-[family-name:var(--font-serif)] text-3xl italic text-[#1f231a]">
        Pomodoro Technique — coming in Phase 2
      </p>
    </PageShell>
  );
}
