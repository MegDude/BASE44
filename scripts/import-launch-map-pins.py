#!/usr/bin/env python3
"""Import Downtown Perks launch-map workbook data into generated app data."""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET


REPO_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_OUTPUT = REPO_ROOT / "src/data/imports/launchMapPins.generated.json"
ADMIN_OUTPUT = REPO_ROOT / "src/data/imports/launchMapPins.admin.generated.json"

DEFAULT_APPROVAL_STATUS = "needs_review"
APPROVED_STATUSES = {"approved", "published"}
PUBLIC_CATEGORIES = {
    "Food & Drink",
    "Coffee",
    "Events",
    "Experiences",
    "Hotels",
    "Nightlife",
    "Retail",
    "Wellness",
    "Civic",
    "Parking & Mobility",
    "Residential Buildings",
    "Featured / Partner",
}
PUBLIC_VISIBILITY_VALUES = {"public", "yes", "true", "1"}
INTERNAL_ONLY_FIELDS = [
    "source_file",
    "source_sheet",
    "source_id",
    "launch_note",
    "internal_source_note",
    "partner_positioning_copy",
    "activation_idea",
    "content_status",
    "launch_readiness",
    "launch_priority",
    "status",
]
PUBLIC_PIN_FIELDS = [
    "pinId",
    "id",
    "name",
    "publicDisplayTitle",
    "publicCategory",
    "category",
    "pinType",
    "publicShortCardCopy",
    "publicFullListingCopy",
    "residentValueProp",
    "visitorGuestValueProp",
    "districtOrNeighborhood",
    "address",
    "latitude",
    "longitude",
    "website",
    "recommendedTags",
    "searchKeywords",
    "campaignName",
    "campaignType",
    "campaignCopy",
    "collection",
    "mapCardCta",
    "qrPromptCopy",
    "proofMetrics",
    "sourceCategory",
    "rawCategory",
    "kind",
    "hasExactMarker",
    "offer",
]

INTELLIGENCE_FIELDS = [
    "intelligence_record_id",
    "pin_id",
    "partner_brand",
    "backend_display_status",
    "backend_partner_headline",
    "backend_partner_summary",
    "backend_partner_fit",
    "backend_resident_value",
    "backend_guest_value",
    "backend_perk_offer_copy",
    "backend_campaign_copy",
    "backend_activation_plan",
    "backend_partner_pitch",
    "backend_outreach_message",
    "backend_contact_route",
    "backend_target_role",
    "backend_required_assets",
    "backend_success_kpi",
    "backend_risk",
    "backend_mitigation",
    "backend_next_step",
    "backend_source_priority",
    "backend_confidence",
    "backend_source_files",
    "source_campaign_id",
    "unique_offer_key",
    "partner_campaign",
    "specificity_status",
    "inclusion_action",
]


NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "officeRel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", help="Enriched launch map workbook")
    parser.add_argument("--campaign-matrix", default="", help="Perk Campaign Matrix CSV")
    parser.add_argument("--assessment", default="", help="Crosscheck assessment XLSX")
    parser.add_argument("--dana-crm", default="", help="DANA stakeholder CRM XLSX")
    return parser.parse_args()


def zip_text(zf: zipfile.ZipFile, name: str) -> str:
    key = name.lstrip("/")
    if key.startswith("xl/xl/"):
        key = key[3:]
    if key not in zf.namelist() and not key.startswith("xl/"):
        key = f"xl/{key}"
    try:
        return zf.read(key).decode("utf-8")
    except KeyError as exc:
        raise FileNotFoundError(f"Missing XLSX part: {name}") from exc


def text_from_si(si: ET.Element) -> str:
    runs = si.findall("main:r", NS)
    if runs:
        return "".join((run.findtext("main:t", default="", namespaces=NS) or "") for run in runs)
    return si.findtext("main:t", default="", namespaces=NS) or ""


def column_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha())
    index = 0
    for letter in letters:
        index = index * 26 + ord(letter.upper()) - 64
    return max(0, index - 1)


