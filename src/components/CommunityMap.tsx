import { useMemo, useState } from "react";
import guangdongCitiesRaw from "../data/guangdong-cities.geojson.json";
import { CitySummaryCard } from "./CitySummaryCard";
import type { GardenGroup, Observation } from "../lib/types";
import {
  buildCitySummaries,
  buildProvinceSummary,
  filterGardensByCity,
  filterGardensByLayer,
  type GardenLayer,
} from "../lib/observations";
import { buildBoundaryFeatures, normalizeCityName, type GeoJsonFeatureCollection } from "../lib/cityBoundaries";

type CommunityMapProps = {
  gardens: GardenGroup[];
  records: Observation[];
};

const layerOptions: Array<{ key: GardenLayer; label: string }> = [
  { key: "all", label: "全部点位" },
  { key: "wild", label: "野生蜜源" },
  { key: "cultivated", label: "人工养育" },
  { key: "recent", label: "近 30 天" },
];

export function CommunityMap({ gardens, records }: CommunityMapProps) {
  const [activeLayer, setActiveLayer] = useState<GardenLayer>("all");
  const [selectedCityKey, setSelectedCityKey] = useState<string | null>(null);

  const layerFilteredGardens = useMemo(() => {
    return filterGardensByLayer(gardens, activeLayer);
  }, [gardens, activeLayer]);

  const boundaryMap = useMemo(
    () => buildBoundaryFeatures(guangdongCitiesRaw as unknown as GeoJsonFeatureCollection),
    [],
  );

  const citySummaries = useMemo(() => buildCitySummaries(layerFilteredGardens), [layerFilteredGardens]);
  const provinceSummary = useMemo(() => buildProvinceSummary(layerFilteredGardens), [layerFilteredGardens]);
  const filteredGardens = useMemo(
    () => filterGardensByCity(layerFilteredGardens, selectedCityKey),
    [layerFilteredGardens, selectedCityKey],
  );

  const citySummaryMap = useMemo(
    () => new Map(citySummaries.map((summary) => [summary.cityKey, summary])),
    [citySummaries],
  );

  const selectedSummary =
    (selectedCityKey ? citySummaryMap.get(selectedCityKey) : undefined) ??
    (selectedCityKey
      ? {
          cityKey: selectedCityKey,
          cityLabel: `${selectedCityKey}市`,
          recordCount: 0,
          gardenCount: 0,
          speciesCount: 0,
          countyCount: 0,
          topCounties: [],
          topPlants: [],
          latestObservationDate: null,
        }
      : provinceSummary);

  return (
    <section className="map-layout">
      <div>
        <div className="map-filters" role="tablist" aria-label="地图图层">
          {layerOptions.map((opt) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeLayer === opt.key}
              key={opt.key}
              className={`filter-pill ${activeLayer === opt.key ? "is-active" : ""}`}
              onClick={() => setActiveLayer(opt.key)}
            >
              {opt.label}
            </button>
          ))}
          <span
            className="filter-pill"
            style={{ background: "transparent", border: 0, color: "var(--ink-soft)" }}
          >
            共 {filteredGardens.length} 个场域 · {records.length} 条记录
          </span>
          {selectedCityKey ? (
            <button type="button" className="filter-pill" onClick={() => setSelectedCityKey(null)}>
              返回全省
            </button>
          ) : null}
        </div>

        <div className="map-stage" aria-label="蜜源观察点地图">
          <div className="grid-lines" />
          <span className="map-stage-title">
            城市蜜源共创地图 · {selectedSummary.cityLabel} · {filteredGardens.length} 个观察场域
          </span>
          <svg className="boundary-map" viewBox={boundaryMap.viewBox} aria-hidden="true">
            {boundaryMap.features.map((feature, index) => {
              const isActive = selectedCityKey === feature.cityKey;
              const isDimmed = selectedCityKey !== null && !isActive;
              return (
                <g key={`${feature.cityKey}-${index}`}>
                  <path
                    d={feature.path}
                    className={`city-boundary${isActive ? " is-active" : ""}${isDimmed ? " is-dimmed" : ""}`}
                    onClick={() =>
                      setSelectedCityKey((current) =>
                        current === feature.cityKey ? null : feature.cityKey,
                      )
                    }
                  />
                  <text
                    className={`city-label${isDimmed ? " is-dimmed" : ""}`}
                    x={feature.center.x}
                    y={feature.center.y}
                  >
                    {feature.cityLabel}
                  </text>
                </g>
              );
            })}
          </svg>
          {filteredGardens.slice(0, 60).map((garden, index) => {
            const projected = boundaryMap.projectPoint([garden.longitude, garden.latitude]);
            const jitterX = (((index * 5) % 7) - 3) * 0.35;
            const jitterY = (((index * 7) % 9) - 4) * 0.35;
            const x = projected.x / 10 + jitterX;
            const y = projected.y / 10 + jitterY;
            return (
              <button
                type="button"
                key={garden.id}
                className={`map-point ${selectedCityKey && normalizeCityName(garden.city) === selectedCityKey ? "is-active" : ""}`}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => setSelectedCityKey(normalizeCityName(garden.city))}
                aria-label={`${garden.county}蜜源观察区，共 ${garden.recordCount} 条记录`}
              >
                {garden.recordCount}
              </button>
            );
          })}

          <div className="map-legend">
            <span>
              <span className="swatch honey" /> 当前选中城市
            </span>
            <span>
              <span className="swatch cream" /> 其他共创场域
            </span>
          </div>
        </div>
      </div>

      <CitySummaryCard
        summary={selectedSummary}
        onResetCity={selectedCityKey ? () => setSelectedCityKey(null) : undefined}
      />
    </section>
  );
}
