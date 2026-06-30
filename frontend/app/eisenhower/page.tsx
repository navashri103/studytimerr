import { EisenhowerBoard } from "@/components/EisenhowerBoard";
import { ExplanationBlock } from "@/components/ExplanationBlock";
import { PageShell } from "@/components/PageShell";
import { SiteHeader } from "@/components/SiteHeader";

export default function EisenhowerPage() {
  return (
    <PageShell>
      <SiteHeader backLink />

      <h1 className="mt-10 font-[family-name:var(--font-serif)] text-4xl italic text-[#1f231a] sm:text-5xl">
        Eisenhower Matrix
      </h1>

      <div className="mt-8">
        <ExplanationBlock title="How it works">
          <p>
            Sort tasks by two questions: is it urgent, and is it important?
            That gives four quadrants, each with its own action:{" "}
            <strong>Do</strong> it now, <strong>Decide</strong> when
            you&apos;ll do it, <strong>Delegate</strong> it to someone else,
            or <strong>Delete</strong> it from your list entirely.
          </p>
          <p>
            Add your own tasks to each quadrant below, click any task to
            edit it, and remove it when you&apos;re done. Your tasks are
            saved automatically and will be here when you come back.
          </p>
        </ExplanationBlock>
      </div>

      <div className="mt-8">
        <EisenhowerBoard />
      </div>
    </PageShell>
  );
}
