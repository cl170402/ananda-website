export interface Deal {
  id: string;
  name: string;
  sector: "health" | "techbio";
  description: string;
  team: string;
  stage: string | null;
  tags: string[];
  date_added: string;
  source_file: string;
}
