import { useEffect, useMemo, useState } from "react";
import { MapPinned, Sprout, UserCircle2, Waves } from "lucide-react";
import observationsRaw from "./data/observations.json";
import summaryRaw from "./data/summary.json";
import type { Observation, Summary } from "./lib/types";
import {
  buildGardenGroups,
  getCitySpotlights,
  getContributionForObserver,
  getFeaturedStories,
  getObserverList,
  getPlantSummaries,
  getRecentObservations,
} from "./lib/observations";
import { HeroBlock } from "./components/SharedProgress";
import { ActivityFeed } from "./components/ActivityFeed";
import { CommunityMap } from "./components/CommunityMap";
import { PlantGuide } from "./components/PlantGuide";
import { PartnerFeed } from "./components/PartnerFeed";
import { MyContribution } from "./components/MyContribution";

const records = observationsRaw as Observation[];
const summary = summaryRaw as Summary;

type SectionKey = "home" | "map" | "plants" | "activity" | "me";

const sections: Array<{ key: SectionKey; label: string }> = [
  { key: "home", label: "共创首页" },
  { key: "map", label: "蜜源地图" },
  { key: "plants", label: "植物图鉴" },
  { key: "activity", label: "伙伴动态" },
  { key: "me", label: "我的贡献" },
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

  return (
    <div className="app-shell">
      <nav className="top-nav" aria-label="主导航">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            <Sprout size={16} />
          </span>
          城市蜜源共创地图
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
          observerCount={summary.observerCount}
          onJumpToMap={() => go("map")}
          onJumpToPlants={() => go("plants")}
        />

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
          <h2>到达一个花园，打开它的观察线索</h2>
          <p>
            点击地图点位查看场域信息卡。这里记录的每一种植物与访花昆虫，
            都来自志愿者的真实上传。
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

      <footer className="app-footer">
        <span>城市蜜源共创地图 · 共创任务优先 / 生态地图承载 / 个人贡献辅助</span>
        <span>数据源：志愿者上传数据 demo · 200 条记录 · 19 位共创伙伴 · 25 种蜜源植物</span>
      </footer>
    </div>
  );
}
