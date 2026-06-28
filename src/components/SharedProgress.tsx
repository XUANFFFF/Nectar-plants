import { Flower2, MapPinned, Sprout, UsersRound, Waypoints } from "lucide-react";
import type { Summary } from "../lib/types";

type SharedProgressProps = {
  summary: Summary;
};

const items = [
  { key: "recordCount", label: "条共创观察", icon: Waypoints },
  { key: "speciesCount", label: "种蜜源植物", icon: Flower2 },
  { key: "countyCount", label: "个覆盖区县", icon: MapPinned },
  { key: "observerCount", label: "位共创伙伴", icon: UsersRound },
] as const;

export function SharedProgress({ summary }: SharedProgressProps) {
  return (
    <div className="hero-progress" aria-label="共创进展">
      {items.map(({ key, label, icon: Icon }) => (
        <div className="stat" key={key}>
          <Icon className="icon" aria-hidden="true" />
          <strong>{summary[key].toLocaleString("zh-CN")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

type HeroBlockProps = {
  summary: Summary;
  observerCount: number;
  onJumpToMap: () => void;
  onJumpToPlants: () => void;
};

export function HeroBlock({ summary, onJumpToMap, onJumpToPlants }: HeroBlockProps) {
  return (
    <section className="hero-band">
      <div className="hero-copy">
        <span className="hero-eyebrow">
          <Sprout size={14} /> 公众科学 · 城市生态监测
        </span>
        <h1>深圳城市绿地传粉动物公民科学项目</h1>
        <p>
          关注城市传粉动物与蜜源植物。每一条来自志愿者的观察记录，
          都在帮助我们了解城市生态系统的健康状况。
          实时数据持续更新，专家解读定期发布。
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            type="button"
            className="filter-pill is-active"
            onClick={onJumpToMap}
          >
            打开蜜源地图
          </button>
          <button type="button" className="filter-pill" onClick={onJumpToPlants}>
            浏览植物图鉴
          </button>
        </div>
      </div>
      <SharedProgress summary={summary} />
    </section>
  );
}
