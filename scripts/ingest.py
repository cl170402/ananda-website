#!/usr/bin/env python3
"""
Ingest pitch decks from iCloud into data/deals.json.
Run from the website root: python scripts/ingest.py
Requires: pip install pdfplumber anthropic python-dotenv
"""

import json
import hashlib
import os
import sys
from pathlib import Path
from datetime import datetime

try:
    import pdfplumber
    import anthropic
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Run: pip install pdfplumber anthropic python-dotenv")
    sys.exit(1)

ICLOUD_BASE = Path.home() / "Library/Mobile Documents/com~apple~CloudDocs/VC/ananda"
SOURCES = [
    (ICLOUD_BASE / "health/decks health", "health"),
    (ICLOUD_BASE / "techbio/decks bio", "techbio"),
]

DATA_FILE = Path(__file__).parent.parent / "data/deals.json"

PROMPT = """You are analyzing a pitch deck from a {sector} startup.

Extract the following and return ONLY a valid JSON object:
{{
  "name": "company name",
  "description": "2-3 sentence plain-English description of what the company does and its market",
  "team": "1-2 sentence summary of the founding team and relevant backgrounds",
  "stage": "funding stage if clearly mentioned (Pre-seed, Seed, Series A, etc.) or null",
  "tags": ["up to 3 short sector/tech tags, e.g. 'genomics', 'wearables', 'oncology'"]
}}

Pitch deck text:
{text}

Return only the JSON object."""


def extract_text(pdf_path: Path) -> str:
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages[:10]:
            t = page.extract_text()
            if t:
                pages.append(t)
    return "\n\n".join(pages)


def parse_deal(client: anthropic.Anthropic, text: str, sector: str) -> dict:
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=[{"role": "user", "content": PROMPT.format(sector=sector, text=text[:6000])}],
    )
    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = "\n".join(raw.split("\n")[1:])
        raw = raw.rsplit("```", 1)[0].strip()
    return json.loads(raw)


def file_id(path: Path) -> str:
    return hashlib.md5(path.name.encode()).hexdigest()[:8]


def load_deals() -> list:
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text())
    return []


def save_deals(deals: list) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(deals, indent=2, ensure_ascii=False) + "\n")


def main() -> None:
    # Load .env — try website root, then automation repo
    for env_path in [
        Path(__file__).parent.parent / ".env",
        Path.home() / "ananda automation/.env",
    ]:
        if env_path.exists():
            load_dotenv(env_path, override=True)
            break

    client = anthropic.Anthropic()
    deals = load_deals()
    existing = {d["source_file"] for d in deals}

    new_count = 0
    for folder, sector in SOURCES:
        if not folder.exists():
            print(f"[skip] folder not found: {folder}")
            continue
        for pdf in sorted(folder.glob("*.pdf")):
            if pdf.name in existing:
                print(f"  [exists] {pdf.name}")
                continue
            print(f"  [reading] {pdf.name}")
            try:
                text = extract_text(pdf)
                if not text.strip():
                    print(f"    [warn] no text extracted — is this a scanned PDF?")
                    continue
                info = parse_deal(client, text, sector)
                deal = {
                    "id": file_id(pdf),
                    "sector": sector,
                    "date_added": datetime.now().strftime("%Y-%m-%d"),
                    "source_file": pdf.name,
                    **info,
                }
                deals.append(deal)
                new_count += 1
                print(f"    [added] {info.get('name', pdf.stem)}")
            except json.JSONDecodeError as e:
                print(f"    [error] JSON parse failed: {e}")
            except Exception as e:
                print(f"    [error] {e}")

    save_deals(deals)
    print(f"\nDone. {new_count} new deal(s) added. Total: {len(deals)}")


if __name__ == "__main__":
    main()
