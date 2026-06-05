"""把 Excel 观察数据导出为前端可直接消费的 JSON。

读取 38 字段的志愿者上传数据，输出：
- src/data/observations.json   每条记录的扁平化字段
- src/data/summary.json        整体统计

字段保持原始中文键值，前端按需选择。
"""

import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "志愿者上传数据_demo虚拟数据_170条_15名志愿者_非均分.xlsx"
OUT_DIR = ROOT / "src" / "data"


def clean(value):
    if pd.isna(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    text = str(value).strip()
    if not text or text.lower() == "null" or text == "none":
        return None
    return text


def clean_number(value):
    cleaned = clean(value)
    if cleaned is None:
        return None
    try:
        num = float(cleaned)
    except (TypeError, ValueError):
        return None
    if num != num:  # NaN
        return None
    return num


def clean_observer(value):
    """志愿者字段偶尔会带 "null,赤小豆" 之类的合并错误。"""
    cleaned = clean(value)
    if cleaned is None:
        return None
    if "," in cleaned:
        parts = [p.strip() for p in cleaned.split(",") if p.strip() and p.strip().lower() != "null"]
        if parts:
            return parts[-1]
        return None
    return cleaned


def split_taxa(value):
    if pd.isna(value):
        return []
    return [part.strip() for part in str(value).split(",") if part.strip()]


def split_higher(value):
    if pd.isna(value):
        return {}
    text = str(value).strip()
    if "/" not in text:
        return {"raw": text}
    parts = [p.strip() for p in text.split("/") if p.strip()]
    return {"raw": text, "parts": parts}


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_excel(SOURCE)

    records = []
    for row in df.to_dict(orient="records"):
        records.append(
            {
                "id": clean(row["occurrenceID"]),
                "mediaUrl": clean(row["associatedMedia"]),
                "originalFilename": clean(row["originalFilename"]),
                "observer": clean_observer(row["recordedBy"]),
                "observerId": clean(row["recordedByID"]),
                "eventDate": clean(row["eventDate"]),
                "dateIdentified": clean(row["dateIdentified"]),
                "scientificName": clean(row["scientificName"]),
                "scientificNameId": clean(row["scientificNameID"]),
                "chineseName": clean(row["chineseName"]),
                "establishmentMeans": clean(row["establishmentMeans"]),
                "locationId": clean(row["locationID"]),
                "higherGeographyId": clean(row["higherGeographyID"]),
                "country": clean(row["country"]),
                "province": clean(row["province"]),
                "city": clean(row["prefecture"]),
                "county": clean(row["county"]),
                "longitude": clean_number(row["decimalLongitude"]),
                "latitude": clean_number(row["decimalLatitude"]),
                "elevation": clean_number(row["elevationInMeters"]),
                "remarks": clean(row["occurrenceRemarks"]),
                "verbatimIdentification": clean(row["verbatimIdentification"]),
                "phylum": clean(row["phylum"]),
                "phylumChineseName": clean(row["phylumChineseName"]),
                "family": clean(row["family"]),
                "familyChineseName": clean(row["familyChineseName"]),
                "genus": clean(row["genus"]),
                "genusChineseName": clean(row["genusChineseName"]),
                "authorship": clean(row["scientificNameAuthorship"]),
                "identifiedBy": clean(row["identifiedBy"]),
                "identifiedById": clean(row["identifiedByID"]),
                "verificationStatus": clean(row["identificationVerificationStatus"]),
                "datasetName": clean(row["datasetName"]),
                "datasetId": clean(row["datasetID"]),
                "license": clean(row["license"]),
                "cstr": clean(row["CSTR"]),
                "habitatType": clean(row["habitatType"]),
                "associatedTaxa": split_taxa(row["associatedTaxa"]),
            }
        )

    summary = {
        "recordCount": len(records),
        "observerCount": int(df["recordedBy"].nunique()),
        "speciesCount": int(df["chineseName"].nunique()),
        "familyCount": int(df["familyChineseName"].nunique()),
        "cityCount": int(df["prefecture"].nunique()),
        "countyCount": int(df["county"].nunique()),
        "habitatTypes": sorted(
            {str(v) for v in df["habitatType"].dropna().unique().tolist()}
        ),
        "verificationStatuses": sorted(
            {str(v) for v in df["identificationVerificationStatus"].dropna().unique().tolist()}
        ),
        "establishmentMeans": sorted(
            {str(v) for v in df["establishmentMeans"].dropna().unique().tolist()}
        ),
    }

    (OUT_DIR / "observations.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (OUT_DIR / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("Wrote", len(records), "records to", OUT_DIR / "observations.json")
    print("Summary:", json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
