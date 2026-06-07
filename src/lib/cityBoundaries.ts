export type GeoJsonPosition = [number, number];

export type GeoJsonFeature = {
  type: "Feature";
  properties?: {
    name?: string | null;
    [key: string]: unknown;
  };
  geometry: {
    type?: string;
    coordinates: unknown;
  };
};

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

export type BoundaryFeature = {
  id: string;
  cityKey: string;
  cityLabel: string;
  center: { x: number; y: number };
  path: string;
};

export type BoundaryMapModel = {
  features: BoundaryFeature[];
  viewBox: string;
  projectPoint: (position: GeoJsonPosition) => { x: number; y: number };
};

const svgSize = 1000;

export function normalizeCityName(name: string | null | undefined): string {
  if (!name) return "";
  return name.trim().replace(/(特别行政区|自治州|地区|盟|城区|市)$/u, "");
}

export function buildBoundaryFeatures(geojson: GeoJsonFeatureCollection): BoundaryMapModel {
  const bounds = getBounds(geojson.features);
  const width = Math.max(bounds.maxLon - bounds.minLon, 0.0001);
  const height = Math.max(bounds.maxLat - bounds.minLat, 0.0001);

  const projectPoint = ([lon, lat]: GeoJsonPosition) => ({
    x: round(clamp(((lon - bounds.minLon) / width) * svgSize, 0, svgSize)),
    y: round(clamp(svgSize - ((lat - bounds.minLat) / height) * svgSize, 0, svgSize)),
  });

  const project = ([lon, lat]: GeoJsonPosition) => {
    const { x, y } = projectPoint([lon, lat]);
    return `${x} ${y}`;
  };

  return {
    features: geojson.features
      .map((feature, index) => {
      const polygons = toPolygons(feature.geometry);
      const cityLabel = feature.properties?.name?.trim() || "未命名城市";
      const path = polygons
        .flatMap((polygon) =>
          polygon.map((ring) =>
            ring.length > 0 ? `M ${ring.map(project).join(" L ")} Z` : "",
          ),
        )
        .filter(Boolean)
        .join(" ");
      const center = getProjectedCenter(polygons, bounds);

      return {
        id: `${normalizeCityName(cityLabel) || "feature"}-${index}`,
        cityKey: normalizeCityName(cityLabel),
        cityLabel,
        center,
        path,
      };
      })
      .filter((feature) => feature.cityKey && feature.cityKey !== "境界线"),
    viewBox: `0 0 ${svgSize} ${svgSize}`,
    projectPoint,
  };
}

function getBounds(features: GeoJsonFeature[]): {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
} {
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const feature of features) {
    const polygons = toPolygons(feature.geometry);
    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const [lon, lat] of ring) {
          minLon = Math.min(minLon, lon);
          maxLon = Math.max(maxLon, lon);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }
  }

  return { minLon, maxLon, minLat, maxLat };
}

function getProjectedCenter(
  polygons: GeoJsonPosition[][][],
  bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number },
): { x: number; y: number } {
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const [lon, lat] of ring) {
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
    }
  }

  const width = Math.max(bounds.maxLon - bounds.minLon, 0.0001);
  const height = Math.max(bounds.maxLat - bounds.minLat, 0.0001);
  const lon = (minLon + maxLon) / 2;
  const lat = (minLat + maxLat) / 2;

  return {
    x: round(((lon - bounds.minLon) / width) * svgSize),
    y: round(svgSize - ((lat - bounds.minLat) / height) * svgSize),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toPolygons(geometry: GeoJsonFeature["geometry"]): GeoJsonPosition[][][] {
  if (!geometry || !Array.isArray(geometry.coordinates)) {
    return [];
  }

  if (geometry.type === "Polygon") {
    return [geometry.coordinates as GeoJsonPosition[][]];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates as GeoJsonPosition[][][];
  }

  const sample = geometry.coordinates[0];
  if (isRing(sample)) {
    return [geometry.coordinates as GeoJsonPosition[][]];
  }

  return geometry.coordinates as GeoJsonPosition[][][];
}

function isRing(value: unknown): value is GeoJsonPosition[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    Array.isArray(value[0]) &&
    value[0].length >= 2 &&
    typeof value[0][0] === "number"
  );
}
