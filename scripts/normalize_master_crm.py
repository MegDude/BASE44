from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "outputs" / "master-crm"

SOURCE_DIRS = [
    Path("/Users/megdude/Downloads/OUTREACH CRM"),
    Path("/Users/megdude/Downloads/PERKS CRM "),
    Path("/Users/megdude/Downloads/x MASTER MAP INVENTORY "),
]

SEGMENTS = ["Property", "Venue", "Hotel", "Sponsor/Brand", "Civic", "Government", "Research", "DANA"]

CANONICAL_COLUMNS = [
    "crm_id",
    "segment",
    "entity_name",
    "contact_name",
    "role_title",
    "email",
    "phone",
    "website",
    "address",
    "city",
    "state",
    "zip",
    "status",
    "notes",
    "dedupe_key",
    "source_files",
    "source_sheets",
    "source_row_count",
]

FIELD_ALIASES = {
    "entity_name": [
        "company",
        "company name",
        "account",
        "account name",
        "organization",
        "organisation",
        "business",
        "business name",
        "entity",
        "entity name",
        "name",
        "property",
        "property name",
        "building",
        "building name",
        "venue",
        "hotel",
        "brand",
        "partner",
        "place",
        "place name",
    ],
    "contact_name": ["contact", "contact name", "full name", "person", "lead", "owner", "manager", "primary contact"],
    "role_title": ["title", "role", "position", "job title"],
    "email": ["email", "email address", "e-mail"],
    "phone": ["phone", "phone number", "mobile", "cell", "telephone"],
    "website": ["website", "url", "site", "web"],
    "address": ["address", "street", "street address", "location"],
    "city": ["city"],
    "state": ["state"],
    "zip": ["zip", "zipcode", "postal code"],
    "status": ["status", "stage", "pipeline stage", "outreach status"],
    "notes": ["notes", "note", "description", "summary", "comments"],
}


