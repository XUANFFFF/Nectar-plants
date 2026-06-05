import { Camera, MapPin, Sparkles } from "lucide-react";
import type { Observation } from "../lib/types";
import { formatDate, formatDateTime } from "../lib/observations";

type PartnerFeedProps = {
  recent: Observation[];
  cities: Array<{
    city: string;
    recordCount: number;
    counties: string[];
    topPlants: string[];
    recentCount: number;
  }>;
  stories: Array<{
    plant: string;
    pollinator: string;
    city: string;
    county: string;
    observer: string | null;
    eventDate: string | null;
    mediaUrl: string | null;
    description: string;
  }>;
};

function thumbEmoji(plant: string): string {
  if (/桃|木|兰|桂|丁|桃/.test(plant)) return "🌸";
  if (/草|菊|莲|马/.test(plant)) return "🌿";
  return "🌼";
}

export function PartnerFeed({ recent, cities, stories }: PartnerFeedProps) {
  return (
    <div className="feed-layout">
      <div>
        <div className="section-heading" style={{ marginBottom: 12 }}>
          <span className="eyebrow">共创时间线</span>
          <h3 style={{ margin: 0, fontSize: 20 }}>最新上传流</h3>
        </div>
        <div className="activity-list">
          {recent.map((record, index) => (
            <article className="activity-row" key={`${record.id}-${record.eventDate}-${index}`}>
              <div className="thumb">
                {record.mediaUrl ? (
                  <img
                    src={record.mediaUrl}
                    alt={record.chineseName ?? "观察照片"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  thumbEmoji(record.chineseName ?? "")
                )}
              </div>
              <div className="body">
                <strong>{record.observer ?? "匿名志愿者"}</strong>
                <p>
                  在
                  <MapPin
                    size={12}
                    style={{ verticalAlign: "-2px", marginInline: 2 }}
                  />
                  {record.city ?? "—"}{record.county ?? "—"}
                  记录了 <strong>{record.chineseName ?? "未识别物种"}</strong>
                </p>
                <div className="meta">
                  {record.associatedTaxa.length > 0 ? (
                    <span className="pill-honey">
                      <Camera size={11} /> 访花：{record.associatedTaxa.slice(-1)[0]}
                    </span>
                  ) : null}
                  {record.verificationStatus ? (
                    <span>{record.verificationStatus}</span>
                  ) : null}
                </div>
              </div>
              <time className="time">{formatDateTime(record.eventDate)}</time>
            </article>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div className="section-heading" style={{ marginBottom: 12 }}>
            <span className="eyebrow">城市点亮</span>
            <h3 style={{ margin: 0, fontSize: 20 }}>每个城市里有什么</h3>
          </div>
          <div className="city-grid">
            {cities.map((c) => (
              <article className="city-card" key={c.city}>
                <h3>{c.city}</h3>
                <div className="city-stat">{c.recordCount}</div>
                <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>条共创记录</span>
                <div style={{ color: "var(--ink-soft)", fontSize: 12 }}>
                  覆盖 {c.counties.length} 个区县 · 近 6 周新增 {c.recentCount} 条
                </div>
                <div className="city-plants">
                  {c.topPlants.map((p) => (
                    <span className="chip" key={p}>
                      {p}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="section-heading" style={{ marginBottom: 12 }}>
            <span className="eyebrow">发现故事</span>
            <h3 style={{ margin: 0, fontSize: 20 }}>植物遇到了谁</h3>
          </div>
          <div className="story-list">
            {stories.map((story, idx) => (
              <article className="story-card" key={`${story.plant}-${story.pollinator}-${idx}`}>
                <div className="story-thumb">
                  {story.mediaUrl ? (
                    <img
                      src={story.mediaUrl}
                      alt={story.plant}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    thumbEmoji(story.plant)
                  )}
                </div>
                <div>
                  <h4>
                    {story.plant} <Sparkles size={12} style={{ verticalAlign: "-1px" }} /> {story.pollinator}
                  </h4>
                  <p>
                    {story.observer ?? "匿名志愿者"} · {story.city} · {story.county} · {formatDate(story.eventDate)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
