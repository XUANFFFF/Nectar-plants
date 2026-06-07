import { Leaf, MapPinned, Navigation, Sprout } from "lucide-react";
import type { CitySummary } from "../lib/types";
import { formatDate } from "../lib/observations";

type CitySummaryCardProps = {
  summary: CitySummary;
  onResetCity?: () => void;
};

export function CitySummaryCard({ summary, onResetCity }: CitySummaryCardProps) {
  const topCounties = summary.topCounties.slice(0, 4);
  const topPlants = summary.topPlants.slice(0, 6);
  const isProvince = summary.cityKey === "all";

  return (
    <aside className="arrival-card city-summary-card" aria-label="城市汇总卡">
      <span className="arrival-tag">
        <MapPinned size={12} /> {isProvince ? "广东全省视图" : "当前城市视图"}
      </span>
      <h3>{summary.cityLabel}</h3>
      <p className="arrival-summary">
        {isProvince
          ? "先看全省边界和点位分布，再点击任意城市聚焦该地的热点区县与代表植物。"
          : `当前已聚焦 ${summary.cityLabel}。边界高亮后，地图只显示这座城市内的共创场域。`}
      </p>

      <div className="arrival-stats">
        <div className="stat">
          <strong>{summary.recordCount}</strong>
          <span>共创记录</span>
        </div>
        <div className="stat">
          <strong>{summary.gardenCount}</strong>
          <span>观察场域</span>
        </div>
        <div className="stat">
          <strong>{summary.speciesCount}</strong>
          <span>蜜源植物</span>
        </div>
      </div>

      <div className="arrival-section">
        <h4>热点区县</h4>
        <div className="chip-row">
          {topCounties.length > 0 ? (
            topCounties.map((county) => (
              <span className="chip" key={county}>
                {county}
              </span>
            ))
          ) : (
            <span className="chip muted">当前筛选下暂无区县数据</span>
          )}
        </div>
      </div>

      <div className="arrival-section">
        <h4>代表植物</h4>
        <div className="chip-row">
          {topPlants.length > 0 ? (
            topPlants.map((plant) => (
              <span className="chip" key={plant}>
                {plant}
              </span>
            ))
          ) : (
            <span className="chip muted">当前筛选下暂无植物记录</span>
          )}
        </div>
      </div>

      <div className="arrival-section">
        <h4>城市线索</h4>
        <div className="field-actions">
          <button type="button">
            <Navigation size={16} aria-hidden="true" /> 优先查看记录密度更高的区县
          </button>
          <button type="button">
            <Sprout size={16} aria-hidden="true" /> 对比该市不同场域的植物组成
          </button>
          <button type="button">
            <Leaf size={16} aria-hidden="true" /> 按当前图层继续筛选野生或近期记录
          </button>
        </div>
      </div>

      {onResetCity ? (
        <button type="button" className="reset-city-button" onClick={onResetCity}>
          返回全省视图
        </button>
      ) : null}

      <div className="latest-note">
        <Navigation size={14} />
        最近观察时间 <strong>{formatDate(summary.latestObservationDate)}</strong>
        ，覆盖 <strong>{summary.countyCount}</strong> 个区县
      </div>
    </aside>
  );
}
