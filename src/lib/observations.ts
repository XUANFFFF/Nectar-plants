import type {
  CitySummary,
  GardenGroup,
  Observation,
  ObserverContribution,
  PlantSummary,
} from "./types";
import { normalizeCityName } from "./cityBoundaries";

const collator = new Intl.Collator("zh-Hans-CN");
const dayMs = 24 * 60 * 60 * 1000;

export type GardenLayer = "all" | "wild" | "cultivated" | "recent";

export function getPrimaryMediaUrl(record: Pick<Observation, "mediaUrl" | "mediaUrls">): string | null {
  return record.mediaUrls[0] ?? record.mediaUrl ?? null;
}

function hasCachedMedia(record: Pick<Observation, "mediaUrl" | "mediaUrls">): boolean {
  return getPrimaryMediaUrl(record)?.startsWith("/media/") ?? false;
}

function bestImageFirst(a: Observation, b: Observation): number {
  const aHasMedia = hasCachedMedia(a);
  const bHasMedia = hasCachedMedia(b);
  if (aHasMedia !== bHasMedia) return aHasMedia ? -1 : 1;
  return newestFirst(a, b);
}

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) =>
    collator.compare(a, b),
  );
}

function newestFirst(a: Observation, b: Observation): number {
  const aTime = a.eventDate ? new Date(a.eventDate).getTime() : 0;
  const bTime = b.eventDate ? new Date(b.eventDate).getTime() : 0;
  return bTime - aTime;
}

function nonNull<T>(value: T | null | undefined): T | null {
  return value === null || value === undefined ? null : value;
}

function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function latestObservationTime(records: Observation[]): number {
  return records.reduce((latest, record) => {
    if (!record.eventDate) return latest;
    const time = new Date(record.eventDate).getTime();
    return Number.isFinite(time) ? Math.max(latest, time) : latest;
  }, 0);
}

export function getRecentObservations(records: Observation[], limit = 8): Observation[] {
  return [...records].sort(newestFirst).slice(0, limit);
}

export function buildGardenGroups(records: Observation[]): GardenGroup[] {
  const grouped = new Map<string, Observation[]>();

  for (const record of records) {
    const key = record.locationId || `${record.city}-${record.county}`;
    grouped.set(key, [...(grouped.get(key) ?? []), record]);
  }

  return [...grouped.entries()]
    .map(([id, group]) => {
      const sorted = [...group].sort(newestFirst);
      const latest = sorted[0];
      const city = latest.city ?? "未知城市";
      const county = latest.county ?? "未知区县";
      const lons = group.map((r) => safeNumber(r.longitude));
      const lats = group.map((r) => safeNumber(r.latitude));
      const avgLon = lons.reduce((a, b) => a + b, 0) / lons.length;
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      return {
        id,
        name: `${county}蜜源观察区`,
        city,
        county,
        longitude: avgLon,
        latitude: avgLat,
        recordCount: group.length,
        plantNames: uniqueSorted(group.map((r) => r.chineseName)),
        pollinatorNames: uniqueSorted(group.flatMap((r) => r.associatedTaxa)),
        observerNames: uniqueSorted(group.map((r) => r.observer)),
        latestObservation: latest,
        observations: sorted,
      };
    })
    .sort((a, b) => b.recordCount - a.recordCount);
}

export function filterGardensByLayer(gardens: GardenGroup[], layer: GardenLayer): GardenGroup[] {
  if (layer === "all") return gardens;

  if (layer === "recent") {
    const latest = latestObservationTime(gardens.map((garden) => garden.latestObservation));
    const cutoff = latest - 30 * dayMs;
    return gardens.filter((garden) => {
      const time = garden.latestObservation.eventDate
        ? new Date(garden.latestObservation.eventDate).getTime()
        : 0;
      return Number.isFinite(time) && time >= cutoff;
    });
  }

  const means = layer === "wild" ? "野生物种" : "人工养育";
  return gardens.filter((garden) =>
    garden.observations.some((observation) => observation.establishmentMeans === means),
  );
}

