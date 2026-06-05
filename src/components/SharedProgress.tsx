import { useState } from "react";
import {
  Flower2,
  MapPinned,
  Sprout,
  UsersRound,
  Waypoints,
} from "lucide-react";
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
          <Sprout size={14} /> 公众科学 · 城市自然观察
        </span>
        <h1>城市蜜源共创地图</h1>
        <p>
          我们一起点亮城市里的蜜源线索。
          每一条观察都会进入地图、植物图鉴与场域信息卡，
          成为城市生态共创的一部分。
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
