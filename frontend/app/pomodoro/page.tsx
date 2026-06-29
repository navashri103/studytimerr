import { ExplanationBlock } from "@/components/ExplanationBlock";
import { PageShell } from "@/components/PageShell";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { SiteHeader } from "@/components/SiteHeader";

export default function PomodoroPage() {
  return (
    <PageShell>
      <SiteHeader backLink />

      <h1 className="mt-10 font-[family-name:var(--font-serif)] text-4xl italic text-[#1f231a] sm:text-5xl">
        Pomodoro Technique
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <ExplanationBlock title="How it works">
          <p>
            Work in focused 25-minute sprints called &quot;pomodoros,&quot;
            each followed by a 5-minute break. The short breaks keep your
            mind fresh, while the fixed length keeps you honest about
            distractions.
          </p>
          <p>
            After every 4 pomodoros, take a longer 15-minute break before
            starting the cycle again. The dots below the timer track your
            progress through the current set of 4.
          </p>
          <p>
            The timer auto-advances between phases, so you can focus on the
            work and let it tell you when to rest.
          </p>
        </ExplanationBlock>

        <div className="flex justify-center rounded-2xl border border-black/5 bg-white p-10">
          <PomodoroTimer />
        </div>
      </div>
    </PageShell>
  );
}
