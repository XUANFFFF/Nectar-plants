import { useMemo, useState } from "react";
import { GardenArrivalCard } from "./GardenArrivalCard";
import type { GardenGroup, Observation } from "../lib/types";
import { filterGardensByLayer, type GardenLayer } from "../lib/observations";

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
  const [selectedId, setSelectedId] = useState<string | null>(gardens[0]?.id ?? null);

  const filteredGardens = useMemo(() => {
    return filterGardensByLayer(gardens, activeLayer);
  }, [gardens, activeLayer]);

  const selected =
    filteredGardens.find((g) => g.id === selectedId) ?? filteredGardens[0] ?? gardens[0];

  const cityLabels = useMemo(() => {
    const byCity = new Map<string, { city: string; lon: number; lat: number; count: number }>();
    for (const g of filteredGardens) {
      const cur = byCity.get(g.city) ?? { city: g.city, lon: 0, lat: 0, count: 0 };
      cur.lon += g.longitude;
      cur.lat += g.latitude;
      cur.count += 1;
      byCity.set(g.city, cur);
    }
    return [...byCity.values()].map((c) => ({
      city: c.city,
      lon: c.lon / c.count,
      lat: c.lat / c.count,
    }));
  }, [filteredGardens]);

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
        </div>

        <div className="map-stage" aria-label="蜜源观察点地图">
          <div className="grid-lines" />
          <span className="map-stage-title">城市蜜源共创地图 · {filteredGardens.length} 个观察场域</span>
          {cityLabels.map((c) => {
            const x = projectX(c.lon);
            const y = projectY(c.lat);
            return (
              <span
                key={c.city}
                className="city-label"
                style={{ left: `calc(${x}% + 4px)`, top: `${y}%` }}
              >
                {c.city}
              </span>
            );
          })}
          {filteredGardens.slice(0, 60).map((garden, index) => {
            const x = projectX(garden.longitude) + ((index * 5) % 7) - 3;
            const y = projectY(garden.latitude) + ((index * 7) % 9) - 4;
            return (
              <button
                type="button"
                key={garden.id}
                className={`map-point ${selected?.id === garden.id ? "is-active" : ""}`}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => setSelectedId(garden.id)}
                aria-label={`${garden.county}蜜源观察区，共 ${garden.recordCount} 条记录`}
              >
                {garden.recordCount}
              </button>
            );
          })}

          <div className="map-legend">
            <span>
              <span className="swatch honey" /> 当前选中场域
            </span>
            <span>
              <span className="swatch cream" /> 其他共创场域
            </span>
          </div>
        </div>
      </div>

      {selected ? <GardenArrivalCard garden={selected} /> : null}
    </section>
  );
}

function projectX(lon: number): number {
  const min = 113.0;
  const max = 114.6;
  return Math.max(6, Math.min(94, ((lon - min) / (max - min)) * 100));
}

function projectY(lat: number): number {
  const min = 21.8;
  const max = 23.6;
  return Math.max(8, Math.min(92, ((max - lat) / (max - min)) * 100));
}
