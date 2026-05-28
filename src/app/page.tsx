"use client";

import { useState, useMemo } from "react";
import dealsData from "../../data/deals.json";
import DealCard from "@/components/DealCard";
import InsightsBar from "@/components/InsightsBar";
import { Deal } from "@/types/deal";

const deals = dealsData as Deal[];

type Filter = "all" | "health" | "techbio";

export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    return deals
      .filter((d) => filter === "all" || d.sector === filter)
      .filter((d) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          (d.tags ?? []).some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.date_added.localeCompare(a.date_added));
  }, [filter, query]);

  const counts = useMemo(
    () => ({
      all: deals.length,
      health: deals.filter((d) => d.sector === "health").length,
      techbio: deals.filter((d) => d.sector === "techbio").length,
    }),
    []
  );

  return (
    <main className="min-h-screen py-12 px-4 sm:px-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-10 border-b border-white/5 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-600 mb-2">Deal Flow</p>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Ecosystem</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-600">{deals.length} companies tracked</p>
            <p className="text-[10px] text-zinc-700 mt-0.5">
              {counts.health} Health · {counts.techbio} TechBio
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <InsightsBar deals={deals} />

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search companies, tags, technology…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-white/8 bg-white/4 pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "health", "techbio"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                filter === f
                  ? f === "health"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : f === "techbio"
                    ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                    : "bg-white/10 text-white border border-white/15"
                  : "bg-transparent border border-white/8 text-zinc-500 hover:border-white/15 hover:text-zinc-300"
              }`}
            >
              {f === "all" ? "All" : f === "health" ? "Health" : "TechBio"}
              <span className="ml-1.5 opacity-50">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="text-center py-24 text-zinc-600 text-sm">No results</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 pt-6 border-t border-white/5 text-center">
        <p className="text-[10px] text-zinc-700">Health · TechBio · {new Date().getFullYear()}</p>
      </div>
    </main>
  );
}
