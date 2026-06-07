import { Camera, MapPin } from "lucide-react";
import type { Observation } from "../lib/types";
import { formatDateTime } from "../lib/observations";
import { ObservationImage } from "./ObservationImage";

type ActivityFeedProps = {
  records: Observation[];
  emptyHint?: string;
};

function thumbLabel(record: Observation): string {
  return (record.chineseName ?? "?").slice(0, 2);
}

export function ActivityFeed({ records, emptyHint }: ActivityFeedProps) {
  if (records.length === 0) {
    return (
      <div className="activity-list">
        <p style={{ color: "var(--ink-soft)" }}>{emptyHint ?? "暂无最新观察。"}</p>
      </div>
    );
  }
  return (
    <div className="activity-list">
      {records.map((record, index) => (
        <article className="activity-row" key={`${record.id}-${record.eventDate}-${index}`}>
          <div className="thumb">
            <ObservationImage record={record} fallback={thumbLabel(record)} />
          </div>
          <div className="body">
            <strong>{record.observer ?? "匿名志愿者"}</strong>
            <p>
              在
              <MapPin
                size={12}
                style={{ verticalAlign: "-2px", marginInline: 2 }}
              />
              {record.city ?? "—"}
              {record.county ?? "—"}
              记录了 <strong>{record.chineseName ?? "未识别物种"}</strong>
            </p>
            <div className="meta">
              {record.familyChineseName ? (
                <span>{record.familyChineseName}</span>
              ) : null}
              {record.establishmentMeans ? (
                <span className="pill-honey">{record.establishmentMeans}</span>
              ) : null}
              {record.associatedTaxa.length > 0 ? (
                <span className="pill-honey">
                  <Camera size={11} /> 访花：{record.associatedTaxa.slice(-1)[0]}
                </span>
              ) : null}
            </div>
          </div>
          <time className="time">{formatDateTime(record.eventDate)}</time>
        </article>
      ))}
    </div>
  );
}
