#!/usr/bin/env python3
"""
Enrich deals.json with each company's website + latest news.
Run from the website root: python scripts/enrich.py
Pass --force to re-enrich already-enriched deals.
"""

import json
import re
import sys
import time
import argparse
from pathlib import Path
from datetime import datetime

try:
    import anthropic
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Run: pip install anthropic python-dotenv")
    sys.exit(1)

DATA_FILE = Path(__file__).parent.parent / "data/deals.json"

SEARCH_PROMPT = """\
Search for "{name}", a {sector} startup. Find:
1. Their official website URL
2. Any recent news from the last 18 months (funding rounds, product launches, \
partnerships, hires, press coverage)

Then return ONLY a valid JSON object — no markdown, no explanation:
{{
  "website": "https://... or null if not found",
  "latest_news": "1-2 sentence factual summary of the most recent notable update, or null",
  "news_date": "approximate date like 'May 2026' or 'Q1 2026', or null"
}}"""


def extract_json(text: str) -> dict:
    """Pull the first JSON object out of a string."""
    # Strip markdown fences
    text = re.sub(r"```[a-z]*\n?", "", text).strip()
    # Find first { ... }
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        raise ValueError(f"No JSON found in: {text[:200]}")
    return json.loads(m.group())


def enrich_deal(client: anthropic.Anthropic, name: str, sector: str) -> dict:
    """Use Claude web search to find website + latest news for a company."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=800,
        tools=[{
            "type": "web_search_20250305",
            "name": "web_search",
            "max_uses": 3,
        }],
        messages=[{
            "role": "user",
            "content": SEARCH_PROMPT.format(name=name, sector=sector),
        }],
    )

    # Collect all text blocks — the last one is Claude's final synthesis
    text_blocks = [b.text for b in response.content if hasattr(b, "text")]
    if not text_blocks:
        return {"website": None, "latest_news": None, "news_date": None}

    return extract_json(text_blocks[-1])


def load_deals() -> list:
    return json.loads(DATA_FILE.read_text()) if DATA_FILE.exists() else []


def save_deals(deals: list) -> None:
    DATA_FILE.write_text(json.dumps(deals, indent=2, ensure_ascii=False) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true",
                        help="Re-enrich all deals, even already-enriched ones")
    args = parser.parse_args()

    for env_path in [
        Path(__file__).parent.parent / ".env",
        Path.home() / "ananda automation/.env",
    ]:
        if env_path.exists():
            load_dotenv(env_path, override=True)
            break

    client = anthropic.Anthropic()
    deals = load_deals()
    updated = 0

    for deal in deals:
        already = deal.get("enriched_at") and deal.get("website") is not None
        if already and not args.force:
            print(f"  [skip]      {deal['name']}")
            continue

        print(f"  [searching] {deal['name']}…", end=" ", flush=True)
        try:
            info = enrich_deal(client, deal["name"], deal["sector"])
            deal["website"]     = info.get("website")
            deal["latest_news"] = info.get("latest_news")
            deal["news_date"]   = info.get("news_date")
            deal["enriched_at"] = datetime.now().strftime("%Y-%m-%d")
            updated += 1
            site = deal["website"] or "no website"
            date = deal["news_date"] or "no news"
            print(f"✓  {site}  ·  {date}")
        except json.JSONDecodeError as e:
            print(f"✗  JSON error: {e}")
        except Exception as e:
            print(f"✗  {e}")

        time.sleep(1)   # be polite to the API

    save_deals(deals)
    print(f"\nDone. {updated} deal(s) enriched. Total: {len(deals)}")


if __name__ == "__main__":
    main()
