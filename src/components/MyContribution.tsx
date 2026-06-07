import { Award, MapPin, Sprout } from "lucide-react";
import type { ObserverContribution } from "../lib/types";
import { formatDate } from "../lib/observations";
import { ObservationImage } from "./ObservationImage";

type MyContributionProps = {
  contribution: ObserverContribution;
};

function thumbEmoji(plant: string | null | undefined): string {
  if (!plant) return "🌿";
  if (/桃|木|兰|桂|丁/.test(plant)) return "🌸";
  if (/草|菊|莲/.test(plant)) return "🌼";
  return "🌿";
}

export function MyContribution({ contribution }: MyContributionProps) {
  return (
    <div className="contribution-layout">
      <div className="contribution-score">
        <h3>{contribution.observer}的观察档案</h3>
        <div className="big-number">{contribution.recordCount}</div>
        <span style={{ color: "rgba(255,255,255,0.78)" }}>条已上传的共创记录</span>

        <div className="breakdown">
          <div className="item">
            <strong>{contribution.speciesCount}</strong>
            <span>种蜜源植物</span>
          </div>
          <div className="item">
            <strong>{contribution.countyCount}</strong>
            <span>个区县</span>
          </div>
          <div className="item">
            <strong>{contribution.cityCount}</strong>
            <span>个城市</span>
          </div>
          <div className="item">
            <strong>{contribution.gardenCount}</strong>
            <span>个观察场域</span>
          </div>
        </div>

        <div className="badges">
          {contribution.badges.length === 0 ? (
            <span className="badge">
              <Sprout size={12} /> 观察者新人
            </span>
          ) : (
            contribution.badges.map((badge) => (
              <span className="badge" key={badge}>
                <Award size={12} /> {badge}
              </span>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="section-heading" style={{ marginBottom: 12 }}>
          <span className="eyebrow">最近上传</span>
          <h3 style={{ margin: 0, fontSize: 20 }}>这些记录已经进入共创地图</h3>
        </div>
        <div className="contribution-records">
          {contribution.latestRecords.length === 0 ? (
            <p style={{ color: "var(--ink-soft)" }}>这位伙伴还没有上传记录。</p>
          ) : null}
          {contribution.latestRecords.map((record, index) => (
            <article className="record-card" key={`${record.id}-${record.eventDate}-${index}`}>
              {record.mediaUrls.length > 0 || record.mediaUrl ? (
                <ObservationImage record={record} alt={record.chineseName ?? ""} fallback={thumbEmoji(record.chineseName)} />
              ) : (
                <div className="photo-fallback">
                  {thumbEmoji(record.chineseName)}
                </div>
              )}
              <div>
                <strong>{record.chineseName ?? "未识别物种"}</strong>
                <div className="meta">
                  <span>
                    <MapPin
                      size={11}
                      style={{ verticalAlign: "-1px", marginRight: 2 }}
                    />
                    {record.city ?? "—"} · {record.county ?? "—"}
                  </span>
                  {record.associatedTaxa.length > 0 ? (
                    <span>访花：{record.associatedTaxa.slice(-1)[0]}</span>
                  ) : null}
                </div>
              </div>
              <time>{formatDate(record.eventDate)}</time>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
