import { describe, expect, it } from "vitest";
import {
  buildGardenGroups,
  buildCitySummaries,
  filterGardensByLayer,
  getCitySpotlights,
  getContributionForObserver,
  getPlantSummaries,
  getPrimaryMediaUrl,
} from "./observations";
import { buildBoundaryFeatures, normalizeCityName } from "./cityBoundaries";
import type { Observation } from "./types";

function record(overrides: Partial<Observation>): Observation {
  return {
    id: "id",
    mediaUrl: null,
    mediaUrls: [],
    sourceMediaUrls: [],
    originalFilename: null,
    observer: "示例志愿者A",
    observerId: "a",
    eventDate: "2026-04-30T10:00:00",
    dateIdentified: null,
    scientificName: "Plant scientific",
    scientificNameId: null,
    chineseName: "马利筋",
    establishmentMeans: "人工养育",
    locationId: "garden-1",
    higherGeographyId: null,
    country: "中国",
    province: "广东省",
    city: "深圳市",
    county: "福田区",
    longitude: 114.03,
    latitude: 22.58,
    elevation: null,
    remarks: null,
    verbatimIdentification: null,
    phylum: null,
    phylumChineseName: null,
    family: "Apocynaceae",
    familyChineseName: "夹竹桃科",
    genus: "Asclepias",
    genusChineseName: "马利筋属",
    authorship: null,
    identifiedBy: null,
    identifiedById: null,
    verificationStatus: "已审核",
    datasetName: "深圳蜜源植物调查",
    datasetId: null,
    license: "CC BY-NC 4.0",
    cstr: null,
    habitatType: "人工环境",
    associatedTaxa: ["Apis cerana cerana", "东方蜜蜂中华亚种"],
    ...overrides,
  };
}

describe("observation selectors", () => {
  it("keeps wild species in the wild garden layer", () => {
    const gardens = buildGardenGroups([
      record({
        id: "wild",
        locationId: "wild-garden",
        establishmentMeans: "野生物种",
        chineseName: "白花鬼针草",
      }),
      record({
        id: "cultivated",
        locationId: "cultivated-garden",
        establishmentMeans: "人工养育",
        chineseName: "马利筋",
      }),
    ]);

    const wild = filterGardensByLayer(gardens, "wild");

    expect(wild).toHaveLength(1);
    expect(wild[0].id).toBe("wild-garden");
  });

  it("uses the dataset latest date for recent garden filtering", () => {
    const gardens = buildGardenGroups([
      record({
        id: "recent",
        locationId: "recent-garden",
        eventDate: "2026-04-30T10:00:00",
      }),
      record({
        id: "old",
        locationId: "old-garden",
        eventDate: "2026-03-01T10:00:00",
      }),
    ]);

    const recent = filterGardensByLayer(gardens, "recent");

    expect(recent).toHaveLength(1);
    expect(recent[0].id).toBe("recent-garden");
  });

  it("awards the wildflower badge for wild species observations", () => {
    const contribution = getContributionForObserver(
      [
        record({
          establishmentMeans: "野生物种",
          observer: "示例志愿者A",
        }),
      ],
      "示例志愿者A",
    );

    expect(contribution.badges).toContain("野花守护者");
  });

  it("counts recent city observations relative to the dataset timeline", () => {
    const cities = getCitySpotlights([
      record({ id: "latest", eventDate: "2026-04-30T10:00:00" }),
      record({ id: "within-window", eventDate: "2026-04-01T10:00:00" }),
      record({ id: "outside-window", eventDate: "2026-01-01T10:00:00" }),
    ]);

    expect(cities[0].recentCount).toBe(2);
  });

  it("uses the first associated media URL as the primary image", () => {
    expect(
      getPrimaryMediaUrl(
        record({
          mediaUrl: "https://example.org/fallback.jpg",
          mediaUrls: ["/media/local-one.jpg", "/media/local-two.jpg"],
        }),
      ),
    ).toBe("/media/local-one.jpg");
  });

  it("prefers a cached associatedMedia image for plant guide representatives", () => {
    const plants = getPlantSummaries([
      record({
        id: "new-demo",
        chineseName: "马利筋",
        eventDate: "2026-04-30T10:00:00",
        mediaUrl: "https://example.org/demo.jpg",
        mediaUrls: ["https://example.org/demo.jpg"],
      }),
      record({
        id: "older-real",
        chineseName: "马利筋",
        eventDate: "2025-05-31T10:00:00",
        mediaUrl: "/media/BIOGRID_522674_1.jpg",
        mediaUrls: ["/media/BIOGRID_522674_1.jpg"],
      }),
    ]);

    expect(plants[0].representative.id).toBe("older-real");
    expect(getPrimaryMediaUrl(plants[0].representative)).toBe("/media/BIOGRID_522674_1.jpg");
  });

  it("normalizes Guangdong city names for matching boundaries and records", () => {
    expect(normalizeCityName("广州市")).toBe("广州");
    expect(normalizeCityName("潮州")).toBe("潮州");
    expect(normalizeCityName("揭阳城区")).toBe("揭阳");
  });

  it("builds svg-ready boundary features from geojson polygons", () => {
    const model = buildBoundaryFeatures({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "广州市" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [113.0, 23.0],
                [114.0, 23.0],
                [114.0, 24.0],
                [113.0, 24.0],
                [113.0, 23.0],
              ],
            ],
          },
        },
      ],
    });

    expect(model.features).toHaveLength(1);
    expect(model.features[0].cityKey).toBe("广州");
    expect(model.features[0].path).toContain("M");
    expect(model.viewBox).toBe("0 0 1000 1000");
    expect(model.projectPoint([113.0, 24.0])).toEqual({ x: 0, y: 0 });
    expect(model.projectPoint([114.0, 23.0])).toEqual({ x: 1000, y: 1000 });
  });

  it("builds city summaries for the selected city view", () => {
    const gardens = buildGardenGroups([
      record({
        id: "gz-1",
        locationId: "gz-1",
        city: "广州市",
        county: "海珠区",
        chineseName: "马利筋",
        eventDate: "2026-04-30T10:00:00",
      }),
      record({
        id: "gz-2",
        locationId: "gz-2",
        city: "广州",
        county: "天河区",
        chineseName: "龙船花",
        eventDate: "2026-04-12T10:00:00",
      }),
      record({
        id: "gz-3",
        locationId: "gz-1",
        city: "广州",
        county: "海珠区",
        chineseName: "假连翘",
        eventDate: "2026-04-29T10:00:00",
      }),
    ]);

    const summaries = buildCitySummaries(gardens);

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      cityKey: "广州",
      cityLabel: "广州市",
      recordCount: 3,
      gardenCount: 2,
      speciesCount: 3,
      countyCount: 2,
    });
    expect(summaries[0].topCounties[0]).toBe("海珠区");
  });
});
