import { PageShell } from "@/components/PageShell";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkspaceBoard } from "@/components/WorkspaceBoard";

export default function WorkspacePage() {
  return (
    <PageShell>
      <SiteHeader backLink />

      <h1 className="mt-10 font-[family-name:var(--font-serif)] text-4xl italic text-[#1f231a] sm:text-5xl">
        Workspace
      </h1>
      <p className="mt-2 max-w-lg text-sm text-black/55">
        Bring techniques together on one screen instead of switching
        between pages. Add a widget, use it, remove it when you&apos;re
        done.
      </p>

      <div className="mt-8">
        <WorkspaceBoard />
      </div>
    </PageShell>
  );
}
