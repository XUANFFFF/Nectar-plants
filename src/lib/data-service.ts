// ponytail: try API first, fallback to static JSON when server unreachable
import type { Observation, Summary } from "./types";
import observationsFallback from "../data/observations.json";
import summaryFallback from "../data/summary.json";

const API_BASE = "/api";

async function apiGet(path: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function getObservations(): Promise<Observation[]> {
  const data = await apiGet("/observations");
  if (data) return data as Observation[];
  return observationsFallback as Observation[];
}

export async function getSummary(): Promise<Summary> {
  const data = await apiGet("/summary");
  if (data) return data as Summary;
  return summaryFallback as Summary;
}

export async function getMetadata() {
  const data = await apiGet("/metadata");
  if (data) return data;
  const records = observationsFallback as Observation[];
  const summary = summaryFallback as Summary;
  const verified = records.filter((r) => r.verificationStatus === "已审核").length;
  return {
    lastUpdated: "2025-06-01",
    dataSource: "BioGrid 深圳蜜源植物调查 · demo 数据集",
    isLiveData: false,
    recordCount: records.length,
    verifiedCount: verified,
    pendingCount: records.length - verified,
    observerCount: summary.observerCount,
    speciesCount: summary.speciesCount,
  };
}

export async function getVerificationStats() {
  const data = await apiGet("/verification-stats");
  if (data) return data;
  const records = observationsFallback as Observation[];
  const verified = records.filter((r) => r.verificationStatus === "已审核");
  const pending = records.filter((r) => r.verificationStatus === "待审核");
  return {
    verified: verified.length,
    pending: pending.length,
    total: records.length,
    verifiedPercent: records.length > 0 ? Math.round((verified.length / records.length) * 100) : 0,
  };
}

export async function getDataQualityStats() {
  const data = await apiGet("/data-quality");
  if (data) return data;
  const records = observationsFallback as Observation[];
  const noImage = records.filter((r) => !r.mediaUrl && r.mediaUrls.length === 0).length;
  const noCoords = records.filter((r) => r.longitude == null || r.latitude == null).length;
  const noPollinator = records.filter((r) => r.associatedTaxa.length === 0).length;
  return { noImage, noCoords, noPollinator, total: records.length };
}
