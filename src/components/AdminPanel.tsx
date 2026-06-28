import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Database, Download, FileUp, List, Upload, XCircle } from "lucide-react";

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || "dev-key-change-me";

type Batch = {
  id: number;
  filename: string;
  file_size: number;
  status: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  created_at: string;
  imported_at: string | null;
};

type PreviewResult = {
  batchId: number;
  filename: string;
  total: number;
  valid: number;
  invalid: number;
  errors: Array<{ row: number; fields: Array<{ field: string; code: string; message: string }> }>;
  preview: Array<Record<string, unknown>>;
};

function headers() {
  return { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY };
}

export function AdminPanel() {
  const [tab, setTab] = useState<"upload" | "batches">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; duplicates: number } | null>(null);
  const [error, setError] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);

  const loadBatches = useCallback(async () => {
    try {
      const res = await fetch("/api/imports", { headers: headers() });
      if (res.ok) setBatches(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setPreview(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/imports/upload", {
        method: "POST",
        headers: { "X-Admin-Key": ADMIN_KEY },
        body: form,
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setPreview(await res.json());
      await loadBatches();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setImporting(true);
    setError("");
    try {
      const res = await fetch(`/api/imports/${preview.batchId}/confirm`, {
        method: "POST",
        headers: headers(),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResult(await res.json());
      setPreview(null);
      await loadBatches();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await fetch(`/api/imports/${id}/cancel`, { method: "POST", headers: headers() });
      await loadBatches();
    } catch { /* ignore */ }
  };

  return (
    <>
      <div className="section-heading">
        <span className="eyebrow">
          <Database size={12} style={{ verticalAlign: "-1px", marginRight: 2 }} /> 管理后台
        </span>
        <h2>数据导入与管理</h2>
        <p>上传 Excel 文件，解析为标准化观察记录，预览确认后写入数据库。管理页面的写入操作需要 x-admin-key 请求头。</p>
      </div>

      <div className="admin-tabs">
        <button type="button" className={tab === "upload" ? "is-active" : ""} onClick={() => setTab("upload")}>
          <FileUp size={14} /> 上传导入
        </button>
        <button type="button" className={tab === "batches" ? "is-active" : ""} onClick={() => { setTab("batches"); loadBatches(); }}>
          <List size={14} /> 导入记录
        </button>
      </div>

      {tab === "upload" && (
        <div className="admin-upload">
          <div className="upload-area">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              id="excel-file"
              style={{ display: "none" }}
            />
            <label htmlFor="excel-file" className="upload-label">
              <Upload size={24} />
              <span>{file ? file.name : "点击选择 Excel 文件（.xlsx / .xls）"}</span>
              {file && <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{(file.size / 1024).toFixed(1)} KB</span>}
            </label>
          </div>

          <button type="button" className="admin-btn" onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "上传解析中…" : "上传并解析"}
          </button>

          {error && <div className="admin-error"><AlertTriangle size={14} /> {error}</div>}

          {preview && (
            <div className="admin-preview">
              <h3>解析结果</h3>
              <div className="preview-stats">
                <span>总计 <strong>{preview.total}</strong> 行</span>
                <span>有效 <strong className="text-green">{preview.valid}</strong> 行</span>
                <span>错误 <strong className="text-red">{preview.invalid}</strong> 行</span>
              </div>

              {preview.errors.length > 0 && (
                <div className="preview-errors">
                  <h4>行级错误（前 50 条）</h4>
                  {preview.errors.slice(0, 10).map((e, i) => (
                    <div key={i} className="error-row">
                      <span className="error-row-num">第 {e.row} 行</span>
                      {e.fields.map((f, j) => (
                        <span key={j} className="error-msg">{f.message}</span>
                      ))}
                    </div>
                  ))}
                  {preview.errors.length > 10 && <p className="text-muted">…还有 {preview.errors.length - 10} 条错误</p>}
                </div>
              )}

              {preview.preview.length > 0 && (
                <div className="preview-data">
                  <h4>前 {preview.preview.length} 条有效记录预览</h4>
                  <div className="preview-table-wrap">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {Object.keys(preview.preview[0]).slice(0, 8).map((k) => <th key={k}>{k}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.preview.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).slice(0, 8).map((v, j) => <td key={j}>{String(v ?? "—").slice(0, 30)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="preview-actions">
                <button type="button" className="admin-btn primary" onClick={handleConfirm} disabled={importing || preview.valid === 0}>
                  {importing ? "导入中…" : `确认导入 ${preview.valid} 条有效记录`}
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="admin-result">
              <CheckCircle size={18} />
              <span>导入完成：新增 <strong>{result.inserted}</strong> 条，跳过重复 <strong>{result.duplicates}</strong> 条</span>
            </div>
          )}
        </div>
      )}

      {tab === "batches" && (
        <div className="admin-batches">
          {batches.length === 0 && <p className="text-muted">暂无导入记录。</p>}
          {batches.map((b) => (
            <div className="batch-card" key={b.id}>
              <div className="batch-info">
                <strong>{b.filename}</strong>
                <span className={`batch-status status-${b.status}`}>{statusLabel(b.status)}</span>
              </div>
              <div className="batch-meta">
                <span>{(b.file_size / 1024).toFixed(1)} KB</span>
                <span>{b.total_rows} 行</span>
                <span>有效 {b.valid_rows}</span>
                {b.invalid_rows > 0 && <span className="text-red">错误 {b.invalid_rows}</span>}
                {b.duplicate_rows > 0 && <span>重复 {b.duplicate_rows}</span>}
                <span>{formatTime(b.created_at)}</span>
              </div>
              {b.status === "parsed" && (
                <button type="button" className="admin-btn small" onClick={() => handleCancel(b.id)}>取消批次</button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="admin-note">
        <AlertTriangle size={13} />
        <span>管理后台当前使用环境变量 ADMIN_KEY 鉴权。生产环境部署前必须增加完整的用户认证和 RLS 权限控制。</span>
      </div>
    </>
  );
}

function statusLabel(s: string) {
  const map: Record<string, string> = { uploaded: "已上传", parsed: "已解析", imported: "已导入", failed: "失败", cancelled: "已取消" };
  return map[s] || s;
}

function formatTime(t: string) {
  if (!t) return "—";
  const d = new Date(t + "Z");
  return isNaN(d.getTime()) ? t : d.toLocaleString("zh-CN");
}

