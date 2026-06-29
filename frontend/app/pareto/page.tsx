import { ExplanationBlock } from "@/components/ExplanationBlock";
import { PageShell } from "@/components/PageShell";
import { ParetoList } from "@/components/ParetoList";
import { SiteHeader } from "@/components/SiteHeader";

export default function ParetoPage() {
  return (
    <PageShell>
      <SiteHeader backLink />

      <h1 className="mt-10 font-[family-name:var(--font-serif)] text-4xl italic text-[#1f231a] sm:text-5xl">
        Pareto Analysis
      </h1>

      <div className="mt-8">
        <ExplanationBlock title="How it works">
          <p>
            The Pareto principle, or the 80/20 rule, observes that roughly
            80% of your results tend to come from about 20% of your effort.
            A handful of tasks or topics usually matter far more than the
            rest.
          </p>
          <p>
            List what you&apos;re considering below, then move the few items
            that will actually move the needle into{" "}
            <strong>Vital few</strong>. Everything else stays in{" "}
            <strong>Trivial many</strong> — still worth doing eventually, but
            not where your focus should go first.
          </p>
        </ExplanationBlock>
      </div>

      <div className="mt-8">
        <ParetoList />
      </div>
    </PageShell>
  );
}
