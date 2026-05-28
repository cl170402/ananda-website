"use client";

import { Deal } from "@/types/deal";

const SECTOR_STYLES: Record<string, string> = {
  health: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
  techbio: "bg-violet-500/10 text-violet-400 border border-violet-500/25",
};

const SECTOR_DOT: Record<string, string> = {
  health: "bg-emerald-400",
  techbio: "bg-violet-400",
};

const SECTOR_LABEL: Record<string, string> = {
  health: "Health",
  techbio: "TechBio",
};

interface Props {
  deal: Deal;
}

export default function DealCard({ deal }: Props) {
  return (
    <div className="group relative bg-white/[0.03] hover:bg-white/[0.055] rounded-xl border border-white/8 hover:border-white/12 p-5 flex flex-col gap-4 transition-all duration-200">

      {/* Top row: name + badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${SECTOR_DOT[deal.sector] ?? "bg-zinc-400"}`} />
          <h2 className="text-sm font-semibold text-white leading-tight truncate">{deal.name}</h2>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full tracking-wide ${SECTOR_STYLES[deal.sector] ?? "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
            {SECTOR_LABEL[deal.sector] ?? deal.sector}
          </span>
          {deal.stage && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 tracking-wide">
              {deal.stage}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-4">{deal.description}</p>

      {/* Team */}
      {deal.team && (
        <div className="border-t border-white/5 pt-3">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium mb-1.5">Team</p>
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">{deal.team}</p>
        </div>
      )}

      {/* Tags */}
      {deal.tags && deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {deal.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-zinc-600 bg-white/4 border border-white/6 rounded-full px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Date */}
      <p className="text-[10px] text-zinc-700">{deal.date_added}</p>
    </div>
  );
}
