"use client";

import { useState, useEffect } from "react";
import { Deal } from "@/types/deal";
import { getConviction, setConviction, getStatus, setStatus } from "@/lib/storage";

/* ── Status config ─────────────────────────────────────────────── */
const STATUSES = ["Sourced", "Meeting", "In DD", "Watch", "Passed"] as const;
type Status = (typeof STATUSES)[number] | "";

const STATUS_STYLE: Record<string, string> = {
  Sourced: "bg-zinc-700/40 text-zinc-400 border-zinc-600/50",
  Meeting: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "In DD": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Watch: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Passed: "bg-red-500/10 text-red-400/60 border-red-500/20",
};

/* ── Sector config ─────────────────────────────────────────────── */
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

/* ── Component ─────────────────────────────────────────────────── */
export default function DealCard({ deal }: { deal: Deal }) {
  const [conviction, setConvictionState] = useState(0);
  const [status, setStatusState] = useState<Status>("");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConvictionState(getConviction(deal.id));
    setStatusState(getStatus(deal.id) as Status);
  }, [deal.id]);

  const handleConviction = (n: number) => {
    // clicking the same dot clears it
    const next = conviction === n ? 0 : n;
    setConvictionState(next);
    setConviction(deal.id, next);
  };

  const handleStatus = (s: Status) => {
    setStatusState(s);
    setStatus(deal.id, s);
    setShowStatusMenu(false);
  };

  return (
    <div className="group relative bg-white/[0.03] hover:bg-white/[0.05] rounded-xl border border-white/8 hover:border-white/12 p-5 flex flex-col gap-3 transition-all duration-200">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${SECTOR_DOT[deal.sector] ?? "bg-zinc-400"}`} />
          <h2 className="text-sm font-semibold text-white leading-tight truncate">{deal.name}</h2>
        </div>
        <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
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
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-medium mb-1.5">Team</p>
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">{deal.team}</p>
        </div>
      )}

      {/* Tags */}
      {deal.tags && deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {deal.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-zinc-600 bg-white/4 border border-white/6 rounded-full px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Investor controls ──────────────────────────────────── */}
      {mounted && (
        <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-3 mt-auto">

          {/* Conviction dots */}
          <div className="flex items-center gap-1" title="Your conviction (private)">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => handleConviction(n)}
                className="group/dot p-0.5 rounded transition-transform hover:scale-110"
                aria-label={`Conviction ${n}`}
              >
                <span
                  className={`block w-2 h-2 rounded-full border transition-colors ${
                    n <= conviction
                      ? "bg-amber-400 border-amber-400"
                      : "bg-transparent border-zinc-700 group-hover/dot:border-zinc-500"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Status badge */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu((v) => !v)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                status
                  ? STATUS_STYLE[status]
                  : "border-white/8 text-zinc-600 hover:text-zinc-400 hover:border-white/15"
              }`}
            >
              {status || "+ status"}
            </button>

            {showStatusMenu && (
              <div className="absolute bottom-full right-0 mb-1 z-10 bg-zinc-900 border border-white/10 rounded-lg p-1 shadow-xl min-w-[110px]">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    className={`block w-full text-left text-xs px-3 py-1.5 rounded-md transition-colors ${
                      status === s
                        ? "text-white bg-white/8"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                {status && (
                  <button
                    onClick={() => handleStatus("")}
                    className="block w-full text-left text-[10px] px-3 py-1.5 text-zinc-700 hover:text-zinc-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-zinc-700">{deal.date_added}</p>
    </div>
  );
}
