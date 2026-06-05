#!/usr/bin/env python3
"""
Download Wikimedia Commons building/hotel candidates and generate Downtown Perks hero assets.

Outputs:
  public/buildings/*.webp
  public/hotels/*.webp
  public/assets-originals/{buildings,hotels}/*
  public/assets_metadata.csv
  public/assets_manifest.json

This intentionally saves the original Commons file for review before the WebP crop is accepted.
"""

from __future__ import annotations

import argparse
import csv
import html
import io
import json
import mimetypes
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

try:
    from PIL import Image, ImageOps
except ModuleNotFoundError:
    print("Missing dependency: Pillow. Install it with: python3 -m pip install -r scripts/requirements-assets.txt", file=sys.stderr)
    raise


API = "https://commons.wikimedia.org/w/api.php"
TARGET_W = 1600
TARGET_H = 1200
OUT_ROOT = pathlib.Path("public")
BUILD_DIR = OUT_ROOT / "buildings"
HOTEL_DIR = OUT_ROOT / "hotels"
ORIGINAL_ROOT = OUT_ROOT / "assets-originals"
META_OUT = OUT_ROOT / "assets_metadata.csv"
MANIFEST_OUT = OUT_ROOT / "assets_manifest.json"

BUILDINGS = [
    "The Austonian",
    "The Independent",
    "Seaholm Residences",
    "360 Condominiums",
    "The Shore",
    "The Quincy",
    "70 Rainey",
    "44 East",
    "Natiivo",
    "Waterline",
    "Block 185",
    "The Catherine",
    "3 Waller",
    "404 Rio Grande",
    "700 River",
    "Five Fifty Five",
    "The Monarch",
    "Spring Condominiums",
    "Milago",
    "The Bowie",
]

HOTELS = [
    "Hotel Van Zandt",
    "Austin Proper",
    "Four Seasons",
    "Hyatt Centric",
    "Stephen F Austin",
    "Fairmont Austin",
    "JW Marriott",
    "Thompson Austin",
    "Cambria Austin",
    "Westin Austin Downtown",
]

BUILDING_FILENAMES = {
    "360-condominiums": "360.webp",
    "seaholm-residences": "seaholm.webp",
    "spring-condominiums": "spring.webp",
    "the-independent": "independent.webp",
    "the-austonian": "austonian.webp",
    "the-shore": "shore.webp",
    "the-quincy": "quincy.webp",
    "the-catherine": "catherine.webp",
    "the-monarch": "monarch.webp",
    "the-bowie": "bowie.webp",
}

HOTEL_FILENAMES = {
    "hotel-van-zandt": "hotel-van-zandt.webp",
    "austin-proper": "austin-proper.webp",
    "four-seasons": "four-seasons.webp",
    "hyatt-centric": "hyatt-centric.webp",
    "stephen-f-austin": "stephen-f-austin.webp",
    "fairmont-austin": "fairmont-austin.webp",
    "jw-marriott": "jw-marriott.webp",
    "thompson-austin": "thompson-austin.webp",
    "cambria-austin": "cambria-austin.webp",
    "westin-austin-downtown": "westin-austin-downtown.webp",
}

CSV_FIELDS = [
    "kind",
    "name",
    "search_query",
    "commons_file",
    "commons_page",
    "source_url",
    "original_path",
    "out_webp",
    "mime",
    "width",
    "height",
    "license",
    "license_url",
    "artist",
    "credit",
    "status",
    "note",
]

ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp"}


def safe_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def codex_filename(name: str, kind: str) -> str:
    slug = safe_slug(name)
    if kind == "building":
        return BUILDING_FILENAMES.get(slug, f"{slug}.webp")
    return HOTEL_FILENAMES.get(slug, f"{slug}.webp")


def strip_html(value: object) -> str:
    if value is None:
        return ""
    text = str(value)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()