export function getPlantSummaries(records: Observation[]): PlantSummary[] {
  const grouped = new Map<string, Observation[]>();

  for (const record of records) {
    const name = record.chineseName ?? "未识别物种";
    grouped.set(name, [...(grouped.get(name) ?? []), record]);
  }

  return [...grouped.entries()]
    .map(([chineseName, group]) => {
      const sorted = [...group].sort(newestFirst);
      const rep = [...group].sort(bestImageFirst)[0];
      return {
        chineseName,
        scientificName: rep.scientificName ?? "—",
        familyChineseName: rep.familyChineseName ?? "—",
        genusChineseName: rep.genusChineseName ?? "—",
        recordCount: group.length,
        cities: uniqueSorted(group.map((r) => r.city)),
        counties: uniqueSorted(group.map((r) => r.county)),
        pollinators: uniqueSorted(group.flatMap((r) => r.associatedTaxa)),
        observers: uniqueSorted(group.map((r) => r.observer)),
        establishmentMeans: uniqueSorted(group.map((r) => r.establishmentMeans)),
        representative: rep,
        observations: sorted,
      };
    })
    .sort((a, b) => b.recordCount - a.recordCount || collator.compare(a.chineseName, b.chineseName));
}

export function getContributionForObserver(
  records: Observation[],
  observer: string,
): ObserverContribution {
  const own = records.filter((r) => r.observer === observer);
  const plants = uniqueSorted(own.map((r) => r.chineseName));
  const counties = uniqueSorted(own.map((r) => r.county));
  const cities = uniqueSorted(own.map((r) => r.city));
  const gardens = new Set(
    own.map((r) => r.locationId || `${r.city}-${r.county}`),
  );
  const badges: string[] = [];
  if (counties.length >= 3) badges.push("多区县探索者");
  if (plants.length >= 3) badges.push("蜜源发现者");
  if (own.length >= 5) badges.push("稳定观察者");
  const pollinatorRecords = own.filter((r) => r.associatedTaxa.length > 0);
  if (pollinatorRecords.length >= 2) badges.push("蜂蝶线索员");
  if (own.some((r) => r.establishmentMeans === "野生物种")) badges.push("野花守护者");

  return {
    observer,
    recordCount: own.length,
    speciesCount: plants.length,
    countyCount: counties.length,
    cityCount: cities.length,
    gardenCount: gardens.size,
    plants,
    latestRecords: getRecentObservations(own, 6),
    badges,
  };
}

export function getObserverList(records: Observation[]): string[] {
  return uniqueSorted(records.map((r) => r.observer));
}

export function getCitySpotlights(records: Observation[]): Array<{
  city: string;
  recordCount: number;
  counties: string[];
  topPlants: string[];
  recentCount: number;
}> {
  const grouped = new Map<string, Observation[]>();
  for (const record of records) {
    const city = record.city ?? "未知城市";
    grouped.set(city, [...(grouped.get(city) ?? []), record]);
  }
  const latest = latestObservationTime(records);
  const weekMs = 7 * dayMs;
  return [...grouped.entries()]
    .map(([city, group]) => {
      const recent = group.filter((r) => {
        if (!r.eventDate) return false;
        return latest - new Date(r.eventDate).getTime() <= weekMs * 6;
      });
      return {
        city,
        recordCount: group.length,
        counties: uniqueSorted(group.map((r) => r.county)),
        topPlants: getPlantSummaries(group)
          .slice(0, 3)
          .map((p) => p.chineseName),
        recentCount: recent.length,
      };
    })
    .sort((a, b) => b.recordCount - a.recordCount);
}

export function filterGardensByCity(gardens: GardenGroup[], cityKey: string | null): GardenGroup[] {
  if (!cityKey) return gardens;
  return gardens.filter((garden) => normalizeCityName(garden.city) === cityKey);
}