def clean_header(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def clean_value(value: object) -> str:
    if pd.isna(value):
        return ""
    text = str(value).strip()
    if text.lower() in {"nan", "none", "null"}:
        return ""
    return re.sub(r"\s+", " ", text)


def normalize_email(value: str) -> str:
    match = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", value or "", flags=re.I)
    return match.group(0).lower() if match else ""


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D+", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if len(digits) >= 7 else ""


def slug(value: str, fallback: str = "record") -> str:
    text = re.sub(r"[^a-z0-9]+", "-", (value or "").lower()).strip("-")
    return text or fallback


def file_hash(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def list_sources() -> list[Path]:
    sources: list[Path] = []
    for source_dir in SOURCE_DIRS:
        if not source_dir.exists():
            continue
        for path in source_dir.rglob("*"):
            if path.name.startswith("~$"):
                continue
            if path.suffix.lower() in {".csv", ".xlsx", ".xls"}:
                sources.append(path)
    return sorted(sources)


def read_source(path: Path) -> list[tuple[str, pd.DataFrame, str]]:
    suffix = path.suffix.lower()
    try:
        if suffix == ".csv":
            df = pd.read_csv(path, dtype=str, keep_default_na=False)
            return [("CSV", df, "ok")]
        sheets = pd.read_excel(path, sheet_name=None, dtype=str, keep_default_na=False)
        return [(str(name), frame, "ok") for name, frame in sheets.items()]
    except Exception as exc:  # Keep the audit complete even when one workbook is malformed.
        return [("READ_ERROR", pd.DataFrame(), str(exc))]


def pick_field(row: dict[str, str], header_map: dict[str, str], target: str) -> str:
    for alias in FIELD_ALIASES[target]:
        column = header_map.get(clean_header(alias))
        if column:
            value = clean_value(row.get(column, ""))
            if value:
                return value
    return ""


def infer_segment(row_text: str, source_name: str) -> str:
    text = f"{row_text} {source_name}".lower()
    if any(term in text for term in ["dana", "neighborhood association"]):
        return "DANA"
    if any(term in text for term in ["government", "city of", "county", "mayor", "council", "department", "public works"]):
        return "Government"
    if any(term in text for term in ["civic", "daa", "downtown austin alliance", "waterloo", "public realm", "parks", "art walk"]):
        return "Civic"
    if any(term in text for term in ["research", "source log", "audit", "registry seed", "google maps", "places contact research"]):
        return "Research"
    if any(term in text for term in ["hotel", "marriott", "fairmont", "proper", "thompson", "westin", "hyatt"]):
        return "Hotel"
    if any(term in text for term in ["property", "building", "apartment", "condo", "residential", "tower", "residences"]):
        return "Property"
    if any(term in text for term in ["sponsor", "brand", "retail", "luxury", "lululemon", "kendra", "amex", "capital one"]):
        return "Sponsor/Brand"
    return "Venue"


def normalize_rows() -> tuple[list[dict[str, str]], dict[str, object]]:
    sources = list_sources()
    hash_to_paths: dict[str, list[str]] = defaultdict(list)
    raw_rows: list[dict[str, str]] = []
    source_audit = []

    for path in sources:
        digest = file_hash(path)
        hash_to_paths[digest].append(str(path))
        sheets = read_source(path)
        for sheet_name, df, status in sheets:
            source_audit.append(
                {
                    "file": str(path),
                    "sheet": sheet_name,
                    "status": status,
                    "rows": int(len(df.index)) if status == "ok" else 0,
                    "columns": list(map(str, df.columns))[:80] if status == "ok" else [],
                }
            )
            if status != "ok" or df.empty:
                continue
            df = df.dropna(how="all")
            header_map = {clean_header(column): str(column) for column in df.columns}
            for idx, record in df.iterrows():
                row = {str(key): clean_value(value) for key, value in record.to_dict().items()}
                if not any(row.values()):
                    continue
                row_text = " ".join(row.values())
                normalized = {
                    "entity_name": pick_field(row, header_map, "entity_name"),
                    "contact_name": pick_field(row, header_map, "contact_name"),
                    "role_title": pick_field(row, header_map, "role_title"),
                    "email": normalize_email(pick_field(row, header_map, "email") or row_text),
                    "phone": normalize_phone(pick_field(row, header_map, "phone") or row_text),
                    "website": pick_field(row, header_map, "website"),
                    "address": pick_field(row, header_map, "address"),
                    "city": pick_field(row, header_map, "city"),
                    "state": pick_field(row, header_map, "state"),
                    "zip": pick_field(row, header_map, "zip"),
                    "status": pick_field(row, header_map, "status"),
                    "notes": pick_field(row, header_map, "notes"),
                    "source_file": str(path),
                    "source_sheet": sheet_name,
                    "source_row": str(idx + 2),
                    "raw_text": row_text[:1600],
                }
                if not normalized["entity_name"] and normalized["email"]:
                    normalized["entity_name"] = normalized["email"].split("@", 1)[-1]
                if not normalized["entity_name"] and not normalized["contact_name"]:
                    continue
                normalized["segment"] = infer_segment(row_text, path.name)
                raw_rows.append(normalized)

    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in raw_rows:
        if row["email"]:
            key = f"email:{row['email']}"
        elif row["phone"]:
            key = f"phone:{row['phone']}"
        else:
            key = f"entity:{slug(row['entity_name'])}|contact:{slug(row['contact_name'])}|address:{slug(row['address'])}"
        row["dedupe_key"] = key
        grouped[key].append(row)

    master_rows = []
    for index, (key, rows) in enumerate(sorted(grouped.items()), start=1):
        merged: dict[str, str] = {"crm_id": f"CRM-{index:05d}", "dedupe_key": key}
        segment_counts = Counter(row["segment"] for row in rows if row["segment"])
        merged["segment"] = segment_counts.most_common(1)[0][0] if segment_counts else "Venue"
        for column in CANONICAL_COLUMNS:
            if column in {"crm_id", "dedupe_key", "segment", "source_files", "source_sheets", "source_row_count"}:
                continue
            values = [row.get(column, "") for row in rows if row.get(column, "")]
            merged[column] = values[0] if values else ""
        if not merged.get("notes"):
            note_bits = [row.get("raw_text", "") for row in rows if row.get("raw_text", "")]
            merged["notes"] = note_bits[0][:500] if note_bits else ""
        merged["source_files"] = " | ".join(sorted({row["source_file"] for row in rows}))
        merged["source_sheets"] = " | ".join(sorted({row["source_sheet"] for row in rows}))
        merged["source_row_count"] = str(len(rows))
        master_rows.append(merged)

    duplicate_workbooks = [
        {"sha256": digest, "files": paths}
        for digest, paths in hash_to_paths.items()
        if len(paths) > 1
    ]
    duplicate_records = [
        {"dedupe_key": key, "records_merged": len(rows), "sources": sorted({row["source_file"] for row in rows})}
        for key, rows in grouped.items()
        if len(rows) > 1
    ]

    audit = {
        "source_file_count": len(sources),
        "source_sheet_count": len(source_audit),
        "raw_record_count": len(raw_rows),
        "master_record_count": len(master_rows),
        "deduped_record_count": len(raw_rows) - len(master_rows),
        "duplicate_workbook_count": len(duplicate_workbooks),
        "segment_counts": dict(Counter(row["segment"] for row in master_rows)),
        "duplicate_workbooks": duplicate_workbooks,
        "duplicate_records": duplicate_records[:500],
        "sources": source_audit,
    }
    return master_rows, audit


def write_outputs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows, audit = normalize_rows()
    master = pd.DataFrame(rows, columns=CANONICAL_COLUMNS)
    master.to_csv(OUT_DIR / "downtown_perks_master_crm.csv", index=False)

    frost_rows = master[
        master.apply(lambda item: "frost" in " ".join(map(str, item.values)).lower(), axis=1)
    ].copy()
    if frost_rows.empty:
        frost_rows = pd.DataFrame(
            [
                {
                    "crm_id": "FROST-ACTIVATION-CASE",
                    "segment": "Property",
                    "entity_name": "Frost Tower",
                    "contact_name": "",
                    "role_title": "Flagship activation target",
                    "email": "",
                    "phone": "",
                    "website": "",
                    "address": "401 Congress Ave, Austin, TX 78701",
                    "city": "Austin",
                    "state": "TX",
                    "zip": "78701",
                    "status": "Flagship activation case",
                    "notes": "Package Frost Tower as a downtown workplace activation: civic route proximity, nearby dining, office worker discovery, resident perks, event routing, and measurable check-ins/saves/directions.",
                    "dedupe_key": "entity:frost-tower",
                    "source_files": "Generated from product activation brief",
                    "source_sheets": "Frost Tower Activation",
                    "source_row_count": "1",
                }
            ],
            columns=CANONICAL_COLUMNS,
        )
    frost_rows.to_csv(OUT_DIR / "frost_tower_flagship_activation_case.csv", index=False)

    with (OUT_DIR / "master_crm_audit.json").open("w", encoding="utf-8") as handle:
        json.dump(audit, handle, indent=2)

    with (OUT_DIR / "frost_tower_flagship_activation_case.md").open("w", encoding="utf-8") as handle:
        handle.write(
            "# Frost Tower Flagship Activation Case\n\n"
            "Segment: Property\n\n"
            "Position Frost Tower as a downtown workplace and district activation anchor, not a generic office pin.\n\n"
            "Core activation modules:\n"
            "- DAA Art Walk and Downtown Stories route proximity\n"
            "- Nearby lunch, coffee, happy hour, civic, and event discovery\n"
            "- Office-worker check-ins, saves, directions, and campaign handoffs\n"
            "- Sponsor/brand packages tied to Congress Avenue foot traffic\n"
            "- Partner workspace reporting for route opens, stop engagement, and nearby conversions\n"
        )


if __name__ == "__main__":
    write_outputs()
