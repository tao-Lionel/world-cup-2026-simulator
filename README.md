# 2026 世界杯夺冠概率模拟器

当前为 `v1.1.0` 最终发布版：核心模拟、数据快照、球队信息模块、审计脚本、免责声明和 CI 校验已经收口，可作为开源项目使用。高频数据已于 2026-06-12 刷新；发布说明见 `RELEASE.md`。

这是一个离线单页模拟器，基于 `deep-research-report.md` 的建模建议做成：

- 2026 新赛制：48 队、12 个小组。
- 输出概率分布，而不是单一冠军断言。
- 支持选择任意两队进行单场比分预测，输出 90 分钟胜平负概率、平均进球和最可能比分 Top 5。
- 小组赛使用进球分布模拟，前二名和 8 个最佳第三名出线。
- 淘汰赛使用 FIFA 公布的 73-104 号固定赛程树；第三名席位按 495 种晋级组合固定映射表分配，平局后进入点球。
- 综合强度由 FIFA 排名/积分、Elo 快照、夺冠赔率、近况、世预赛表现、世界杯路径经验、阵容价值、年龄、伤病风险、俱乐部分布、本季俱乐部表现、球队氛围、入境旅行、组赛旅行和休息天数合成。
- 数据面板会同时显示字段覆盖、平均可信度、可核验字段数和代理/人工字段数，避免把代理指标误读成官方数据。
- 支持随机种子；同一 seed、同一设置和同一数据快照可以复现模拟结果，导出的 CSV 也会带上 seed。
- 概率结果显示 Monte Carlo 95% 置信区间，CSV 同步导出各阶段概率的上下界。
- 支持点击排名表、小组卡片和综合分编辑列表里的球队，查看球队信息、模型因子、阵容汇总和球员明细。
- 48 队综合分仍可手动编辑，便于替换成更准确的 Elo、赔率、阵容或自建模型分数。
- `data/` 目录保存球队因子、来源清单、模型权重和历届冠军路径摘要，方便后续替换真实数据源。
- FIFA 排名/积分已拆为 2026-04-01 官方快照文件，可单独回写模型。
- Elo 已从手工代理替换为 2026-06-12 的 International-football.net / eloratings.net 快照。
- 夺冠赔率已从手工代理替换为 Yahoo Sports 发布的 2026-06-01 BetMGM 全 48 队市场快照。
- 近况已从手工代理替换为每队最近 10 场国家队比赛的计算快照。
- 世预赛表现已从公开国际赛果库生成 48 队资格赛表现；主办国按 host-exempt baseline 处理。
- 历史对阵已新增 `data/head_to_head_summary.csv` 和浏览器运行用的 `data/head_to_head_summary.js`，覆盖 48 队 1128 个两两组合，用于单场预测解释。
- 历史路径难度已从手工代理替换为 48 队世界杯历史记录特征快照。
- 入境旅行距离、入境时区差、小组赛旅行距离、休息天数、时区跨度、跨境次数、海拔和比赛日天气/场馆环境负担已由 FIFA 小组赛赛程、场馆坐标、代表性出发地、Open-Meteo 预报和场馆地理快照计算，不再使用纯手工代理值。
- 淘汰赛会动态计算路径疲劳：每场按上一场/小组末战所在地、比赛日期、旅行距离、休息天数、时区变化和场馆环境变化做小幅强度调整。
- 已新增 `data/third_place_assignment_map.csv` 和浏览器运行用的 `data/third_place_assignment_map.js`，把 495 种第三名出线组合固定为可审计映射，不再由运行时第三名积分排序临时决定对位。
- 名单公告状态已拆到 `data/squad_announcement_status.csv`；截至 2026-06-02，本地已标记 48 队 FIFA 最终名单。
- 已新增 `data/squads_2026.csv`，从 FIFA 官方名单 PDF 和公开 squad tracker 导入 48 队、1248 名当前在册球员；当前 48 队均为 26 人。
- 已新增浏览器运行用的 `data/squads_2026.js`，让直接打开 `index.html` 时也能查看球员级阵容信息。
- 已新增 `data/squad_import_candidates.csv`，记录 tracker 已解析但仍需核验来源的候选名单，避免把初选名单误导入。
- 已新增 `data/player_availability_watchlist.csv`，把已核验的伤病缺席、停赛、伤愈入选等可用性信息映射到球员行，并在无法匹配球员行时作为队级健康风险惩罚。
- 阵容身价、平均年龄、伤病风险和俱乐部分布已拆到 `data/squad_profile_snapshot.csv`；1116 名球员使用 Transfermarkt 球员页身价，其余 132 名使用队级总值分配代理。
- 已新增 `data/player_club_season_snapshot.csv`，从 Transfermarkt performance-game API 生成 2025/26 俱乐部赛季表现和主力角色评分；1199 名球员有逐场表现数据，其余 49 名使用名单角色、身价、国家队资历和可用性代理。
- 已新增 `data/squad_club_season_profile.csv`，把球员本季表现聚合成 48 队 `clubSeasonScore`，并以 4% 权重接入综合强度模型。
- 已提供 `data/squads_2026_template.csv` 和聚合脚本，后续名单修正填入后可自动生成阵容身价、平均年龄、伤病风险和俱乐部分布。
- 球队氛围已拆成 `data/team_context_snapshot.csv`，由领导连续性、教练稳定、近期势头和压力风险合成，仍保持低权重。

