import { describe, expect, it } from "vitest";
import {
  buildGardenGroups,
  filterGardensByLayer,
  getCitySpotlights,
  getContributionForObserver,
} from "./observations";
import type { Observation } from "./types";

function record(overrides: Partial<Observation>): Observation {
  return {
    id: "id",
    mediaUrl: null,
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
});