def normalize_target(target: str) -> str:
    clean = target.lstrip("/")
    return clean[3:] if clean.startswith("xl/") else clean


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    value = cell.findtext("main:v", default="", namespaces=NS)
    if cell.get("t") == "s" and value:
        try:
            return shared_strings[int(value)]
        except (ValueError, IndexError):
            return ""
    if cell.get("t") == "inlineStr":
        return "".join(cell.itertext()).strip()
    return (value or "").strip()


def parse_workbook(file_path: str | Path) -> dict[str, list[dict[str, str]]]:
    with zipfile.ZipFile(file_path) as zf:
        workbook_root = ET.fromstring(zip_text(zf, "xl/workbook.xml"))
        rels_root = ET.fromstring(zip_text(zf, "xl/_rels/workbook.xml.rels"))
        shared_strings: list[str] = []

        if "xl/sharedStrings.xml" in zf.namelist():
            shared_root = ET.fromstring(zip_text(zf, "xl/sharedStrings.xml"))
            shared_strings = [text_from_si(si) for si in shared_root.findall("main:si", NS)]

        rel_map = {
            rel.get("Id", ""): rel.get("Target", "")
            for rel in rels_root.findall("rel:Relationship", NS)
        }
        sheets: dict[str, list[dict[str, str]]] = {}
        for sheet in workbook_root.findall("main:sheets/main:sheet", NS):
            name = sheet.get("name") or ""
            rel_id = sheet.get(f"{{{NS['officeRel']}}}id") or ""
            target = normalize_target(rel_map.get(rel_id, ""))
            if not name or not target:
                continue
            sheet_root = ET.fromstring(zip_text(zf, f"xl/{target}"))
            rows: list[list[str]] = []
            for row in sheet_root.findall("main:sheetData/main:row", NS):
                values: list[str] = []
                for cell in row.findall("main:c", NS):
                    idx = column_index(cell.get("r", ""))
                    while len(values) <= idx:
                        values.append("")
                    values[idx] = cell_value(cell, shared_strings)
                rows.append(values)

            headers = [str(value or "").strip() for value in (rows[0] if rows else [])]
            sheet_rows: list[dict[str, str]] = []
            for row in rows[1:]:
                if not any(str(value or "").strip() for value in row):
                    continue
                sheet_rows.append({
                    header: str(row[index] if index < len(row) else "").strip()
                    for index, header in enumerate(headers)
                    if header
                })
            sheets[name] = sheet_rows
        return sheets


def split_list(value: str | None) -> list[str]:
    if not value:
        return []
    items = [item.strip() for item in re.split(r"[;,|]", value) if item.strip()]
    return list(dict.fromkeys(items))


def slugify(value: str | None) -> str:
    text = (value or "").strip().lower().replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def nullable_number(value: str | None) -> float | None:
    if not value:
        return None
    try:
        numeric = float(str(value).replace(",", ""))
    except ValueError:
        return None
    return numeric


def category_for(row: dict[str, str]) -> str:
    source = row.get("public_category") or row.get("source_category") or ""
    text = f"{source} {row.get('kind', '')}".lower()
    if re.search(r"residential|building|property|apartment|condo|dana launch building", text):
        return "Residential Buildings"
    if source in PUBLIC_CATEGORIES:
        return source
    if re.search(r"coffee|cafe|espresso", text):
        return "Coffee"
    if re.search(r"hotel|hospitality|guest", text):
        return "Hotels"
    if re.search(r"event|rsvp|calendar", text):
        return "Events"
    if re.search(r"bar|nightlife|cocktail|drink|happy", text):
        return "Nightlife"
    if re.search(r"retail|shop|brand|store|fashion", text):
        return "Retail"
    if re.search(r"wellness|fitness|yoga|spa|salon", text):
        return "Wellness"
    if re.search(r"civic|public|park|art|museum|library|dana|daa|waterloo", text):
        return "Civic"
    if re.search(r"parking|mobility|transit|garage|bike|ev", text):
        return "Parking & Mobility"
    if re.search(r"partner|featured|campaign|sponsor", text):
        return "Featured / Partner"
    return "Food & Drink"


