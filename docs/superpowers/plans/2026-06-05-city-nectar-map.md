# City Nectar Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend prototype for “城市蜜源共创地图” that turns the Excel observation dataset into a public-facing, participant-centered exploration experience.

**Architecture:** Create a Vite + React + TypeScript single-page app. Convert the Excel workbook into a checked-in JSON dataset, then build focused UI modules for shared progress, map exploration, garden arrival cards, plant guide, community activity, and personal contribution.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, pandas/openpyxl for one-time data extraction, CSS modules or plain CSS, lucide-react icons.

---

## File Structure

- Create: `package.json` for scripts and dependencies.
- Create: `index.html` as the Vite entry HTML.
- Create: `src/main.tsx` to mount the app.
- Create: `src/App.tsx` for app-level navigation and page composition.
- Create: `src/styles.css` for global visual language and responsive layout.
- Create: `src/data/observations.json` generated from the Excel workbook.
- Create: `src/data/summary.json` generated aggregate metrics.
- Create: `scripts/extract-observations.py` to convert Excel into frontend-ready JSON.
- Create: `src/lib/types.ts` for shared data types.
- Create: `src/lib/observations.ts` for derived selectors and garden aggregation.
- Create: `src/lib/observations.test.ts` for selector and aggregation tests.
- Create: `src/components/SharedProgress.tsx` for the homepage progress strip.
- Create: `src/components/CommunityMap.tsx` for the map-like exploration view.
- Create: `src/components/GardenArrivalCard.tsx` for the field exploration popup.
- Create: `src/components/PlantGuide.tsx` for the community-built plant guide.
- Create: `src/components/ActivityFeed.tsx` for partner activity.
- Create: `src/components/MyContribution.tsx` for participant value display.
- Create: `src/App.test.tsx` for high-level app rendering checks.
- Modify: `.gitignore` to add `node_modules/`, `dist/`, and coverage output.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Modify: `.gitignore`

- [ ] **Step 1: Create package manifest**

Create `package.json` with:

```json
{
  "name": "city-nectar-map",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview --host 127.0.0.1"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "lucide-react": "^0.468.0",
    "vite": "^6.0.0",
    "typescript": "^5.6.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create Vite HTML entry**

Create `index.html` with:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>城市蜜源共创地图</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create React mount file**

Create `src/main.tsx` with:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 4: Create temporary app shell**

Create `src/App.tsx` with:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>城市蜜源共创地图</h1>
      <p>把每一条观察记录变成城市生态共创的一部分。</p>
    </main>
  );
}
```

- [ ] **Step 5: Create base CSS**

Create `src/styles.css` with:

```css
:root {
  color: #1f3328;
  background: #f4f7ee;
  font-family: "Noto Serif SC", "Source Han Serif SC", Georgia, serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 32px;
}
```

- [ ] **Step 6: Update ignored files**

Modify `.gitignore` to contain:

```gitignore
.superpowers/
node_modules/
dist/
coverage/
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 8: Verify scaffold builds**

Run: `npm run build`

Expected: Vite produces `dist/` with no TypeScript errors.

- [ ] **Step 9: Commit scaffold**

Run:

```bash
git add .gitignore package.json package-lock.json index.html src/main.tsx src/App.tsx src/styles.css
git commit -m "feat: scaffold city nectar map app"
```

## Task 2: Dataset Extraction

**Files:**
- Create: `scripts/extract-observations.py`
- Create: `src/data/observations.json`
- Create: `src/data/summary.json`

- [ ] **Step 1: Create extraction script**

Create `scripts/extract-observations.py` with:

```python
import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "志愿者上传数据_demo虚拟数据_170条_15名志愿者_非均分.xlsx"
OUT_DIR = ROOT / "src" / "data"


