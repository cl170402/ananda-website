#!/usr/bin/env python3
"""
Ingest pitch decks from iCloud into data/deals.json.
Run from the website root: python scripts/ingest.py
Requires: pip install pdfplumber anthropic python-dotenv
"""

import base64
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
    (ICLOUD_BASE / "synbio/decks synbio", "synbio"),
    (ICLOUD_BASE / "ag : bio/decks ag", "ag"),
]

DATA_FILE = Path(__file__).parent.parent / "data/deals.json"

# Max file size to send as raw PDF to Claude (25 MB)
MAX_PDF_BYTES = 25 * 1024 * 1024

PROMPT_TEXT = """You are analyzing a pitch deck from a {sector} startup.

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

PROMPT_VISION = """You are analyzing a pitch deck (scanned PDF) from a {sector} startup.
Look through all the slides carefully and extract:

Return ONLY a valid JSON object:
{{
  "name": "company name",
  "description": "2-3 sentence plain-English description of what the company does and its market",
  "team": "1-2 sentence summary of the founding team and relevant backgrounds",
  "stage": "funding stage if clearly mentioned (Pre-seed, Seed, Series A, etc.) or null",
  "tags": ["up to 3 short sector/tech tags, e.g. 'genomics', 'wearables', 'oncology'"]
}}

Return only the JSON object, no markdown."""


def extract_text(pdf_path: Path) -> str:
    """Extract text from a text-based PDF."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages[:10]:
            t = page.extract_text()
            if t:
                pages.append(t)
    return "\n\n".join(pages)


def parse_deal_text(client: anthropic.Anthropic, text: str, sector: str) -> dict:
    """Parse deal info from extracted text."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": PROMPT_TEXT.format(sector=sector, text=text[:6000])
        }],
    )
    return _parse_json(response.content[0].text.strip())


def parse_deal_vision(client: anthropic.Anthropic, pdf_path: Path, sector: str) -> dict:
    """Parse deal info from a scanned PDF using Claude's vision."""
    pdf_bytes = pdf_path.read_bytes()
    size_mb = len(pdf_bytes) / (1024 * 1024)

    if len(pdf_bytes) > MAX_PDF_BYTES:
        raise ValueError(f"PDF too large for vision ({size_mb:.1f} MB > 25 MB limit). Skipping.")

    print(f"    [vision] sending {size_mb:.1f} MB PDF to Claude…")
    b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": b64,
                    },
                },
                {
                    "type": "text",
                    "text": PROMPT_VISION.format(sector=sector),
                },
            ],
        }],
    )
    return _parse_json(response.content[0].text.strip())


def _parse_json(raw: str) -> dict:
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
    # Load .env
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

                if text.strip():
                    info = parse_deal_text(client, text, sector)
                else:
                    print(f"    [no text] trying vision OCR…")
                    info = parse_deal_vision(client, pdf, sector)

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
            except ValueError as e:
                print(f"    [skip] {e}")
            except json.JSONDecodeError as e:
                print(f"    [error] JSON parse failed: {e}")
            except Exception as e:
                print(f"    [error] {e}")

    save_deals(deals)
    print(f"\nDone. {new_count} new deal(s) added. Total: {len(deals)}")


if __name__ == "__main__":
    main()
