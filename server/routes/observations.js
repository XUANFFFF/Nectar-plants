import { Router } from "express";
import { getDb } from "../db.js";

const router = Router();

router.get("/observations", (req, res) => {
  try {
    const db = getDb();
    const { city, limit, offset } = req.query;
    let sql = "SELECT * FROM observations WHERE 1=1";
    const params = [];
    if (city) { sql += " AND city = ?"; params.push(city); }
    sql += " ORDER BY event_date DESC";
    if (limit) { sql += " LIMIT ?"; params.push(Number(limit)); }
    if (offset) { sql += " OFFSET ?"; params.push(Number(offset)); }
    const rows = db.prepare(sql).all(...params);
    const parsed = rows.map(normalizeObservation);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/observations/:id", (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare("SELECT * FROM observations WHERE id = ?").get(Number(req.params.id));
    if (!row) return res.status(404).json({ error: "记录未找到" });
    res.json(normalizeObservation(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/summary", (req, res) => {
  try {
    const db = getDb();
    const stats = db.prepare(`
      SELECT
        COUNT(*) as recordCount,
        COUNT(DISTINCT observer) as observerCount,
        COUNT(DISTINCT chinese_name) as speciesCount,
        COUNT(DISTINCT family_chinese_name) as familyCount,
        COUNT(DISTINCT city) as cityCount,
        COUNT(DISTINCT county) as countyCount
      FROM observations
    `).get();
    const verificationTypes = db.prepare("SELECT DISTINCT verification_status FROM observations WHERE verification_status IS NOT NULL").all().map(r => r.verification_status);
    const means = db.prepare("SELECT DISTINCT establishment_means FROM observations WHERE establishment_means IS NOT NULL").all().map(r => r.establishment_means);
    const habitats = db.prepare("SELECT DISTINCT habitat_type FROM observations WHERE habitat_type IS NOT NULL").all().map(r => r.habitat_type);
    res.json({ ...stats, verificationStatuses: verificationTypes, establishmentMeans: means, habitatTypes: habitats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/metadata", (req, res) => {
  try {
    const db = getDb();
    const stats = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN verification_status = '已审核' THEN 1 ELSE 0 END) as verified FROM observations").get();
    const lastBatch = db.prepare("SELECT created_at FROM import_batches WHERE status = 'imported' ORDER BY created_at DESC LIMIT 1").get();
    const lastObs = db.prepare("SELECT MAX(event_date) as lastDate FROM observations").get();
    res.json({
      lastUpdated: lastBatch?.created_at || lastObs?.lastDate || "—",
      dataSource: "数据库导入数据",
      isLiveData: true,
      recordCount: stats.total,
      verifiedCount: stats.verified,
      pendingCount: stats.total - stats.verified,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/verification-stats", (req, res) => {
  try {
    const db = getDb();
    const stats = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN verification_status = '已审核' THEN 1 ELSE 0 END) as verified, SUM(CASE WHEN verification_status = '待审核' THEN 1 ELSE 0 END) as pending FROM observations").get();
    res.json({ ...stats, verifiedPercent: stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/data-quality", (req, res) => {
  try {
    const db = getDb();
    const noImage = db.prepare("SELECT COUNT(*) as c FROM observations WHERE (media_url IS NULL OR media_url = '') AND (media_urls IS NULL OR media_urls = '')").get().c;
    const noCoords = db.prepare("SELECT COUNT(*) as c FROM observations WHERE longitude IS NULL OR latitude IS NULL").get().c;
    const noPollinator = db.prepare("SELECT COUNT(*) as c FROM observations WHERE associated_taxa IS NULL OR associated_taxa = ''").get().c;
    const total = db.prepare("SELECT COUNT(*) as c FROM observations").get().c;
    res.json({ noImage, noCoords, noPollinator, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ponytail: stub for future external sync
router.post("/sync/observations", (req, res) => {
  res.status(501).json({ error: "外部同步暂未实现，预留接口" });
});

function normalizeObservation(row) {
  return {
    ...row,
    associated_taxa: row.associated_taxa ? row.associated_taxa.split("||").filter(Boolean) : [],
    media_urls: row.media_urls ? row.media_urls.split("||").filter(Boolean) : [],
    source_media_urls: row.source_media_urls ? row.source_media_urls.split("||").filter(Boolean) : [],
    raw_payload: row.raw_payload ? JSON.parse(row.raw_payload) : null,
  };
}

export default router;
