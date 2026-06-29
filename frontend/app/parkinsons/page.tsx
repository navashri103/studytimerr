import { ExplanationBlock } from "@/components/ExplanationBlock";
import { PageShell } from "@/components/PageShell";
import { ParkinsonsTimer } from "@/components/ParkinsonsTimer";
import { SiteHeader } from "@/components/SiteHeader";

export default function ParkinsonsPage() {
  return (
    <PageShell>
      <SiteHeader backLink />

      <h1 className="mt-10 font-[family-name:var(--font-serif)] text-4xl italic text-[#1f231a] sm:text-5xl">
        Parkinson&apos;s Law
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <ExplanationBlock title="How it works">
          <p>
            Parkinson&apos;s Law says work expands to fill the time
            available for its completion. Give yourself a week for a task
            and it&apos;ll somehow take a week — give yourself an hour, and
            it can take an hour instead.
          </p>
          <p>
            Pick a task, set a deadline shorter than what feels comfortable,
            and start the countdown. The pressure of a tighter deadline
            tends to sharpen focus rather than just adding stress.
          </p>
        </ExplanationBlock>

        <div className="flex justify-center rounded-2xl border border-black/5 bg-white p-10">
          <ParkinsonsTimer />
        </div>
      </div>
    </PageShell>
  );
}
