import { readFileSync } from "fs";
import { read, utils } from "xlsx";
import { FIELD_MAP, REQUIRED_FIELDS } from "./field-mapping.js";

export function parseExcel(filePath) {
  const buf = readFileSync(filePath);
  const wb = read(buf, { type: "buffer", cellFormula: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = utils.sheet_to_json(ws, { defval: null });
  return parseRows(rows);
}

export function parseRows(rows) {
  if (rows.length === 0) return { records: [], errors: [], headers: [] };

  const headers = Object.keys(rows[0]);
  const mapped = headers.map((h) => ({ original: h, mapped: FIELD_MAP[h] || null }));

  const records = [];
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNum = i + 2;
    const rowErrors = [];
    const record = {};

    for (const [orig, value] of Object.entries(raw)) {
      const field = FIELD_MAP[orig];
      if (!field) continue;

      if (field === "associated_taxa" && value != null) {
        record[field] = String(value)
          .split(/[,;，；、/\n\r|]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .join("||");
        continue;
      }

      if ((field === "media_urls" || field === "source_media_urls") && value != null) {
        record[field] = String(value)
          .split(/[,;，；|\n\r]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .join("||");
        continue;
      }

      if (field === "longitude" || field === "latitude" || field === "elevation") {
        const n = Number(value);
        record[field] = Number.isFinite(n) ? n : null;
        continue;
      }

      record[field] = value != null ? String(value).trim() : null;
    }

    for (const req of REQUIRED_FIELDS) {
      if (!record[req] || record[req] === "") {
        rowErrors.push({ field: req, code: "missing_required", message: `缺少必填字段: ${req}`, raw_value: record[req] });
      }
    }

    if (record.longitude != null && (record.longitude < -180 || record.longitude > 180)) {
      rowErrors.push({ field: "longitude", code: "invalid_range", message: `经度超出范围: ${record.longitude}`, raw_value: String(record.longitude) });
    }
    if (record.latitude != null && (record.latitude < -90 || record.latitude > 90)) {
      rowErrors.push({ field: "latitude", code: "invalid_range", message: `纬度超出范围: ${record.latitude}`, raw_value: String(record.latitude) });
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, fields: rowErrors, raw });
    }

    records.push(record);
  }

  return { records, errors, headers: mapped };
}

export function generateRecordHash(r) {
  const parts = [
    r.source_record_id || "",
    r.observer || "",
    r.event_date || "",
    r.chinese_name || r.scientific_name || "",
    r.longitude ?? "",
    r.latitude ?? "",
    r.media_url || "",
  ];
  return parts.join("::");
}
