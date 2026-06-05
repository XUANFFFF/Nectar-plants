import { Camera, Flower2, Navigation, Sparkles } from "lucide-react";
import type { GardenGroup } from "../lib/types";
import { formatDate } from "../lib/observations";

type GardenArrivalCardProps = {
  garden: GardenGroup;
};

export function GardenArrivalCard({ garden }: GardenArrivalCardProps) {
  const plants = garden.plantNames.slice(0, 4).join("、");
  const plantOverflow = garden.plantNames.length - 4;
  const pollinators = garden.pollinatorNames.slice(0, 4).join("、");
  const hasMorePollinators = garden.pollinatorNames.length > 4;
  const observer = garden.latestObservation.observer ?? "匿名志愿者";
  const latestPlant = garden.latestObservation.chineseName ?? "未识别物种";

  return (
    <aside className="arrival-card" aria-label="到场探索卡">
      <span className="arrival-tag">
        <Navigation size={12} /> 你已进入
      </span>
      <h3>{garden.name}</h3>
      <p className="arrival-summary">
        这里记录了{plants}
        {plantOverflow > 0 ? `等 ${plantOverflow}+` : ""}种蜜源植物，
        也曾观察到{pollinators || "蜂蝶类群"}
        {hasMorePollinators ? "等" : ""}来访。
      </p>

      <div className="arrival-stats">
        <div className="stat">
          <strong>{garden.recordCount}</strong>
          <span>共创记录</span>
        </div>
        <div className="stat">
          <strong>{garden.plantNames.length}</strong>
          <span>蜜源植物</span>
        </div>
        <div className="stat">
          <strong>{garden.pollinatorNames.length}</strong>
          <span>访花类群</span>
        </div>
      </div>

      <div className="arrival-section">
        <h4>代表植物</h4>
        <div className="chip-row">
          {garden.plantNames.slice(0, 6).map((name) => (
            <span className="chip" key={name}>
              {name}
            </span>
          ))}
          {garden.plantNames.length > 6 ? (
            <span className="chip muted">+{garden.plantNames.length - 6}</span>
          ) : null}
        </div>
      </div>

      <div className="arrival-section">
        <h4>访花昆虫线索</h4>
        <div className="chip-row">
          {garden.pollinatorNames.slice(0, 6).map((name) => (
            <span className="chip" key={name}>
              {name}
            </span>
          ))}
          {garden.pollinatorNames.length === 0 ? (
            <span className="chip muted">尚未记录到访花昆虫</span>
          ) : null}
        </div>
      </div>

      <div className="arrival-section">
        <h4>推荐任务</h4>
        <div className="field-actions">
          <button type="button">
            <Flower2 size={16} aria-hidden="true" /> 寻找正在开花的蜜源植物
          </button>
          <button type="button">
            <Sparkles size={16} aria-hidden="true" /> 观察蜂蝶访花，记录新关联
          </button>
          <button type="button">
            <Camera size={16} aria-hidden="true" /> 为这片场域补充一条新记录
          </button>
        </div>
      </div>

      <div className="latest-note">
        <Navigation size={14} />
        最近一次记录来自 <strong>{observer}</strong>，
        观察到 <strong>{latestPlant}</strong>（{formatDate(garden.latestObservation.eventDate)}）
      </div>
    </aside>
  );
}
