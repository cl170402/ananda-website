export interface Deal {
  id: string;
  name: string;
  sector: "health" | "techbio" | "synbio" | "ag";
  description: string;
  team: string;
  stage: string | null;
  tags: string[];
  date_added: string;
  source_file: string;
  // enrichment
  website?: string | null;
  latest_news?: string | null;
  news_date?: string | null;
  enriched_at?: string;
}