def existing_filter_for_category(category: str) -> str:
    return {
        "Food & Drink": "Dining",
        "Coffee": "Coffee",
        "Events": "Events",
        "Experiences": "Events",
        "Hotels": "Hotels",
        "Nightlife": "Nightlife",
        "Retail": "Retail",
        "Wellness": "Wellness",
        "Civic": "Civic",
        "Parking & Mobility": "Parking",
        "Residential Buildings": "Properties",
        "Featured / Partner": "Perks",
    }.get(category, "All")


def pin_type_for(row: dict[str, str], public_category: str) -> str:
    if public_category == "Residential Buildings":
        return "building_entry_pin"
    if public_category == "Civic":
        return "civic_story_or_landmark_pin"
    if public_category in {"Events", "Experiences"}:
        return "event_or_collection_pin"
    if public_category == "Hotels":
        return "hotel_guest_pin"
    if public_category == "Parking & Mobility":
        return "mobility_pin"
    if row.get("pin_type"):
        return row["pin_type"]
    return "public_listing_pin"


def infer_collection(row: dict[str, str], public_category: str) -> str:
    if row.get("collection"):
        return slugify(row["collection"])
    campaign = slugify(row.get("campaign") or row.get("campaign_name") or "")
    if "downtown-stories-walk" in campaign:
        return "downtown-stories-walk"
    if "hotel-guest-guide" in campaign:
        return "hotel-guest-arrival-route"
    if "morning-coffee" in campaign:
        return "coffee-before-work"
    if "after-work" in campaign or "night-out" in campaign:
        return "happy-hour"
    if public_category == "Civic":
        return "downtown-stories-walk"
    return ""


def approval_status(row: dict[str, str]) -> str:
    status = (row.get("content_status") or row.get("backend_display_status") or "").lower()
    if "published" in status:
        return "published"
    if "approved" in status:
        return "approved"
    if "archive" in status:
        return "archived"
    return DEFAULT_APPROVAL_STATUS


def is_publicly_eligible(row: dict[str, str], public_category: str, approval: str) -> bool:
    visibility = (row.get("public_visibility") or "").strip().lower()
    tier = (row.get("launch_tier") or "").lower()
    status = (row.get("status") or "").lower()
    if "archived" in status:
        return False
    if visibility not in PUBLIC_VISIBILITY_VALUES:
        return False
    if "tier 3" in tier and approval not in APPROVED_STATUSES:
        return False
    return public_category in PUBLIC_CATEGORIES


def to_public_pin(row: dict[str, str], index: int) -> dict[str, Any]:
    public_category = category_for(row)
    approval = approval_status(row)
    pin_id = row.get("pin_id") or f"launch-pin-{slugify(row.get('listing_or_pin_name') or row.get('public_display_title') or str(index))}"
    lat = nullable_number(row.get("latitude"))
    lng = nullable_number(row.get("longitude"))
    approved_offer = approval in APPROVED_STATUSES
    tags = split_list(row.get("recommended_tags")) or [
        value for value in [
            public_category,
            row.get("district_or_neighborhood"),
            row.get("source_category"),
            row.get("campaign_name") or row.get("partner_campaign"),
        ] if value
    ]
    keywords = split_list(row.get("search_keywords")) or [
        value for value in [
            row.get("listing_or_pin_name"),
            row.get("public_display_title"),
            public_category,
            row.get("district_or_neighborhood"),
            row.get("partner_brand"),
            row.get("campaign_name") or row.get("partner_campaign"),
        ] if value
    ]
    public_pin = {
        "pinId": pin_id,
        "id": f"launch-{pin_id}",
        "name": row.get("listing_or_pin_name") or row.get("public_display_title") or pin_id,
        "publicDisplayTitle": row.get("public_display_title") or row.get("listing_or_pin_name") or pin_id,
        "publicCategory": public_category,
        "category": existing_filter_for_category(public_category),
        "pinType": pin_type_for(row, public_category),
        "publicShortCardCopy": row.get("public_short_card_copy") or "",
        "publicFullListingCopy": row.get("public_full_listing_copy") or "",
        "residentValueProp": row.get("resident_value_prop") or "",
        "visitorGuestValueProp": row.get("visitor_guest_value_prop") or "",
        "districtOrNeighborhood": row.get("district_or_neighborhood") or "",
        "address": row.get("address") or "",
        "latitude": lat,
        "longitude": lng,
        "website": row.get("website") or "",
        "recommendedTags": tags,
        "searchKeywords": keywords,
        "campaignName": row.get("campaign_name") or row.get("campaign") or "",
        "campaignType": row.get("campaign_type") or "",
        "campaignCopy": row.get("campaign_copy") or "",
        "collection": infer_collection(row, public_category),
        "mapCardCta": row.get("map_card_cta") or row.get("redemption_or_cta") or "",
        "qrPromptCopy": row.get("qr_prompt_copy") or "",
        "proofMetrics": split_list(row.get("proof_metrics")),
        "sourceCategory": row.get("source_category") or "",
        "rawCategory": row.get("public_category") or row.get("source_category") or "",
        "kind": row.get("kind") or "",
        "hasExactMarker": lat is not None and lng is not None,
        "offer": {
            "offerTitle": row.get("offer_title") or "",
            "offerDescription": row.get("offer_description") or "",
            "offerType": row.get("offer_type") or "",
            "recommendedPerkOrOffer": row.get("recommended_perk_or_offer") or "",
            "redemptionOrCta": row.get("redemption_or_cta") or "",
        } if approved_offer else None,
    }
    return {field: public_pin[field] for field in PUBLIC_PIN_FIELDS}


