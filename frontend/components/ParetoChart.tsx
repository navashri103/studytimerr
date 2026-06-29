import type { ParetoSplit } from "@/lib/pareto";

export function ParetoChart({ split }: { split: ParetoSplit }) {
  const { total, vitalCount, trivialCount, vitalPercent } = split;

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-black/5 bg-white p-5">
      <div
        className="relative size-24 shrink-0 rounded-full"
        style={{
          background:
            total === 0
              ? "#ece9dc"
              : `conic-gradient(#b9872a 0% ${vitalPercent}%, #d4d4d8 ${vitalPercent}% 100%)`,
        }}
      >
        <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white">
          <span className="font-[family-name:var(--font-serif)] text-xl text-[#1f231a]">
            {vitalPercent}%
          </span>
          <span className="text-[10px] uppercase tracking-wide text-black/40">
            vital
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#b9872a]" />
          <span className="text-black/70">Vital few</span>
          <span className="text-black/40">{vitalCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#d4d4d8]" />
          <span className="text-black/70">Trivial many</span>
          <span className="text-black/40">{trivialCount}</span>
        </div>
        <p className="mt-1 text-xs text-black/40">{total} items total</p>
      </div>
    </div>
  );
}
