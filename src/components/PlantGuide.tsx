import { useState } from "react";
import { Camera, MapPin, X } from "lucide-react";
import type { PlantSummary } from "../lib/types";
import { formatDate } from "../lib/observations";

type PlantGuideProps = {
  plants: PlantSummary[];
};

function thumbLabel(name: string): string {
  return name.slice(0, 2);
}

export function PlantGuide({ plants }: PlantGuideProps) {
  const [active, setActive] = useState<PlantSummary | null>(null);

  return (
    <>
      <div className="plant-grid">
        {plants.map((plant) => (
          <article
            className="plant-card"
            key={plant.chineseName}
            onClick={() => setActive(plant)}
          >
            <div className="plant-thumb">
              {plant.representative.mediaUrl ? (
                <img
                  src={plant.representative.mediaUrl}
                  alt={`${plant.chineseName}照片`}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                thumbLabel(plant.chineseName)
              )}
            </div>
            <div className="plant-body">
              <h3>{plant.chineseName}</h3>
              <p className="scientific">{plant.scientificName}</p>
              <div className="meta">
                <span>
                  {plant.familyChineseName} · {plant.genusChineseName}
                </span>
                <span className="badge">{plant.recordCount} 条记录</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {active ? <PlantDetailModal plant={active} onClose={() => setActive(null)} /> : null}
    </>
  );
}

function PlantDetailModal({
  plant,
  onClose,
}: {
  plant: PlantSummary;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="close" onClick={onClose} aria-label="关闭">
          <X size={16} />
        </button>
        <div className="modal-photo">
          {plant.representative.mediaUrl ? (
            <img
              src={plant.representative.mediaUrl}
              alt={`${plant.chineseName}照片`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            plant.chineseName.slice(0, 2)
          )}
        </div>
        <h2>{plant.chineseName}</h2>
        <p className="modal-meta">
          {plant.scientificName} · {plant.familyChineseName} · {plant.genusChineseName}
        </p>

        <div className="modal-grid">
          <div className="modal-block">
            <h4>分布范围</h4>
            <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 14 }}>
              {plant.cities.join("、") || "—"}
            </p>
            <div className="chip-row" style={{ marginTop: 8 }}>
              {plant.counties.slice(0, 6).map((county) => (
                <span className="chip muted" key={county}>
                  {county}
                </span>
              ))}
            </div>
          </div>
          <div className="modal-block">
            <h4>生境与访花关联</h4>
            <div className="chip-row" style={{ marginBottom: 6 }}>
              {plant.establishmentMeans.map((m) => (
                <span className="chip" key={m}>
                  {m}
                </span>
              ))}
            </div>
            <div className="chip-row">
              {plant.pollinators.length === 0 ? (
                <span className="chip muted">尚未记录到访花昆虫</span>
              ) : (
                plant.pollinators.slice(0, 6).map((p) => (
                  <span className="chip" key={p}>
                    {p}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-block">
          <h4>共创证据 · {plant.observations.length} 条原始观察</h4>
          <div className="evidence-list">
            {plant.observations.slice(0, 4).map((record, index) => (
              <div className="ev" key={`${record.id}-${record.eventDate}-${index}`}>
                {record.mediaUrl ? (
                  <img
                    src={record.mediaUrl}
                    alt={plant.chineseName}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      background: "var(--leaf-soft)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--leaf-deep)",
                      fontWeight: 700,
                    }}
                  >
                    {plant.chineseName.slice(0, 2)}
                  </div>
                )}
                <div>
                  <strong>{record.observer ?? "匿名志愿者"}</strong>
                  <span>
                    <MapPin size={11} style={{ verticalAlign: "-1px", marginRight: 2 }} />
                    {record.city ?? "—"} · {record.county ?? "—"} · {formatDate(record.eventDate)}
                  </span>
                  {record.associatedTaxa.length > 0 ? (
                    <div style={{ marginTop: 2, color: "var(--ink-soft)" }}>
                      <Camera size={11} style={{ verticalAlign: "-1px", marginRight: 2 }} />
                      访花：{record.associatedTaxa.join("、")}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
