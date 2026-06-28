import { Router } from "express";
import multer from "multer";
import { extname, join, dirname } from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";
import { getDb } from "../db.js";
import { parseExcel, generateRecordHash } from "../excel-parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = join(__dirname, "..", "..", "data", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${uuid()}${extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (ext === ".xlsx" || ext === ".xls") return cb(null, true);
    cb(new Error("仅支持 .xlsx / .xls 文件"));
  },
});

const router = Router();

router.post("/imports/upload", upload.single("file"), (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "请选择文件" });
    const result = parseExcel(file.path);

    const db = getDb();
    const stmt = db.prepare(
      "INSERT INTO import_batches (filename, file_size, status, total_rows, valid_rows, invalid_rows) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const info = stmt.run(file.originalname, file.size, "parsed", result.records.length, result.records.length - result.errors.length, result.errors.length);
    const batchId = Number(info.lastInsertRowid);

    const errInsert = db.prepare(
      "INSERT INTO import_errors (import_batch_id, row_number, field_name, error_code, message, raw_value, raw_row) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const err of result.errors) {
      errInsert.run(batchId, err.row, err.fields[0]?.field || "", err.fields[0]?.code || "", err.fields[0]?.message || "", err.fields[0]?.raw_value || "", JSON.stringify(err.raw));
    }

    const errorRows = new Set(result.errors.map((e) => e.row));
    const preview = result.records.filter((_, i) => !errorRows.has(i + 2)).slice(0, 20);

    res.json({
      batchId,
      filename: file.originalname,
      total: result.records.length,
      valid: result.records.length - result.errors.length,
      invalid: result.errors.length,
      errors: result.errors.slice(0, 50),
      preview,
      headers: result.headers,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/imports/:id/confirm", (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = getDb();
    const batch = db.prepare("SELECT * FROM import_batches WHERE id = ?").get(id);
    if (!batch) return res.status(404).json({ error: "批次未找到" });
    if (batch.status !== "parsed") return res.status(400).json({ error: "批次状态不允许确认导入" });

    const errors = db.prepare("SELECT * FROM import_errors WHERE import_batch_id = ?").all(id);
    const validRows = batch.total_rows - batch.invalid_rows;
    if (validRows <= 0) return res.status(400).json({ error: "没有有效记录可以导入" });

    const dir = join(__dirname, "..", "..", "data", "uploads");
    const result = parseExcel(join(dir, batch.filename.replace(/^.+-/, "")));
    const errorRows = new Set(errors.map((e) => e.row_number));
    const validRecords = result.records.filter((_, i) => !errorRows.has(i + 2));

    const existing = new Set(
      db.prepare("SELECT source_record_id FROM observations").all().map((r) => r.source_record_id)
    );

    let inserted = 0;
    let duplicates = 0;
    const sql = `INSERT INTO observations (
      source_record_id, dataset_name, dataset_id, license, observer, observer_id,
      event_date, date_identified, chinese_name, scientific_name, scientific_name_id,
      family, family_chinese_name, genus, genus_chinese_name,
      country, province, city, county, longitude, latitude, elevation,
      location_id, establishment_means, habitat_type, associated_taxa,
      remarks, verbatim_identification, identified_by, identified_by_id,
      verification_status, media_url, media_urls, source_media_urls,
      raw_payload, import_batch_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertStmt = db.prepare(sql);

    const insertMany = db.transaction((records) => {
      for (const r of records) {
        const hash = generateRecordHash(r);
        if (existing.has(hash) || existing.has(r.source_record_id)) { duplicates++; continue; }
        if (r.source_record_id) existing.add(r.source_record_id);
        existing.add(hash);
        insertStmt.run(
          r.source_record_id || hash, r.dataset_name, r.dataset_id, r.license || "CC BY-NC 4.0",
          r.observer, r.observer_id, r.event_date, r.date_identified,
          r.chinese_name, r.scientific_name, r.scientific_name_id,
          r.family, r.family_chinese_name, r.genus, r.genus_chinese_name,
          r.country || "中国", r.province, r.city, r.county,
          r.longitude, r.latitude, r.elevation,
          r.location_id, r.establishment_means, r.habitat_type, r.associated_taxa,
          r.remarks, r.verbatim_identification, r.identified_by, r.identified_by_id,
          r.verification_status || "待审核", r.media_url, r.media_urls, r.source_media_urls,
          JSON.stringify(r), id
        );
        inserted++;
      }
    });
    insertMany(validRecords);

    db.prepare("UPDATE import_batches SET status = 'imported', valid_rows = ?, duplicate_rows = ?, imported_at = datetime('now') WHERE id = ?")
      .run(inserted, duplicates, id);

    res.json({ batchId: id, inserted, duplicates, total: batch.total_rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/imports", (req, res) => {
  const db = getDb();
  res.json(db.prepare("SELECT * FROM import_batches ORDER BY created_at DESC LIMIT 50").all());
});

router.get("/imports/:id", (req, res) => {
  const db = getDb();
  const batch = db.prepare("SELECT * FROM import_batches WHERE id = ?").get(Number(req.params.id));
  if (!batch) return res.status(404).json({ error: "批次未找到" });
  const errors = db.prepare("SELECT * FROM import_errors WHERE import_batch_id = ? ORDER BY row_number").all(Number(req.params.id));
  res.json({ ...batch, errors });
});

router.post("/imports/:id/cancel", (req, res) => {
  const db = getDb();
  const info = db.prepare("UPDATE import_batches SET status = 'cancelled' WHERE id = ? AND status = 'parsed'").run(Number(req.params.id));
  if (info.changes === 0) return res.status(400).json({ error: "无法取消，仅 parsed 状态的批次可取消" });
  res.json({ ok: true });
});

export default router;
