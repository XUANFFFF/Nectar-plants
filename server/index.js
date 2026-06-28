import express from "express";
import cors from "cors";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import observationsRouter from "./routes/observations.js";
import importsRouter from "./routes/imports.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

for (const dir of ["data/uploads", "data"]) {
  const p = join(__dirname, "..", dir);
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

const ADMIN_KEY = process.env.ADMIN_KEY || "dev-key-change-me";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api", observationsRouter);

// ponytail: simple admin key auth until proper login system
app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/imports") && req.method !== "GET") {
    const key = req.headers["x-admin-key"];
    if (key !== ADMIN_KEY) return res.status(401).json({ error: "未授权" });
  }
  next();
}, importsRouter);

// ponytail: sync stub, auth required when implemented
app.post("/api/sync/observations", (req, res) => {
  res.status(501).json({ error: "外部同步暂未实现，预留接口" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] admin key: ${ADMIN_KEY}`);
});
