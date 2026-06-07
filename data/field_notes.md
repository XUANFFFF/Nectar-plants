# 数据字段说明

本项目使用志愿者上传的蜜源植物观察数据。原始数据来自 Excel，前端使用整理后的 `src/data/observations.json` 和 `src/data/summary.json`。

## 数据规模

- 观察记录：200 条
- 观察者：19 位
- 蜜源植物：25 种
- 科：19 个
- 城市：4 个
- 区县：32 个
- 生境类型：人工环境、野生环境
- 审核状态：已审核、待审核
- 来源类型：人工养育、野生物种

## 主要字段分组

### 记录标识

| 字段 | 含义 | 页面用途 |
|---|---|---|
| `id` | 观察记录 ID | 作为记录唯一标识 |
| `originalFilename` | 原始文件名 | 辅助追溯 |
| `datasetName` | 数据集名称 | 数据来源说明 |
| `datasetId` | 数据集 ID | 数据来源说明 |
| `license` | 许可证 | 开放使用说明 |
| `cstr` | CSTR 标识 | 数据追溯 |

### 图片与证据

| 字段 | 含义 | 页面用途 |
|---|---|---|
| `mediaUrl` | 代表图片 | 图鉴卡片、动态卡片、详情弹窗 |
| `mediaUrls` | 图片数组 | 后续可做图库 |
| `sourceMediaUrls` | 原始图片链接 | 数据追溯 |

### 观察者与时间

| 字段 | 含义 | 页面用途 |
|---|---|---|
| `observer` | 观察者名称 | 伙伴动态、我的贡献 |
| `observerId` | 观察者 ID | 后续可做账号关联 |
| `eventDate` | 观察日期 | 最新观察、近 30 天筛选 |
| `dateIdentified` | 识别日期 | 物种识别过程说明 |

### 物种信息

| 字段 | 含义 | 页面用途 |
|---|---|---|
| `chineseName` | 中文名 | 植物图鉴主标题 |
| `scientificName` | 学名 | 图鉴副标题 |
| `scientificNameId` | 学名 ID | 物种追溯 |
| `family` | 科拉丁名 | 物种信息 |
| `familyChineseName` | 科中文名 | 图鉴信息 |
| `genus` | 属拉丁名 | 物种信息 |
| `genusChineseName` | 属中文名 | 图鉴信息 |
| `authorship` | 命名人 | 后续百科详情 |
| `phylum` | 门拉丁名 | 分类信息 |
| `phylumChineseName` | 门中文名 | 分类信息 |

### 空间信息

| 字段 | 含义 | 页面用途 |
|---|---|---|
| `country` | 国家 | 数据范围说明 |
| `province` | 省份 | 地图范围 |
| `city` | 城市 | 城市筛选、城市摘要 |
| `county` | 区县 | 场域聚合、城市详情 |
| `longitude` | 经度 | 地图点位 |
| `latitude` | 纬度 | 地图点位 |
| `elevation` | 海拔 | 场域补充信息 |
| `locationId` | 位置 ID | 观察场域聚合 |
| `higherGeographyId` | 上级地理 ID | 地理追溯 |

### 生态与识别信息

| 字段 | 含义 | 页面用途 |
|---|---|---|
| `establishmentMeans` | 来源类型，如野生物种、人工养育 | 地图图层筛选 |
| `habitatType` | 生境类型 | 图鉴详情、场域说明 |
| `associatedTaxa` | 关联物种，如访花昆虫 | 伙伴动态、植物-昆虫故事 |
| `remarks` | 观察备注 | 详情补充 |
| `verbatimIdentification` | 原始识别文本 | 识别追溯 |
| `identifiedBy` | 识别人 | 数据可信度说明 |
| `identifiedById` | 识别人 ID | 识别追溯 |
| `verificationStatus` | 审核状态 | 后续可做质量提示 |

## 前端聚合逻辑

### 地图场域

按 `locationId` 聚合。如果缺少 `locationId`，使用 `city + county` 作为备用聚合键。每个场域计算平均经纬度、记录数、植物列表、访花昆虫列表、观察者列表和最新观察。

### 植物图鉴

按 `chineseName` 聚合。每张植物卡片展示记录数、城市、区县、访花昆虫、观察者、来源类型和代表图片。

### 我的贡献

按 `observer` 聚合。展示该观察者的记录数、物种数、区县数、城市数、场域数和贡献徽章。

### 城市摘要

按标准化城市名聚合。展示城市记录数、场域数、物种数、区县数、重点区县、重点植物和最新观察日期。