## 使用方式

需要使用一键数据刷新时，在当前目录运行：

```bash
npm run dev
```

然后访问 `http://127.0.0.1:8000`，点击页面顶部的“刷新数据”。刷新会依次更新最终名单、身价、球员本季表现、Elo、近期状态、世预赛/历史对阵、赔率和天气，重建模型并运行完整校验；任一步失败都会恢复刷新前的数据。

只使用模拟功能时，也可以直接在浏览器打开 `index.html`。浏览器直接打开的页面不能执行本地 Node.js 刷新脚本。

## 本地校验

项目不需要安装第三方依赖。修改代码或数据后，建议运行：

```bash
npm test
```

它会依次执行脚本语法检查、数据完整性检查和模拟器核心链路验证。GitHub Actions 也会在 push / pull request 时运行同一套校验。

## 注意

当前版本是探索型概率工具。淘汰赛路径已接入 FIFA 固定 match-number bracket；第三名席位已展开为 495 种组合映射表。该表由 FIFA 公布的 32 强候选占位符生成，用于保证模拟器稳定可复现；若后续 FIFA 发布逐组合官方表，应以官方表替换。

数据层已经扩展为多来源球队画像，但并非所有字段都是官方最终数据：FIFA 最终名单已接入，Transfermarkt 身价、球员本季俱乐部表现、Elo、世预赛/历史对阵和 Open-Meteo 天气为 2026-06-12 快照，伤病、氛围、赛程疲劳、未匹配球员身价和少量未匹配球员表现仍会在赛前持续变化，目前用可替换的快照/代理指标承接。CSV 导出会包含 `data_quality`、`source_backed_fields` 和 `proxy_fields`，字段来源和可信边界见 `DATA_SOURCES.md`。

本项目不是 FIFA 官方产品，也不构成博彩建议。完整免责声明见 `DISCLAIMER.md`。

## 数据快照

命令行一键刷新全部高频数据：

```bash
npm run refresh:data
```

从 `app.js` 重新导出审计数据：

```bash
node scripts/export-data-snapshots.mjs
```

校验模拟器核心链路：

```bash
node scripts/validate-simulator.mjs
```

导出并回写 FIFA 排名快照：

```bash
node scripts/export-fifa-ranking-snapshot.mjs
node scripts/apply-fifa-ranking-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

重新计算并写回小组赛旅行/休息因子：

```bash
node scripts/compute-schedule-factors.mjs
node scripts/apply-schedule-factors.mjs
node scripts/export-data-snapshots.mjs
```

刷新并写回 Elo 快照：

```bash
node scripts/fetch-elo-snapshot.mjs
node scripts/apply-elo-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

生成并写回赔率快照：

```bash
node scripts/fetch-odds-snapshot.mjs
node scripts/build-odds-snapshot.mjs
node scripts/apply-odds-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

刷新并写回近况快照：

```bash
node scripts/fetch-recent-form.mjs
node scripts/apply-form-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

生成并写回世预赛表现，同时重建历史对阵快照：

```bash
node scripts/build-international-context.mjs
node scripts/apply-qualifying-performance.mjs
node scripts/export-data-snapshots.mjs
```

生成并写回历史路径快照：

```bash
node scripts/build-wc-path-snapshot.mjs
node scripts/apply-wc-path-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

导出并回写阵容画像：

```bash
node scripts/export-squad-profiles.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

回写 FIFA 最终名单公告状态：

```bash
node scripts/apply-squad-announcement-status.mjs
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

从 Wikipedia squad tracker 抓取已确认 23-26 人最终名单并生成球员级 CSV：

```bash
node scripts/fetch-wikipedia-squads.mjs
node scripts/build-squad-import-candidates.mjs
node scripts/enrich-squad-player-proxies.mjs
node scripts/apply-player-availability.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-club-season-profile.mjs
node scripts/apply-squad-club-season-profile.mjs
node scripts/build-squad-browser-data.mjs
node scripts/apply-squad-announcement-status.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

应用 FIFA 官方名单 PDF 中对本地 tracker 缺口的覆盖：

```bash
node scripts/apply-fifa-official-squad-overrides.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-browser-data.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

刷新 Transfermarkt 球队/球员身价快照：

```bash
node scripts/fetch-transfermarkt-market-values.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-browser-data.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

刷新 Open-Meteo 小组赛天气快照并回写场馆环境负担：

```bash
node scripts/fetch-weather-snapshot.mjs
node scripts/apply-schedule-factors.mjs
node scripts/export-data-snapshots.mjs
```

球员级名单填好后，从名单聚合阵容画像并回写：

```bash
node scripts/create-squad-template.mjs
node scripts/apply-player-availability.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-browser-data.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

刷新球员可用性 watchlist 并重算伤病风险：

```bash
node scripts/apply-player-availability.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-browser-data.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

生成并写回球队氛围/上下文快照：

```bash
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```
