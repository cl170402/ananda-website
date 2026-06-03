"use client";

import { Deal } from "@/types/deal";

interface Props {
  deals: Deal[];
}

export default function InsightsBar({ deals }: Props) {
  const health  = deals.filter((d) => d.sector === "health").length;
  const techbio = deals.filter((d) => d.sector === "techbio").length;
  const synbio  = deals.filter((d) => d.sector === "synbio").length;
  const ag      = deals.filter((d) => d.sector === "ag").length;
  const total = deals.length;
  const healthPct  = total ? Math.round((health  / total) * 100) : 25;
  const tecPct     = total ? Math.round((techbio / total) * 100) : 25;
  const synPct     = total ? Math.round((synbio  / total) * 100) : 25;

  const stageCount = deals.reduce((acc, d) => {
    if (d.stage) acc[d.stage] = (acc[d.stage] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tagFreq = deals
    .flatMap((d) => d.tags ?? [])
    .reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] ?? 0) + 1 }), {} as Record<string, number>);

  const topTags = Object.entries(tagFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const latestDate = deals
    .map((d) => d.date_added)
    .sort()
    .at(-1);

  return (
    <div className="mb-8 rounded-xl border border-white/6 bg-white/[0.025] overflow-hidden">
      {/* Sector bar */}
      <div className="h-1 flex">
        <div className="bg-emerald-500/60" style={{ width: `${healthPct}%` }} />
        <div className="bg-violet-500/60" style={{ width: `${tecPct}%` }} />
        <div className="bg-cyan-500/60"   style={{ width: `${synPct}%` }} />
        <div className="bg-lime-500/60 flex-1" />
      </div>

      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Sector split */}
        <div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.18em] mb-2">Sectors</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 items-baseline">
            <span className="text-sm font-semibold text-emerald-400">{health}</span>
            <span className="text-xs text-zinc-600">Health</span>
            <span className="text-sm font-semibold text-violet-400">{techbio}</span>
            <span className="text-xs text-zinc-600">TechBio</span>
            <span className="text-sm font-semibold text-cyan-400">{synbio}</span>
            <span className="text-xs text-zinc-600">SynBio</span>
            <span className="text-sm font-semibold text-lime-400">{ag}</span>
            <span className="text-xs text-zinc-600">Ag</span>
          </div>
        </div>

        {/* Stage breakdown */}
        <div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.18em] mb-2">Stage mix</p>
          <div className="flex flex-col gap-0.5">
            {Object.keys(stageCount).length === 0 ? (
              <span className="text-xs text-zinc-700">No stage data</span>
            ) : (
              Object.entries(stageCount)
                .sort(([, a], [, b]) => b - a)
                .map(([stage, count]) => (
                  <div key={stage} className="flex items-center gap-2">
                    <div
                      className="h-1 rounded-full bg-amber-500/40"
                      style={{ width: `${Math.round((count / total) * 80)}px` }}
                    />
                    <span className="text-[10px] text-zinc-500">
                      {stage} <span className="text-zinc-700">·{count}</span>
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recurring themes */}
        <div className="col-span-2">
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.18em] mb-2">Recurring themes</p>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full border border-white/6 bg-white/4 text-zinc-400"
              >
                {tag}
                {count > 1 && (
                  <span className="ml-1 text-zinc-600">×{count}</span>
                )}
              </span>
            ))}
          </div>
          {latestDate && (
            <p className="text-[9px] text-zinc-700 mt-2">Last updated {latestDate}</p>
          )}
        </div>
      </div>
    </div>
  );
}