def clean(value):
    if pd.isna(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


def split_taxa(value):
    if pd.isna(value):
        return []
    return [part.strip() for part in str(value).split(",") if part.strip()]


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_excel(SOURCE)
    records = []

    for row in df.to_dict(orient="records"):
        records.append(
            {
                "id": clean(row["occurrenceID"]),
                "mediaUrl": clean(row["associatedMedia"]),
                "observer": clean(row["recordedBy"]),
                "observerId": clean(row["recordedByID"]),
                "eventDate": clean(row["eventDate"]),
                "scientificName": clean(row["scientificName"]),
                "chineseName": clean(row["chineseName"]),
                "establishmentMeans": clean(row["establishmentMeans"]),
                "locationId": clean(row["locationID"]),
                "city": clean(row["prefecture"]),
                "county": clean(row["county"]),
                "longitude": clean(row["decimalLongitude"]),
                "latitude": clean(row["decimalLatitude"]),
                "elevation": clean(row["elevationInMeters"]),
                "remarks": clean(row["occurrenceRemarks"]),
                "family": clean(row["family"]),
                "familyChineseName": clean(row["familyChineseName"]),
                "genus": clean(row["genus"]),
                "genusChineseName": clean(row["genusChineseName"]),
                "identifiedBy": clean(row["identifiedBy"]),
                "dateIdentified": clean(row["dateIdentified"]),
                "verificationStatus": clean(row["identificationVerificationStatus"]),
                "datasetName": clean(row["datasetName"]),
                "license": clean(row["license"]),
                "habitatType": clean(row["habitatType"]),
                "associatedTaxa": split_taxa(row["associatedTaxa"]),
            }
        )

    summary = {
        "recordCount": len(records),
        "observerCount": int(df["recordedBy"].nunique()),
        "speciesCount": int(df["chineseName"].nunique()),
        "familyCount": int(df["familyChineseName"].nunique()),
        "cityCount": int(df["prefecture"].nunique()),
        "countyCount": int(df["county"].nunique()),
        "pendingReviewCount": int((df["identificationVerificationStatus"] == "待审核").sum()),
        "approvedCount": int((df["identificationVerificationStatus"] == "已审核").sum()),
    }

    (OUT_DIR / "observations.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (OUT_DIR / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run extraction**

Run:

```bash
python scripts/extract-observations.py
```

Expected: `src/data/observations.json` and `src/data/summary.json` are created.

- [ ] **Step 3: Inspect generated counts**

Run:

```bash
python -c "import json; print(json.load(open('src/data/summary.json', encoding='utf-8')))"
```

Expected: output includes `"recordCount": 200`, `"observerCount": 19`, and `"speciesCount": 25`.

- [ ] **Step 4: Commit dataset pipeline**

Run:

```bash
git add scripts/extract-observations.py src/data/observations.json src/data/summary.json
git commit -m "feat: extract observation dataset"
```

## Task 3: Data Types and Selectors

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/observations.ts`
- Create: `src/lib/observations.test.ts`

- [ ] **Step 1: Write failing selector tests**

Create `src/lib/observations.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  buildGardenGroups,
  getContributionForObserver,
  getPlantSummaries,
  getRecentObservations,
} from "./observations";
import type { Observation } from "./types";

const records: Observation[] = [
  {
    id: "1",
    mediaUrl: "a.jpg",
    observer: "示例志愿者A",
    observerId: "a",
    eventDate: "2025-05-01T10:00:00",
    scientificName: "Asclepias curassavica",
    chineseName: "马利筋",
    establishmentMeans: "人工养育",
    locationId: "garden-1",
    city: "深圳市",
    county: "福田区",
    longitude: 114.03,
    latitude: 22.58,
    elevation: 20,
    remarks: null,
    family: "Apocynaceae",
    familyChineseName: "夹竹桃科",
    genus: "Asclepias",
    genusChineseName: "马利筋属",
    identifiedBy: "专家A",
    dateIdentified: "2025-05-02T10:00:00",
    verificationStatus: "已审核",
    datasetName: "深圳蜜源植物调查",
    license: "CC BY-NC 4.0",
    habitatType: "人工环境",
    associatedTaxa: ["Apis cerana cerana", "东方蜜蜂中华亚种"],
  },
  {
    id: "2",
    mediaUrl: "b.jpg",
    observer: "示例志愿者B",
    observerId: "b",
    eventDate: "2025-05-03T10:00:00",
    scientificName: "Duranta erecta",
    chineseName: "假连翘",
    establishmentMeans: "人工养育",
    locationId: "garden-1",
    city: "深圳市",
    county: "福田区",
    longitude: 114.031,
    latitude: 22.581,
    elevation: 21,
    remarks: null,
    family: "Verbenaceae",
    familyChineseName: "马鞭草科",
    genus: "Duranta",
    genusChineseName: "假连翘属",
    identifiedBy: "专家A",
    dateIdentified: "2025-05-04T10:00:00",
    verificationStatus: "待审核",
    datasetName: "深圳蜜源植物调查",
    license: "CC BY-NC 4.0",
    habitatType: "人工环境",
    associatedTaxa: ["Xylocopa", "木蜂属"],
  },
];

describe("observation selectors", () => {
  it("groups records into garden context cards", () => {
    const gardens = buildGardenGroups(records);
    expect(gardens).toHaveLength(1);
    expect(gardens[0].recordCount).toBe(2);
    expect(gardens[0].plantNames).toEqual(["假连翘", "马利筋"]);
    expect(gardens[0].pollinatorNames).toContain("木蜂属");
  });

  it("summarizes plants by observation count", () => {
    const plants = getPlantSummaries(records);
    expect(plants.map((plant) => plant.chineseName)).toEqual(["假连翘", "马利筋"]);
  });

  it("returns newest observations first", () => {
    const recent = getRecentObservations(records, 1);
    expect(recent[0].id).toBe("2");
  });

  it("describes one observer contribution", () => {
    const contribution = getContributionForObserver(records, "示例志愿者A");
    expect(contribution.recordCount).toBe(1);
    expect(contribution.speciesCount).toBe(1);
    expect(contribution.countyCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test -- src/lib/observations.test.ts`

Expected: fails because `src/lib/types.ts` and `src/lib/observations.ts` do not exist.

- [ ] **Step 3: Add shared types**

Create `src/lib/types.ts` with:

```ts
export type Observation = {
  id: string;
  mediaUrl: string;
  observer: string;
  observerId: string;
  eventDate: string;
  scientificName: string;
  chineseName: string;
  establishmentMeans: string;
  locationId: string;
  city: string;
  county: string;
  longitude: number;
  latitude: number;
  elevation: number | null;
  remarks: string | null;
  family: string;
  familyChineseName: string;
  genus: string;
  genusChineseName: string;
  identifiedBy: string;
  dateIdentified: string;
  verificationStatus: string;
  datasetName: string;
  license: string;
  habitatType: string | null;
  associatedTaxa: string[];
};

export type GardenGroup = {
  id: string;
  name: string;
  city: string;
  county: string;
  longitude: number;
  latitude: number;
  recordCount: number;
  plantNames: string[];
  pollinatorNames: string[];
  latestObservation: Observation;
  observations: Observation[];
};

export type PlantSummary = {
  chineseName: string;
  scientificName: string;
  familyChineseName: string;
  genusChineseName: string;
  recordCount: number;
  cities: string[];
  counties: string[];
  pollinators: string[];
  representative: Observation;
};
```

- [ ] **Step 4: Add selector implementation**

Create `src/lib/observations.ts` with:

```ts
import type { GardenGroup, Observation, PlantSummary } from "./types";

const collator = new Intl.Collator("zh-Hans-CN");

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => collator.compare(a, b));
}

function newestFirst(a: Observation, b: Observation) {
  return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
}

export function getRecentObservations(records: Observation[], limit = 8) {
  return [...records].sort(newestFirst).slice(0, limit);
}

export function buildGardenGroups(records: Observation[]): GardenGroup[] {
  const grouped = new Map<string, Observation[]>();

  for (const record of records) {
    const key = record.locationId || `${record.city}-${record.county}`;
    grouped.set(key, [...(grouped.get(key) ?? []), record]);
  }

  return [...grouped.entries()]
    .map(([id, group]) => {
      const sorted = [...group].sort(newestFirst);
      const latestObservation = sorted[0];
      return {
        id,
        name: `${latestObservation.county}蜜源观察区`,
        city: latestObservation.city,
        county: latestObservation.county,
        longitude: group.reduce((sum, item) => sum + item.longitude, 0) / group.length,
        latitude: group.reduce((sum, item) => sum + item.latitude, 0) / group.length,
        recordCount: group.length,
        plantNames: uniqueSorted(group.map((item) => item.chineseName)),
        pollinatorNames: uniqueSorted(group.flatMap((item) => item.associatedTaxa)),
        latestObservation,
        observations: sorted,
      };
    })
    .sort((a, b) => b.recordCount - a.recordCount);
}

export function getPlantSummaries(records: Observation[]): PlantSummary[] {
  const grouped = new Map<string, Observation[]>();

  for (const record of records) {
    grouped.set(record.chineseName, [...(grouped.get(record.chineseName) ?? []), record]);
  }

  return [...grouped.entries()]
    .map(([chineseName, group]) => {
      const sorted = [...group].sort(newestFirst);
      const representative = sorted[0];
      return {
        chineseName,
        scientificName: representative.scientificName,
        familyChineseName: representative.familyChineseName,
        genusChineseName: representative.genusChineseName,
        recordCount: group.length,
        cities: uniqueSorted(group.map((item) => item.city)),
        counties: uniqueSorted(group.map((item) => item.county)),
        pollinators: uniqueSorted(group.flatMap((item) => item.associatedTaxa)),
        representative,
      };
    })
    .sort((a, b) => b.recordCount - a.recordCount || collator.compare(a.chineseName, b.chineseName));
}

export function getContributionForObserver(records: Observation[], observer: string) {
  const ownRecords = records.filter((record) => record.observer === observer);
  return {
    observer,
    recordCount: ownRecords.length,
    speciesCount: new Set(ownRecords.map((record) => record.chineseName)).size,
    countyCount: new Set(ownRecords.map((record) => record.county)).size,
    latestRecords: getRecentObservations(ownRecords, 4),
  };
}
```

- [ ] **Step 5: Run selector tests**

Run: `npm run test -- src/lib/observations.test.ts`

Expected: all tests pass.

- [ ] **Step 6: Commit data selectors**

Run:

```bash
git add src/lib/types.ts src/lib/observations.ts src/lib/observations.test.ts
git commit -m "feat: add observation selectors"
```

## Task 4: Homepage and Shared Progress

**Files:**
- Create: `src/components/SharedProgress.tsx`
- Create: `src/components/ActivityFeed.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write app rendering test**

Create `src/App.test.tsx` with:

```tsx
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the participant-centered homepage", () => {
    render(<App />);
    expect(screen.getByText("城市蜜源共创地图")).toBeInTheDocument();
    expect(screen.getByText("我们一起点亮城市里的蜜源线索")).toBeInTheDocument();
    expect(screen.getByText("最新共创观察")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test and verify failure**

Run: `npm run test -- src/App.test.tsx`

Expected: fails because the final homepage text does not exist yet.

- [ ] **Step 3: Create progress component**

Create `src/components/SharedProgress.tsx` with:

```tsx
import { Flower2, MapPinned, UsersRound, Waypoints } from "lucide-react";

type SharedProgressProps = {
  recordCount: number;
  observerCount: number;
  speciesCount: number;
  countyCount: number;
};

const items = [
  { key: "recordCount", label: "观察记录", icon: Waypoints },
  { key: "speciesCount", label: "蜜源植物", icon: Flower2 },
  { key: "countyCount", label: "覆盖区县", icon: MapPinned },
  { key: "observerCount", label: "共创伙伴", icon: UsersRound },
] as const;

export function SharedProgress(props: SharedProgressProps) {
  return (
    <section className="progress-grid" aria-label="共创进展">
      {items.map(({ key, label, icon: Icon }) => (
        <article className="progress-item" key={key}>
          <Icon aria-hidden="true" />
          <strong>{props[key]}</strong>
          <span>{label}</span>
        </article>
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Create activity feed component**

Create `src/components/ActivityFeed.tsx` with:

```tsx
import type { Observation } from "../lib/types";

type ActivityFeedProps = {
  records: Observation[];
};

export function ActivityFeed({ records }: ActivityFeedProps) {
  return (
    <section className="activity-panel">
      <div className="section-heading">
        <span>社区动态</span>
        <h2>最新共创观察</h2>
      </div>
      <div className="activity-list">
        {records.map((record) => (
          <article className="activity-row" key={record.id}>
            <img src={record.mediaUrl} alt={`${record.chineseName}观察照片`} />
            <div>
              <strong>{record.observer}</strong>
              <p>
                在{record.city}{record.county}记录了{record.chineseName}
              </p>
              <small>{new Date(record.eventDate).toLocaleString("zh-CN")}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Compose homepage**

Modify `src/App.tsx` to:

```tsx
import observations from "./data/observations.json";
import summary from "./data/summary.json";
import { ActivityFeed } from "./components/ActivityFeed";
import { SharedProgress } from "./components/SharedProgress";
import { getRecentObservations } from "./lib/observations";
import type { Observation } from "./lib/types";

const records = observations as Observation[];
const recentRecords = getRecentObservations(records, 5);

export default function App() {
  return (
    <main className="app-shell">
      <nav className="top-nav" aria-label="主导航">
        <strong>城市蜜源共创地图</strong>
        <a href="#map">蜜源地图</a>
        <a href="#plants">植物图鉴</a>
        <a href="#me">我的贡献</a>
      </nav>

      <section className="hero-band">
        <div className="hero-copy">
          <span className="eyebrow">公众科学 × 城市自然观察</span>
          <h1>城市蜜源共创地图</h1>
          <p>我们一起点亮城市里的蜜源线索</p>
        </div>
        <SharedProgress
          recordCount={summary.recordCount}
          observerCount={summary.observerCount}
          speciesCount={summary.speciesCount}
          countyCount={summary.countyCount}
        />
      </section>

      <ActivityFeed records={recentRecords} />
    </main>
  );
}
```

- [ ] **Step 6: Add homepage styles**

Append to `src/styles.css`:

```css
.top-nav {
  align-items: center;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 1180px;
  padding: 18px 0;
}

.top-nav a {
  color: #385344;
  text-decoration: none;
}

.hero-band {
  background:
    linear-gradient(120deg, rgba(245, 249, 235, 0.95), rgba(219, 239, 205, 0.88)),
    radial-gradient(circle at 20% 20%, rgba(243, 196, 83, 0.32), transparent 34%);
  border: 1px solid rgba(73, 104, 78, 0.2);
  display: grid;
  gap: 28px;
  grid-template-columns: 1fr;
  margin: 0 auto;
  max-width: 1180px;
  min-height: 420px;
  padding: 52px;
}

.hero-copy h1 {
  font-size: 56px;
  line-height: 1.05;
  margin: 12px 0;
}

.hero-copy p {
  color: #486352;
  font-size: 22px;
  margin: 0;
}

.eyebrow,
.section-heading span {
  color: #8a5a18;
  font-size: 13px;
  font-weight: 700;
}

.progress-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.progress-item {
  background: rgba(255, 255, 255, 0.66);
  border: 1px solid rgba(73, 104, 78, 0.18);
  min-height: 130px;
  padding: 18px;
}

.progress-item svg {
  color: #537f4d;
}

.progress-item strong {
  display: block;
  font-size: 34px;
  margin-top: 16px;
}

.progress-item span {
  color: #486352;
}

.activity-panel {
  margin: 48px auto;
  max-width: 1180px;
}

.section-heading h2 {
  font-size: 32px;
  margin: 6px 0 18px;
}

.activity-list {
  display: grid;
  gap: 12px;
}

.activity-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(73, 104, 78, 0.14);
  display: grid;
  gap: 16px;
  grid-template-columns: 86px 1fr;
  padding: 12px;
}

.activity-row img {
  aspect-ratio: 1;
  object-fit: cover;
  width: 86px;
}

.activity-row p {
  margin: 6px 0;
}

.activity-row small {
  color: #667569;
}
```

- [ ] **Step 7: Run homepage test**

Run: `npm run test -- src/App.test.tsx`

Expected: test passes.

- [ ] **Step 8: Commit homepage**

Run:

```bash
git add src/App.test.tsx src/App.tsx src/components/SharedProgress.tsx src/components/ActivityFeed.tsx src/styles.css
git commit -m "feat: add shared progress homepage"
```

## Task 5: Map and Garden Arrival Card

**Files:**
- Create: `src/components/GardenArrivalCard.tsx`
- Create: `src/components/CommunityMap.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create garden arrival card**

Create `src/components/GardenArrivalCard.tsx` with:

```tsx
import { Camera, Flower2, Navigation, Sparkles } from "lucide-react";
import type { GardenGroup } from "../lib/types";

type GardenArrivalCardProps = {
  garden: GardenGroup;
};

export function GardenArrivalCard({ garden }: GardenArrivalCardProps) {
  const plants = garden.plantNames.slice(0, 4).join("、");
  const pollinators = garden.pollinatorNames.slice(0, 4).join("、");

  return (
    <aside className="arrival-card" aria-label="到场探索卡">
      <span className="eyebrow">你已进入</span>
      <h2>{garden.name}</h2>
      <p>
        这里记录了{plants}等蜜源植物，也出现过{pollinators || "蜂蝶类群"}。
      </p>
      <div className="arrival-stats">
        <span>{garden.recordCount} 条记录</span>
        <span>{garden.plantNames.length} 种植物</span>
        <span>{garden.pollinatorNames.length} 个关联类群</span>
      </div>
      <div className="field-actions">
        <button type="button">
          <Flower2 aria-hidden="true" />
          寻找开花蜜源
        </button>
        <button type="button">
          <Sparkles aria-hidden="true" />
          观察蜂蝶访花
        </button>
        <button type="button">
          <Camera aria-hidden="true" />
          补充一条记录
        </button>
      </div>
      <div className="latest-note">
        <Navigation aria-hidden="true" />
        最近由{garden.latestObservation.observer}记录了{garden.latestObservation.chineseName}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create community map component**

Create `src/components/CommunityMap.tsx` with:

```tsx
import { useState } from "react";
import { GardenArrivalCard } from "./GardenArrivalCard";
import type { GardenGroup } from "../lib/types";

type CommunityMapProps = {
  gardens: GardenGroup[];
};

export function CommunityMap({ gardens }: CommunityMapProps) {
  const [selectedId, setSelectedId] = useState(gardens[0]?.id);
  const selected = gardens.find((garden) => garden.id === selectedId) ?? gardens[0];

  return (
    <section className="map-section" id="map">
      <div className="section-heading">
        <span>蜜源地图</span>
        <h2>到达一个花园，打开它的观察线索</h2>
      </div>
      <div className="map-layout">
        <div className="map-stage" aria-label="蜜源观察点地图">
          {gardens.slice(0, 18).map((garden, index) => (
            <button
              className={`map-point ${garden.id === selected.id ? "is-active" : ""}`}
              key={garden.id}
              onClick={() => setSelectedId(garden.id)}
              style={{
                left: `${10 + ((index * 17) % 76)}%`,
                top: `${18 + ((index * 23) % 62)}%`,
              }}
              type="button"
            >
              <span>{garden.recordCount}</span>
            </button>
          ))}
        </div>
        {selected ? <GardenArrivalCard garden={selected} /> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add map to app**

Modify `src/App.tsx` imports:

```tsx
import { CommunityMap } from "./components/CommunityMap";
import { buildGardenGroups, getRecentObservations } from "./lib/observations";
```

Add after `recentRecords`:

```tsx
const gardens = buildGardenGroups(records);
```

Render after hero band:

```tsx
<CommunityMap gardens={gardens} />
```

- [ ] **Step 4: Add map styles**

Append to `src/styles.css`:

```css
.map-section {
  margin: 52px auto;
  max-width: 1180px;
}

.map-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
}

.map-stage {
  background:
    linear-gradient(135deg, rgba(93, 132, 83, 0.26), rgba(180, 207, 135, 0.2)),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.28) 0 1px, transparent 1px 18px);
  border: 1px solid rgba(73, 104, 78, 0.18);
  min-height: 430px;
  overflow: hidden;
  position: relative;
}

.map-point {
  align-items: center;
  background: #fff8d8;
  border: 2px solid #6d8e52;
  border-radius: 999px;
  color: #21402f;
  cursor: pointer;
  display: flex;
  height: 44px;
  justify-content: center;
  position: absolute;
  transform: translate(-50%, -50%);
  width: 44px;
}

.map-point.is-active {
  background: #f4c95d;
  box-shadow: 0 0 0 8px rgba(244, 201, 93, 0.28);
}

.arrival-card {
  background: #ffffff;
  border: 1px solid rgba(73, 104, 78, 0.16);
  padding: 24px;
}

.arrival-card h2 {
  margin: 8px 0;
}

.arrival-stats {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, 1fr);
  margin: 18px 0;
}

.arrival-stats span {
  background: #f4f7ee;
  padding: 10px;
}

.field-actions {
  display: grid;
  gap: 10px;
}

.field-actions button {
  align-items: center;
  background: #244634;
  border: 0;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  gap: 10px;
  padding: 12px 14px;
}

.latest-note {
  align-items: center;
  color: #486352;
  display: flex;
  gap: 8px;
  margin-top: 18px;
}
```

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm run test
npm run build
```

Expected: tests and build pass.

- [ ] **Step 6: Commit map interaction**

Run:

```bash
git add src/App.tsx src/components/CommunityMap.tsx src/components/GardenArrivalCard.tsx src/styles.css
git commit -m "feat: add garden arrival map interaction"
```

## Task 6: Plant Guide and Contribution Views

**Files:**
- Create: `src/components/PlantGuide.tsx`
- Create: `src/components/MyContribution.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create plant guide**

Create `src/components/PlantGuide.tsx` with:

```tsx
import type { PlantSummary } from "../lib/types";

type PlantGuideProps = {
  plants: PlantSummary[];
};

export function PlantGuide({ plants }: PlantGuideProps) {
  return (
    <section className="plant-guide" id="plants">
      <div className="section-heading">
        <span>共创图鉴</span>
        <h2>由观察记录长出来的蜜源植物图鉴</h2>
      </div>
      <div className="plant-grid">
        {plants.slice(0, 8).map((plant) => (
          <article className="plant-card" key={plant.chineseName}>
            <img src={plant.representative.mediaUrl} alt={`${plant.chineseName}照片`} />
            <div>
              <h3>{plant.chineseName}</h3>
              <p>{plant.scientificName}</p>
              <small>
                {plant.familyChineseName} · {plant.recordCount} 条共创记录
              </small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create contribution view**

Create `src/components/MyContribution.tsx` with:

```tsx
import type { Observation } from "../lib/types";

type MyContributionProps = {
  contribution: {
    observer: string;
    recordCount: number;
    speciesCount: number;
    countyCount: number;
    latestRecords: Observation[];
  };
};

export function MyContribution({ contribution }: MyContributionProps) {
  return (
    <section className="my-contribution" id="me">
      <div className="section-heading">
        <span>我的贡献</span>
        <h2>{contribution.observer}的观察已经进入共创地图</h2>
      </div>
      <div className="contribution-layout">
        <div className="contribution-score">
          <strong>{contribution.recordCount}</strong>
          <span>条观察记录</span>
          <p>
            覆盖 {contribution.countyCount} 个区县，贡献 {contribution.speciesCount} 种蜜源植物。
          </p>
        </div>
        <div className="contribution-records">
          {contribution.latestRecords.map((record) => (
            <article key={record.id}>
              <span>{record.county}</span>
              <strong>{record.chineseName}</strong>
              <small>{new Date(record.eventDate).toLocaleDateString("zh-CN")}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire plant and contribution data**

Modify `src/App.tsx` imports:

```tsx
import { MyContribution } from "./components/MyContribution";
import { PlantGuide } from "./components/PlantGuide";
import {
  buildGardenGroups,
  getContributionForObserver,
  getPlantSummaries,
  getRecentObservations,
} from "./lib/observations";
```

Add derived constants:

```tsx
const plants = getPlantSummaries(records);
const contribution = getContributionForObserver(records, records[0]?.observer ?? "");
```

Render after `CommunityMap`:

```tsx
<PlantGuide plants={plants} />
<MyContribution contribution={contribution} />
```

- [ ] **Step 4: Add plant and contribution styles**

Append to `src/styles.css`:

```css
.plant-guide,
.my-contribution {
  margin: 52px auto;
  max-width: 1180px;
}

.plant-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.plant-card {
  background: #ffffff;
  border: 1px solid rgba(73, 104, 78, 0.14);
  overflow: hidden;
}

.plant-card img {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
}

.plant-card div {
  padding: 14px;
}

.plant-card h3 {
  margin: 0 0 6px;
}

.plant-card p,
.plant-card small {
  color: #53685a;
}

.contribution-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: 0.8fr 1.2fr;
}

.contribution-score {
  background: #244634;
  color: #ffffff;
  padding: 28px;
}

.contribution-score strong {
  display: block;
  font-size: 64px;
  line-height: 1;
}

.contribution-records {
  display: grid;
  gap: 10px;
}

.contribution-records article {
  background: #ffffff;
  border: 1px solid rgba(73, 104, 78, 0.14);
  display: grid;
  gap: 6px;
  padding: 14px;
}
```

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm run test
npm run build
```

Expected: tests and build pass.

- [ ] **Step 6: Commit plant guide and contribution views**

Run:

```bash
git add src/App.tsx src/components/PlantGuide.tsx src/components/MyContribution.tsx src/styles.css
git commit -m "feat: add plant guide and contribution views"
```

## Task 7: Responsive Polish and Local Verification

**Files:**
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add responsive CSS**

Append to `src/styles.css`:

```css
@media (max-width: 900px) {
  .app-shell {
    padding: 18px;
  }

  .top-nav {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-band {
    min-height: auto;
    padding: 28px;
  }

  .hero-copy h1 {
    font-size: 38px;
  }

  .progress-grid,
  .plant-grid,
  .map-layout,
  .contribution-layout {
    grid-template-columns: 1fr;
  }

  .arrival-stats {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Extend app test for major sections**

Modify `src/App.test.tsx` test body to:

```tsx
render(<App />);
expect(screen.getByText("城市蜜源共创地图")).toBeInTheDocument();
expect(screen.getByText("我们一起点亮城市里的蜜源线索")).toBeInTheDocument();
expect(screen.getByText("最新共创观察")).toBeInTheDocument();
expect(screen.getByText("到达一个花园，打开它的观察线索")).toBeInTheDocument();
expect(screen.getByText("由观察记录长出来的蜜源植物图鉴")).toBeInTheDocument();
expect(screen.getByText(/的观察已经进入共创地图/)).toBeInTheDocument();
```

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run test
npm run build
```

Expected: all tests pass and the production build completes.

- [ ] **Step 4: Start local dev server**

Run: `npm run dev`

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 5: Manually verify in browser**

Open the dev server URL and verify:

- Homepage shows shared progress and activity.
- Map points can be clicked.
- Arrival card changes when a different point is selected.
- Plant guide images load.
- My contribution section is visible.
- Mobile viewport stacks sections without text overlap.

- [ ] **Step 6: Commit polish**

Run:

```bash
git add src/App.test.tsx src/styles.css
git commit -m "chore: polish responsive prototype"
```

## Task 8: Final Repository Check

**Files:**
- Read-only check of repository state.

- [ ] **Step 1: Check status**

Run: `git status --short --branch`

Expected: only the original source materials may remain untracked unless the user has asked to commit them.

- [ ] **Step 2: Review latest commits**

Run: `git log --oneline -5`

Expected: implementation commits appear after the design and plan commits.

- [ ] **Step 3: Report result**

Tell the user:

- The dev server URL.
- Which sections are implemented.
- Which verification commands passed.
- Whether the original Excel and Markdown source files remain untracked.

## Self-Review

- Spec coverage: The plan covers the common homepage, participant-centered map, arrival card, plant guide, community activity, my contribution, data extraction, and responsive verification.
- Scope control: The plan excludes real login, real geolocation permission, backend review, and write-back upload flow, matching the approved prototype scope.
- Placeholder scan: The plan contains concrete files, commands, test snippets, implementation snippets, and expected results.
- Type consistency: `Observation`, `GardenGroup`, and `PlantSummary` are defined before use and reused consistently across selectors and components.