export function buildCitySummaries(gardens: GardenGroup[]): CitySummary[] {
  const grouped = new Map<
    string,
    {
      cityLabel: string;
      recordCount: number;
      gardenCount: number;
      species: Set<string>;
      counties: Map<string, number>;
      plants: Map<string, number>;
      latestObservationDate: string | null;
    }
  >();

  for (const garden of gardens) {
    const cityKey = normalizeCityName(garden.city);
    const current =
      grouped.get(cityKey) ??
      {
        cityLabel: garden.city,
        recordCount: 0,
        gardenCount: 0,
        species: new Set<string>(),
        counties: new Map<string, number>(),
        plants: new Map<string, number>(),
        latestObservationDate: null,
      };

    current.cityLabel = pickCityLabel(current.cityLabel, garden.city);
    current.recordCount += garden.recordCount;
    current.gardenCount += 1;
    current.counties.set(garden.county, (current.counties.get(garden.county) ?? 0) + garden.recordCount);

    for (const plant of garden.plantNames) {
      current.species.add(plant);
    }
    for (const observation of garden.observations) {
      const plant = observation.chineseName ?? "未识别物种";
      current.plants.set(plant, (current.plants.get(plant) ?? 0) + 1);
      current.latestObservationDate = latestDate(current.latestObservationDate, observation.eventDate);
    }

    grouped.set(cityKey, current);
  }

  return [...grouped.entries()]
    .map(([cityKey, value]) => ({
      cityKey,
      cityLabel: value.cityLabel,
      recordCount: value.recordCount,
      gardenCount: value.gardenCount,
      speciesCount: value.species.size,
      countyCount: value.counties.size,
      topCounties: sortCountMap(value.counties),
      topPlants: sortCountMap(value.plants),
      latestObservationDate: value.latestObservationDate,
    }))
    .sort((a, b) => b.recordCount - a.recordCount || collator.compare(a.cityLabel, b.cityLabel));
}

export function buildProvinceSummary(gardens: GardenGroup[]): CitySummary {
  const citySummaries = buildCitySummaries(gardens);
  const countyTotals = new Map<string, number>();
  const plantTotals = new Map<string, number>();
  let latestObservationDate: string | null = null;

  for (const garden of gardens) {
    countyTotals.set(garden.county, (countyTotals.get(garden.county) ?? 0) + garden.recordCount);
    for (const observation of garden.observations) {
      const plant = observation.chineseName ?? "未识别物种";
      plantTotals.set(plant, (plantTotals.get(plant) ?? 0) + 1);
      latestObservationDate = latestDate(latestObservationDate, observation.eventDate);
    }
  }

  return {
    cityKey: "all",
    cityLabel: "广东省",
    recordCount: citySummaries.reduce((sum, item) => sum + item.recordCount, 0),
    gardenCount: gardens.length,
    speciesCount: new Set(gardens.flatMap((garden) => garden.plantNames)).size,
    countyCount: countyTotals.size,
    topCounties: sortCountMap(countyTotals),
    topPlants: sortCountMap(plantTotals),
    latestObservationDate,
  };
}

export function getFeaturedStories(records: Observation[]): Array<{
  plant: string;
  pollinator: string;
  city: string;
  county: string;
  observer: string | null;
  eventDate: string | null;
  mediaUrl: string | null;
  description: string;
}> {
  const seen = new Set<string>();
  const stories: Array<{
    plant: string;
    pollinator: string;
    city: string;
    county: string;
    observer: string | null;
    eventDate: string | null;
    mediaUrl: string | null;
    description: string;
  }> = [];
  const sorted = [...records].sort(newestFirst);
  for (const record of sorted) {
    if (record.associatedTaxa.length === 0) continue;
    const pollinator = record.associatedTaxa[record.associatedTaxa.length - 1];
    const plant = record.chineseName ?? "未知植物";
    const key = `${plant}::${pollinator}`;
    if (seen.has(key)) continue;
    seen.add(key);
    stories.push({
      plant,
      pollinator,
      city: record.city ?? "—",
      county: record.county ?? "—",
      observer: nonNull(record.observer),
      eventDate: record.eventDate,
      mediaUrl: getPrimaryMediaUrl(record),
      description: `${plant} 在这里遇到了 ${pollinator}。`,
    });
    if (stories.length >= 6) break;
  }
  return stories;
}

function sortCountMap(values: Map<string, number>): string[] {
  return [...values.entries()]
    .sort((a, b) => b[1] - a[1] || collator.compare(a[0], b[0]))
    .map(([name]) => name);
}

function latestDate(current: string | null, next: string | null): string | null {
  if (!next) return current;
  if (!current) return next;
  return new Date(next).getTime() >= new Date(current).getTime() ? next : current;
}

function pickCityLabel(current: string, next: string): string {
  if (current.endsWith("市")) return current;
  if (next.endsWith("市")) return next;
  return current || next;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
