import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpen, MapPinned, Sprout, UserCircle2, Waves } from "lucide-react";
import {
  getContributionForObserver,
  getFeaturedStories,
  getObserverList,
  getPlantSummaries,
  getRecentObservations,
  buildGardenGroups,
  getCitySpotlights,
} from "./lib/observations";
import { getObservations, getSummary, getMetadata, getVerificationStats, getDataQualityStats } from "./lib/data-service";
import { HeroBlock } from "./components/SharedProgress";
import { ActivityFeed } from "./components/ActivityFeed";
import { CommunityMap } from "./components/CommunityMap";
import { PlantGuide } from "./components/PlantGuide";
import { PartnerFeed } from "./components/PartnerFeed";
import { MyContribution } from "./components/MyContribution";
import { ExpertInterpretation } from "./components/ExpertInterpretation";
import { ResourceLibrary } from "./components/ResourceLibrary";

const records = getObservations();
const summary = getSummary();
const metadata = getMetadata();

type SectionKey = "home" | "map" | "plants" | "activity" | "me" | "insights" | "resources";

const sections: Array<{ key: SectionKey; label: string }> = [
  { key: "home", label: "首页" },
  { key: "map", label: "地图" },
  { key: "plants", label: "图鉴" },
  { key: "activity", label: "动态" },
  { key: "me", label: "贡献" },
  { key: "insights", label: "解读" },
  { key: "resources", label: "资料" },
];

export default function App() {
  const [section, setSection] = useState<SectionKey>("home");
  const observers = useMemo(() => getObserverList(records), []);
  const [selectedObserver, setSelectedObserver] = useState<string>(observers[0] ?? "");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as SectionKey;
    if (hash && sections.some((s) => s.key === hash)) {
      setSection(hash);
    }
  }, []);

  const gardens = useMemo(() => buildGardenGroups(records), []);
  const plants = useMemo(() => getPlantSummaries(records), []);
  const recent = useMemo(() => getRecentObservations(records, 12), []);
  const stories = useMemo(() => getFeaturedStories(records), []);
  const cities = useMemo(() => getCitySpotlights(records), []);
  const contribution = useMemo(
    () => getContributionForObserver(records, selectedObserver),
    [selectedObserver],
  );

  const go = (key: SectionKey) => {
    setSection(key);
    window.history.replaceState(null, "", `#${key}`);
    const el = document.getElementById(key);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const verification = getVerificationStats();
  const dataQuality = getDataQualityStats();

  return (
    <div className="app-shell">
      <nav className="top-nav" aria-label="主导航">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            <Sprout size={16} />
          </span>
          深圳城市绿地传粉动物公民科学项目
        </div>
        <div className="nav-links">
          {sections.map((s) => (
            <button
              type="button"
              key={s.key}
              className={section === s.key ? "is-active" : ""}
              onClick={() => go(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="observer-pill" title="切换要查看的志愿者视角">
          <UserCircle2 size={14} />
          <span>当前视角</span>
          <select
            value={selectedObserver}
            onChange={(e) => setSelectedObserver(e.target.value)}
            aria-label="选择志愿者"
          >
            {observers.map((observer) => (
              <option key={observer} value={observer}>
                {observer}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <section id="home">
        <HeroBlock
          summary={summary}
          observerCount={metadata.observerCount}
          onJumpToMap={() => go("map")}
          onJumpToPlants={() => go("plants")}
        />

        <div className="data-status-bar">
          <span><Sprout size={12} /> 数据更新时间：{metadata.lastUpdated}</span>
          <span><Waves size={12} /> 数据来源：{metadata.dataSource}</span>
          <span title={`已审核 ${verification.verified} 条，待审核 ${verification.pending} 条`}>
            <BookOpen size={12} /> 审核：{verification.verifiedPercent}% 已审核
          </span>
        </div>

        <div className="data-quality-bar">
          <AlertTriangle size={13} />
          <span>数据质量：缺图 {dataQuality.noImage} 条、缺经纬度 {dataQuality.noCoords} 条、缺访花关联 {dataQuality.noPollinator} 条。</span>
          <span>待审核或信息不完整的记录仅用于参与进展展示，不作为正式科学结论。</span>
        </div>

        <div className="section">
          <div className="section-heading">
            <span className="eyebrow">共创时间线</span>
            <h2>最新共创观察</h2>
            <p>志愿者上传的最新记录正在进入地图、图鉴与场域信息卡。</p>
          </div>
          <ActivityFeed records={recent.slice(0, 5)} />
        </div>
      </section>

      <section className="section" id="map">
        <div className="section-heading">
          <span className="eyebrow">
            <MapPinned size={12} style={{ verticalAlign: "-1px", marginRight: 2 }} /> 蜜源地图
          </span>
          <h2>点开一座城市，看清它的边界与共创热点</h2>
          <p>
            点击市级边界查看城市汇总，地图点位会同步筛到该市。
            每一种植物与访花昆虫都来自志愿者的真实上传。
          </p>
        </div>
        <CommunityMap gardens={gardens} records={records} />
      </section>

      <section className="section" id="plants">
        <div className="section-heading">
          <span className="eyebrow">
            <Sprout size={12} style={{ verticalAlign: "-1px", marginRight: 2 }} /> 共创图鉴
          </span>
          <h2>由观察记录长出来的蜜源植物图鉴</h2>
          <p>
            点击任意植物卡片查看其分布、生境、访花关联与共创证据。
            这里的每一条信息都来自真实上传。
          </p>
        </div>
        <PlantGuide plants={plants} />
      </section>

      <section className="section" id="activity">
        <div className="section-heading">
          <span className="eyebrow">
            <Waves size={12} style={{ verticalAlign: "-1px", marginRight: 2 }} /> 伙伴动态
          </span>
          <h2>大家正在一起做什么</h2>
          <p>看看其他城市与伙伴最近在记录什么、发现了什么新的植物-访花关联。</p>
        </div>
        <PartnerFeed recent={recent} cities={cities} stories={stories} />
      </section>

      <section className="section" id="me">
        <div className="section-heading">
          <span className="eyebrow">
            <UserCircle2 size={12} style={{ verticalAlign: "-1px", marginRight: 2 }} /> 我的贡献
          </span>
          <h2>你的观察已经进入共创地图</h2>
          <p>
            顶部导航可以切换不同志愿者视角。下方展示当前志愿者上传的记录如何出现在
            地图、图鉴和场域信息卡中。
          </p>
        </div>
        <MyContribution contribution={contribution} />
      </section>

      <section className="section" id="insights">
        <ExpertInterpretation />
      </section>

      <section className="section" id="resources">
        <ResourceLibrary />
      </section>

      <footer className="app-footer">
        <span>深圳城市绿地传粉动物公民科学项目 · 实时展示 / 专家解读 / 公众参与</span>
        <span>
          数据更新于 {metadata.lastUpdated} · {metadata.recordCount} 条记录 ·{" "}
          {verification.verifiedPercent}% 已审核 · 当前为静态 demo 数据
        </span>
      </footer>
    </div>
  );
}
