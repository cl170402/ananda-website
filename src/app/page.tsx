"use client";

import { useState, useMemo } from "react";
import dealsData from "../../data/deals.json";
import DealCard from "@/components/DealCard";
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
    <main className="min-h-screen py-10 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Ecosystem</h1>
        <p className="text-sm text-stone-400 mt-1">{deals.length} companies tracked</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search companies, tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <div className="flex gap-2">
          {(["all", "health", "techbio"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? f === "health"
                    ? "bg-emerald-600 text-white"
                    : f === "techbio"
                    ? "bg-violet-600 text-white"
                    : "bg-stone-800 text-white"
                  : "bg-white border border-stone-200 text-stone-500 hover:border-stone-300"
              }`}
            >
              {f === "all" ? "All" : f === "health" ? "Health" : "TechBio"}
              <span className="ml-1.5 opacity-60 text-xs">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-20 text-stone-400 text-sm">No results</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </main>
  );
}