def request_json(url: str, params: dict[str, object], user_agent: str) -> dict:
    query = urllib.parse.urlencode(params)
    request = urllib.request.Request(f"{url}?{query}", headers={"User-Agent": user_agent})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def download_bytes(url: str, user_agent: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": user_agent})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def commons_top_file(title_query: str, user_agent: str) -> tuple[str | None, dict | None]:
    params = {
        "action": "query",
        "format": "json",
        "prop": "imageinfo",
        "iiprop": "url|mime|size|extmetadata",
        "generator": "search",
        "gsrnamespace": 6,
        "gsrlimit": 8,
        "gsrsearch": title_query,
    }
    data = request_json(API, params, user_agent)
    pages = data.get("query", {}).get("pages")
    if not pages:
        return None, None
    ordered_pages = sorted(pages.values(), key=lambda page: page.get("index", 9999))
    for page in ordered_pages:
        title = page.get("title")
        iinfo = (page.get("imageinfo") or [{}])[0]
        mime = str(iinfo.get("mime") or "").lower()
        if title and iinfo.get("url") and mime in ALLOWED_IMAGE_MIMES:
            return title, iinfo
    return None, None


def original_extension(mime: str, url: str) -> str:
    extension = mimetypes.guess_extension(mime or "") or pathlib.Path(urllib.parse.urlparse(url).path).suffix
    if extension == ".jpe":
        return ".jpg"
    return extension or ".img"


def save_original(data: bytes, out_path: pathlib.Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(data)


def convert_to_webp(data: bytes, out_path: pathlib.Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(io.BytesIO(data)) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        fitted = ImageOps.fit(image, (TARGET_W, TARGET_H), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        if fitted.mode != "RGB":
            fitted = fitted.convert("RGB")
        fitted.save(out_path, format="WEBP", quality=85, method=6)


def pick_search_query(name: str, kind: str) -> str:
    place_type = "hotel" if kind == "hotel" else "building"
    return f"{name} Austin {place_type}"


def search_queries(name: str, kind: str) -> list[str]:
    place_type = "hotel" if kind == "hotel" else "building"
    city_bias = "Austin Texas"
    compact = name.replace("The ", "")
    return [
        f"{name} Austin",
        f"{compact} Austin",
        f"{name} {city_bias}",
        f"{name} {place_type}",
        f"{name} exterior",
        f"{compact} tower Austin",
    ]


def metadata_from_imageinfo(iinfo: dict) -> dict[str, str]:
    meta = iinfo.get("extmetadata") or {}

    def meta_value(key: str) -> str:
        entry = meta.get(key) or {}
        return strip_html(entry.get("value"))

    return {
        "license": meta_value("LicenseShortName"),
        "license_url": meta_value("LicenseUrl"),
        "artist": meta_value("Artist"),
        "credit": meta_value("Credit"),
    }


def commons_page_url(title: str | None) -> str:
    if not title:
        return ""
    return f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"


def process_asset(name: str, kind: str, user_agent: str, overwrite: bool, delay: float) -> dict[str, object]:
    out_dir = BUILD_DIR if kind == "building" else HOTEL_DIR
    original_dir = ORIGINAL_ROOT / ("buildings" if kind == "building" else "hotels")
    filename = codex_filename(name, kind)
    out_path = out_dir / filename
    search_query = pick_search_query(name, kind)

    row: dict[str, object] = {
        "kind": kind,
        "name": name,
        "search_query": search_query,
        "commons_file": "",
        "commons_page": "",
        "source_url": "",
        "original_path": "",
        "out_webp": str(out_path),
        "mime": "",
        "width": "",
        "height": "",
        "license": "",
        "license_url": "",
        "artist": "",
        "credit": "",
        "status": "",
        "note": "",
    }

    if out_path.exists() and not overwrite:
        row["status"] = "skip"
        row["note"] = "WebP already exists; pass --overwrite to replace"
        print(f"[SKIP] {kind}: {name} -> {out_path}")
        return row

    title = None
    iinfo = None
    tried_queries = []
    try:
        for query in search_queries(name, kind):
            tried_queries.append(query)
            title, iinfo = commons_top_file(query, user_agent)
            if title and iinfo and iinfo.get("url"):
                search_query = query
                row["search_query"] = search_query
                break
            if delay:
                time.sleep(delay)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        row["status"] = "error"
        row["note"] = f"Commons search failed: {exc}"
        print(f"[ERROR] {kind}: {name} -> {exc}")
        return row

    if not title or not iinfo or not iinfo.get("url"):
        row["status"] = "miss"
        row["note"] = f"No Commons file found; tried: {' | '.join(tried_queries)}"
        print(f"[MISS] {kind}: {name}")
        return row

    url = str(iinfo.get("url"))
    mime = str(iinfo.get("mime") or "")
    original_path = original_dir / f"{pathlib.Path(filename).stem}{original_extension(mime, url)}"
    row.update(
        {
            "commons_file": title,
            "commons_page": commons_page_url(title),
            "source_url": url,
            "original_path": str(original_path),
            "mime": mime,
            "width": iinfo.get("width") or "",
            "height": iinfo.get("height") or "",
            **metadata_from_imageinfo(iinfo),
        }
    )

    try:
        raw = download_bytes(url, user_agent)
        save_original(raw, original_path)
        convert_to_webp(raw, out_path)
        row["status"] = "ok"
        print(f"[OK] {kind}: {name} -> {out_path}")
    except Exception as exc:  # noqa: BLE001 - keep batch downloads moving and record the failure.
        row["status"] = "error"
        row["note"] = str(exc)
        print(f"[ERROR] {kind}: {name} -> {exc}")

    return row


def write_csv(rows: list[dict[str, object]]) -> None:
    META_OUT.parent.mkdir(parents=True, exist_ok=True)
    with META_OUT.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def write_manifest(rows: list[dict[str, object]]) -> None:
    manifest = {
        "generatedBy": "scripts/download_wikimedia_assets.py",
        "target": {"width": TARGET_W, "height": TARGET_H, "format": "webp", "quality": 85},
        "assets": [
            {
                "kind": row["kind"],
                "name": row["name"],
                "path": row["out_webp"],
                "originalPath": row["original_path"],
                "commonsFile": row["commons_file"],
                "commonsPage": row["commons_page"],
                "sourceUrl": row["source_url"],
                "license": row["license"],
                "licenseUrl": row["license_url"],
                "artist": row["artist"],
                "status": row["status"],
                "note": row["note"],
            }
            for row in rows
        ],
    }
    MANIFEST_OUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def selected_assets(kind: str) -> list[tuple[str, str]]:
    if kind == "buildings":
        return [(name, "building") for name in BUILDINGS]
    if kind == "hotels":
        return [(name, "hotel") for name in HOTELS]
    return [(name, "building") for name in BUILDINGS] + [(name, "hotel") for name in HOTELS]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download Wikimedia Commons candidates for Downtown Perks map hero assets.")
    parser.add_argument("--kind", choices=["all", "buildings", "hotels"], default="all", help="Asset group to download.")
    parser.add_argument("--overwrite", action="store_true", help="Replace existing generated WebP files.")
    parser.add_argument("--limit", type=int, default=0, help="Limit how many assets to process, useful for testing.")
    parser.add_argument("--delay", type=float, default=0.25, help="Delay between Commons searches in seconds.")
    parser.add_argument(
        "--user-agent",
        default="DowntownPerks-ImageCollector/1.0 (partners@downtownperks.com)",
        help="User-Agent sent to Wikimedia Commons.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    HOTEL_DIR.mkdir(parents=True, exist_ok=True)
    (ORIGINAL_ROOT / "buildings").mkdir(parents=True, exist_ok=True)
    (ORIGINAL_ROOT / "hotels").mkdir(parents=True, exist_ok=True)

    assets = selected_assets(args.kind)
    if args.limit > 0:
        assets = assets[: args.limit]

    rows = [process_asset(name, kind, args.user_agent, args.overwrite, args.delay) for name, kind in assets]
    write_csv(rows)
    write_manifest(rows)

    ok_count = sum(1 for row in rows if row["status"] == "ok")
    miss_count = sum(1 for row in rows if row["status"] == "miss")
    error_count = sum(1 for row in rows if row["status"] == "error")
    skip_count = sum(1 for row in rows if row["status"] == "skip")
    print(f"\nMetadata written: {META_OUT}")
    print(f"Manifest written: {MANIFEST_OUT}")
    print(f"Done: {ok_count} ok, {skip_count} skipped, {miss_count} missed, {error_count} errors")
    return 1 if error_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