def to_admin_pin(row: dict[str, str], index: int) -> dict[str, Any]:
    pin_id = row.get("pin_id") or f"launch-pin-{slugify(row.get('listing_or_pin_name') or row.get('public_display_title') or str(index))}"
    return {
        **row,
        "normalizedPinId": pin_id,
        "contentApprovalStatus": approval_status(row),
        "internalOnlyFields": {field: row.get(field, "") for field in INTERNAL_ONLY_FIELDS},
    }


def backend_intelligence_records(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    return [
        {field: row.get(field, "") for field in INTELLIGENCE_FIELDS}
        for row in rows
        if row.get("pin_id") or row.get("intelligence_record_id")
    ]


def unique_offer_records(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    return [
        {
            "uniqueOfferKey": row.get("unique_offer_key", ""),
            "campaignId": row.get("campaign_id", ""),
            "partnerBrand": row.get("partner_brand", ""),
            "partnerCampaign": row.get("partner_campaign", ""),
            "entityType": row.get("entity_type", ""),
            "district": row.get("district", ""),
            "audience": row.get("audience", ""),
            "launchPinId": row.get("launch_pin_id", ""),
            "launchPinName": row.get("launch_pin_name", ""),
            "publicCategory": row.get("public_category", ""),
            "launchTier": row.get("launch_tier", ""),
            "specificOfferTitle": row.get("specific_offer_title", ""),
            "specificOfferMechanics": row.get("specific_offer_mechanics", ""),
            "specificBackendCopy": row.get("specific_backend_copy", ""),
            "cta": row.get("cta", ""),
            "bestTiming": row.get("best_timing", ""),
            "requiredAssets": row.get("required_assets", ""),
            "successKpi": row.get("success_kpi", ""),
            "risk": row.get("risk", ""),
            "mitigation": row.get("mitigation", ""),
            "status": row.get("status", ""),
            "sourceFile": row.get("source_file", ""),
            "uniquenessStatus": row.get("uniqueness_status", ""),
        }
        for row in rows
        if row.get("unique_offer_key")
    ]


def campaign_records(rows: list[dict[str, str]]) -> list[dict[str, Any]]:
    return [
        {
            "campaignName": row.get("campaign_name") or "",
            "campaignSlug": slugify(row.get("campaign_name") or ""),
            "campaignType": row.get("campaign_type") or "",
            "publicCategory": category_for(row),
            "pinCount": int(float(row.get("pin_count") or 0)),
            "samplePins": split_list(row.get("sample_pins")),
        }
        for row in rows
        if row.get("campaign_name")
    ]


def offer_template_records(rows: list[dict[str, str]]) -> list[dict[str, Any]]:
    return [
        {
            "publicCategory": category_for(row),
            "defaultCampaign": row.get("default_campaign") or "",
            "campaignType": row.get("campaign_type") or "",
            "defaultCopyAngle": row.get("default_copy_angle") or "",
            "recommendedPerkOrOffer": row.get("recommended_perk_or_offer") or "",
            "offerTitleTemplate": row.get("offer_title_template") or "",
            "primaryCta": row.get("primary_cta") or "",
            "recommendedTags": split_list(row.get("recommended_tags")),
            "proofMetrics": split_list(row.get("proof_metrics")),
        }
        for row in rows
    ]


def read_campaign_matrix(csv_path: str) -> list[dict[str, str]]:
    if not csv_path or not Path(csv_path).exists():
        return []
    with open(csv_path, encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    return [
        {
            "campaignId": row.get("Campaign ID", ""),
            "campaignName": row.get("Campaign / Perk", ""),
            "entityName": row.get("Entity / Partner", ""),
            "entityType": row.get("Entity Type", ""),
            "district": row.get("District", ""),
            "audience": row.get("Audience", ""),
            "offerMechanics": row.get("Offer Mechanics", ""),
            "bestTiming": row.get("Best Timing", ""),
            "successKpi": row.get("Success KPI", ""),
            "recommendedDestination": "admin_outreach_or_campaign_review",
        }
        for row in rows
    ]


def campaign_matrix_records(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    return [
        {
            "campaignId": row.get("Campaign ID", ""),
            "campaignName": row.get("Campaign / Perk", ""),
            "entityName": row.get("Entity / Partner", ""),
            "entityType": row.get("Entity Type", ""),
            "district": row.get("District", ""),
            "audience": row.get("Audience", ""),
            "offerMechanics": row.get("Offer Mechanics", ""),
            "bestTiming": row.get("Best Timing", ""),
            "requiredAssets": row.get("Required Assets", ""),
            "successKpi": row.get("Success KPI", ""),
            "risk": row.get("Risk", ""),
            "mitigation": row.get("Mitigation", ""),
            "status": row.get("Status", ""),
            "recommendedDestination": "admin_outreach_or_campaign_review",
        }
        for row in rows
        if row.get("Campaign ID") or row.get("Entity / Partner")
    ]


def assessment_records(file_path: str) -> dict[str, list[dict[str, str]]]:
    if not file_path or not Path(file_path).exists():
        return {"missingVerifyPartners": [], "recommendedInclusions": []}
    sheets = parse_workbook(file_path)
    return {
        "missingVerifyPartners": [
            {
                "campaignId": row.get("Campaign ID", ""),
                "campaignName": row.get("Campaign / Perk", ""),
                "entityName": row.get("Entity / Partner", ""),
                "entityType": row.get("Entity Type", ""),
                "district": row.get("District", ""),
                "audience": row.get("Audience", ""),
                "offerMechanics": row.get("Offer Mechanics", ""),
                "recommendedDestination": "verify_before_public_map",
            }
            for row in sheets.get("Missing Verify Partners", [])
        ],
        "recommendedInclusions": [
            {
                "item": row.get("item", ""),
                "source": row.get("source", ""),
                "type": row.get("type", ""),
                "campaignOrRole": row.get("campaign_or_role", ""),
                "district": row.get("district", ""),
                "recommendedDestination": row.get("recommended_destination", ""),
                "reason": row.get("reason", ""),
            }
            for row in sheets.get("Recommended Inclusions", [])
        ],
    }


def dana_crm_records(file_path: str = "", fallback_sheets: dict[str, list[dict[str, str]]] | None = None) -> list[dict[str, str]]:
    if file_path and Path(file_path).exists():
        sheets = parse_workbook(file_path)
    else:
        sheets = fallback_sheets or {}
    rows = sheets.get("Stakeholder CRM") or next(iter(sheets.values()), [])
    return [
        {
            "tier": row.get("Tier", ""),
            "category": row.get("Category", ""),
            "organization": row.get("Organization", ""),
            "roleTitle": row.get("Role/Title", ""),
            "committeePortfolio": row.get("Committee/Portfolio", ""),
            "influenceArea": row.get("Influence Area", ""),
            "relationshipPriority": row.get("Relationship Priority", ""),
            "recommendedDestination": "admin_outreach_only",
        }
        for row in rows
        if any(row.values())
    ]


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"{json.dumps(payload, indent=2)}\n", encoding="utf-8")


def main() -> int:
    args = parse_args()
    sheets = parse_workbook(args.workbook)
    launch_rows = sheets.get("Launch Pins + Copy") or sheets.get("Launch Pins Complete") or []
    intelligence_rows = sheets.get("Intelligence View Backend", [])
    unique_offer_rows = unique_offer_records(sheets.get("Unique Partner Offers", []))
    public_pins = [
        pin
        for index, row in enumerate(launch_rows)
        for pin in [to_public_pin(row, index)]
        if is_publicly_eligible(row, pin["publicCategory"], approval_status(row))
    ]
    admin_pins = [to_admin_pin(row, index) for index, row in enumerate(launch_rows)]
    campaign_matrix = read_campaign_matrix(args.campaign_matrix) or campaign_matrix_records(sheets.get("Perk Campaign Matrix", []))
    assessment = assessment_records(args.assessment)
    dana_crm = dana_crm_records(args.dana_crm, {
        "Stakeholder CRM": sheets.get("DANA Stakeholder CRM", []),
    })

    public_payload = {
        "schema": "downtown-perks-launch-map-pins-public-v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceSummary": {
            "launchPinRows": len(launch_rows),
            "publicPins": len(public_pins),
            "publicPinsWithCoordinates": len([pin for pin in public_pins if pin["hasExactMarker"]]),
            "campaignRows": len(sheets.get("Campaign Rollup", [])),
            "offerTemplateRows": len(sheets.get("Offer Templates", [])),
            "intelligenceRows": len(intelligence_rows),
            "uniquePartnerOffers": len(unique_offer_rows),
            "draftOffersHidden": len([pin for pin in public_pins if not pin["offer"]]),
        },
        "pins": public_pins,
        "campaigns": campaign_records(sheets.get("Campaign Rollup", [])),
        "offerTemplates": offer_template_records(sheets.get("Offer Templates", [])),
    }

    admin_payload = {
        "schema": "downtown-perks-launch-map-pins-admin-v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceSummary": {
            "launchPinRows": len(launch_rows),
            "campaignMatrixRows": len(campaign_matrix),
            "missingVerifyPartners": len(assessment["missingVerifyPartners"]),
            "recommendedInclusions": len(assessment["recommendedInclusions"]),
            "danaCrmRows": len(dana_crm),
            "intelligenceRows": len(intelligence_rows),
            "uniquePartnerOffers": len(unique_offer_rows),
        },
        "internalOnlyFields": INTERNAL_ONLY_FIELDS,
        "pins": admin_pins,
        "partnerIntelligence": backend_intelligence_records(intelligence_rows),
        "uniquePartnerOffers": unique_offer_rows,
        "fullMapCrmMaster": sheets.get("Full Map CRM Master", []),
        "mapPinOutreachLeads": sheets.get("Map Pin Outreach Leads", []),
        "partnerAdminOutreach": sheets.get("Partner Admin Outreach", []),
        "attachmentInclusion": sheets.get("Attachment Inclusion", []),
        "addedOrUpdatedItems": sheets.get("Added or Updated Items", []),
        "uniquenessQa": sheets.get("Uniqueness QA", []),
        "campaignMatrix": campaign_matrix,
        "missingVerifyPartners": assessment["missingVerifyPartners"],
        "recommendedInclusions": assessment["recommendedInclusions"],
        "danaCrmOutreach": dana_crm,
    }

    write_json(PUBLIC_OUTPUT, public_payload)
    write_json(ADMIN_OUTPUT, admin_payload)
    print(json.dumps({
        "publicOutput": str(PUBLIC_OUTPUT.relative_to(REPO_ROOT)),
        "adminOutput": str(ADMIN_OUTPUT.relative_to(REPO_ROOT)),
        **public_payload["sourceSummary"],
        "campaignMatrixRows": len(campaign_matrix),
        "missingVerifyPartners": len(assessment["missingVerifyPartners"]),
        "danaCrmRows": len(dana_crm),
        "intelligenceRows": len(intelligence_rows),
        "uniquePartnerOffers": len(unique_offer_rows),
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
