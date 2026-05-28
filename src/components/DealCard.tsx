"use client";

import { Deal } from "@/types/deal";

const SECTOR_STYLES: Record<string, string> = {
  health: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  techbio: "bg-violet-50 text-violet-700 border border-violet-200",
};

const SECTOR_LABEL: Record<string, string> = {
  health: "Health",
  techbio: "TechBio",
};

const STAGE_STYLE = "bg-amber-50 text-amber-700 border border-amber-200";

interface Props {
  deal: Deal;
}

export default function DealCard({ deal }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-stone-900 leading-tight">{deal.name}</h2>
        <div className="flex gap-1.5 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SECTOR_STYLES[deal.sector] ?? "bg-stone-100 text-stone-600"}`}>
            {SECTOR_LABEL[deal.sector] ?? deal.sector}
          </span>
          {deal.stage && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_STYLE}`}>
              {deal.stage}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-stone-600 leading-relaxed">{deal.description}</p>

      {deal.team && (
        <div className="pt-2 border-t border-stone-100">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-1">Team</p>
          <p className="text-sm text-stone-500 leading-relaxed">{deal.team}</p>
        </div>
      )}

      {deal.tags && deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {deal.tags.map((tag) => (
            <span key={tag} className="text-xs text-stone-400 bg-stone-100 rounded-full px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-stone-300 mt-auto">{deal.date_added}</p>
    </div>
  );
}
