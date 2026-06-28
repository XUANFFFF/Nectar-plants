// ponytail: static JSON fallback — replace fetch() with real API call when live data source is available
import observationsRaw from "../data/observations.json";
import summaryRaw from "../data/summary.json";
import type { Observation, Summary } from "./types";

export interface DataMetadata {
  lastUpdated: string;
  dataSource: string;
  isLiveData: boolean;
  recordCount: number;
  verifiedCount: number;
  pendingCount: number;
  observerCount: number;
  speciesCount: number;
}

const DATE_SOURCE = "2025-06-01";

const records = observationsRaw as Observation[];
const summary = summaryRaw as Summary;

export function getObservations(): Observation[] {
  return records;
}

export function getSummary(): Summary {
  return summary;
}

export function getMetadata(): DataMetadata {
  const verified = records.filter((r) => r.verificationStatus === "已审核").length;
  return {
    lastUpdated: DATE_SOURCE,
    dataSource: "BioGrid 深圳蜜源植物调查 · demo 数据集",
    isLiveData: false,
    recordCount: records.length,
    verifiedCount: verified,
    pendingCount: records.length - verified,
    observerCount: summary.observerCount,
    speciesCount: summary.speciesCount,
  };
}

export function getVerificationStats() {
  const verified = records.filter((r) => r.verificationStatus === "已审核");
  const pending = records.filter((r) => r.verificationStatus === "待审核");
  return {
    verified: verified.length,
    pending: pending.length,
    total: records.length,
    verifiedPercent: records.length > 0 ? Math.round((verified.length / records.length) * 100) : 0,
  };
}

export function getDataQualityStats() {
  const noImage = records.filter((r) => !r.mediaUrl && r.mediaUrls.length === 0).length;
  const noCoords = records.filter((r) => r.longitude == null || r.latitude == null).length;
  const noPollinator = records.filter((r) => r.associatedTaxa.length === 0).length;
  return { noImage, noCoords, noPollinator, total: records.length };
}
