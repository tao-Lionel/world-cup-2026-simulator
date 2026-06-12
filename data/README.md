# 数据层说明

这个目录是模拟器的数据审计层。当前前端仍从 `app.js` 读取数据，下面这些文件用于核对来源、导出、后续替换代理字段。

## 文件

- `team_factors_snapshot.csv` / `team_factors_snapshot.json`：48 支球队当前因子快照；CSV 同时导出综合分、字段覆盖率和数据可信度。
- `source_manifest.csv`：每个因子的来源等级、可信权重和来源说明。
- `model_weights.csv`：综合强度模型的权重。
- `fifa_ranking_snapshot.csv`：48 队 FIFA/Coca-Cola 男足世界排名官方快照，日期为 2026-04-01。
- `odds_market_raw.csv`：Yahoo Sports 发布的 BetMGM 2026-06-01 全 48 队冠军赔率原始表。
- `odds_snapshot.csv`：BetMGM 单机构美式赔率及其隐含概率快照。
- `sporttery_football_odds_snapshot.json` / `sporttery_football_odds_snapshot.js`：中国竞彩网世界杯足球固定奖金快照，包含胜平负、让球胜平负、总进球、比分和半全场等当前接口返回玩法。
- `elo_snapshot.csv`：48 队 2026-06-12 Elo Score 快照，来自 International-football.net 国家页。
- `recent_matches_2024_2026.csv`：48 队最近 10 场国家队比赛明细。
- `recent_goal_profiles.json` / `recent_goal_profiles.js`：由近赛进球、失球和总进球聚合的免费总进球画像，用于竞彩总进球调校。
- `form_snapshot.csv`：由近赛结果、净胜球和时间衰减计算出的 form。
- `qualifying_performance.csv`：48 队世预赛表现快照，含比赛数、胜平负、进失球、客场表现和 `qualifyingScore`。
- `head_to_head_summary.csv`：48 队 1128 个两两组合的历史对阵摘要。
- `head_to_head_summary.js`：浏览器运行用的历史对阵摘要，由 `head_to_head_summary.csv` 同源生成。
- `champion_paths_summary.csv`：从 `deep-research-report.md` 整理出的 1930-2022 历届冠军路径摘要。
- `world_cup_history_raw.csv`：48 队世界杯历史记录，包含出场次数、总战绩、最佳成绩和 2022 成绩。
- `wc_path_features.csv`：由历史记录重算出的路径经验/历史难度特征分。
- `group_stage_schedule.csv`：72 场 2026 小组赛日期、对阵和场馆。
- `knockout_schedule.csv`：73-104 号淘汰赛固定赛程树，含轮次、日期、场馆和晋级路径。
- `third_place_assignment_map.csv`：495 种第三名出线组合到 8 个 32 强第三名占位符的固定映射。
- `third_place_assignment_map.js`：浏览器运行时使用的第三名映射表，由 `third_place_assignment_map.csv` 同源生成。
- `venues.csv`：16 个承办场馆坐标、6 月时区、海拔和场馆环境负担估计。
- `team_travel_origins.csv`：48 队代表性出发地、坐标和 6 月 UTC offset，用于估计入境旅行距离与时区差。
- `schedule_travel.csv`：按小组赛场馆序列计算出的每队入境距离、入境时区差、组赛移动距离、休息、时区跨度、跨境、海拔和环境负担。
- `match_weather_snapshot.csv`：小组赛逐场天气快照；Open-Meteo 可预报日期使用真实预报，超出预报窗的比赛保留场馆环境 baseline。
- `schedule_weather.csv`：按球队聚合的小组赛平均天气/环境负担，用于回写 `schedule_travel.csv` 的 `avg_environment_load`。
- `team_path_context.csv`：每队小组赛末战日期、场馆和时区，用作淘汰赛动态路径疲劳的初始状态。
- `squad_profile_snapshot.csv`：48 队最终名单阵容画像，承接身价、年龄、伤病风险、俱乐部分布和名单状态。
- `squad_announcement_status.csv`：48 队名单公告状态，当前均标记为 2026-06-02 FIFA 最终名单确认。
- `squads_2026.csv`：从 FIFA 官方名单 PDF 和公开 squad tracker 导入的球员级名单行，当前覆盖 48 队、1248 名在册球员；48 队均为 26 人。
- `squads_2026.js`：浏览器运行用的球员级名单快照，由 `squads_2026.csv` 生成。
- `fifa_official_squad_overrides.csv`：FIFA 官方 PDF 与本地 tracker 的缺口覆盖，目前用于补齐 Austria、Canada 和 Jordan 各 1 名球员。
- `transfermarkt_team_market_values.csv`：Transfermarkt 2026 世界杯参赛队总身价、平均年龄、外援比例和球队页入口。
- `transfermarkt_player_market_values.csv`：Transfermarkt 国家队明细页解析出的球员级身价快照。
- `player_club_season_snapshot.csv`：1248 名球员的 2025/26 俱乐部赛季表现、主力角色评分和来源标记；1199 名球员来自 Transfermarkt performance-game 逐场统计，其余 49 名为显式代理。
- `squad_club_season_profile.csv`：48 队球员本季俱乐部表现聚合快照，生成模型字段 `clubSeasonScore`。
- `squad_value_allocation.csv`：球员级身价代理分配审计表，记录每队目标总值和分配后总值。
- `squad_collection_status.csv`：每队球员名单解析状态，记录 wikitext 球员数、导入数和跳过原因。
- `squad_import_candidates.csv`：tracker 已解析但仍需核验来源的候选名单，避免把初选名单误导入。
- `player_availability_watchlist.csv`：球员伤病、停赛、伤愈入选和伤病缺席 watchlist。
- `player_availability_audit.csv`：watchlist 映射到当前球员级名单的匹配审计结果。
- `player_availability_source_manifest.csv`：球员可用性来源入口、可信等级和用途。
- `squads_2026_template.csv`：48 队 x 26 个球员槽位的名单录入模板。
- `squads_2026_sample.csv`：聚合脚本的最小样例，不参与正式模型。
- `squad_source_manifest.csv`：名单维度的优先来源入口和规则说明。
- `team_context_snapshot.csv`：48 队结构化球队氛围/上下文快照，拆分为领导连续性、教练稳定、近期势头和压力风险。

## 更新方式

启动带“一键刷新数据”按钮的本地页面：

```bash
npm run dev
```

也可以直接在命令行刷新全部高频数据；刷新失败会自动恢复旧数据：

```bash
npm run refresh:data
```

完整本地校验：

```bash
npm test
```

当前快照由下面的命令从 `app.js` 导出：

```bash
node scripts/export-data-snapshots.mjs
```

模拟器核心链路可用下面命令校验：

```bash
node scripts/validate-simulator.mjs
```

第三名出线组合映射表由下面命令生成：

```bash
node scripts/build-third-place-map.mjs
```

FIFA 排名/积分快照由下面三个命令导出、回写并刷新审计快照：

```bash
node scripts/export-fifa-ranking-snapshot.mjs
node scripts/apply-fifa-ranking-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

赛程地理因子由下面两个命令生成并写回前端数据：

```bash
node scripts/compute-schedule-factors.mjs
node scripts/apply-schedule-factors.mjs
node scripts/export-data-snapshots.mjs
```

Elo 因子由下面三个命令刷新并写回前端数据：

```bash
node scripts/fetch-elo-snapshot.mjs
node scripts/apply-elo-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

夺冠赔率由下面四个命令抓取、生成快照并写回前端数据：

```bash
node scripts/fetch-odds-snapshot.mjs
node scripts/build-odds-snapshot.mjs
node scripts/apply-odds-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

中国竞彩网世界杯足球固定奖金快照由下面命令刷新；默认只保留联赛名包含 `世界杯` 的场次，可用 `SPORTTERY_START_DATE` / `SPORTTERY_END_DATE` 指定日期范围：

```bash
node scripts/fetch-sporttery-football-odds.mjs
```

近两年战绩因子由下面三个命令刷新并写回前端数据：

```bash
node scripts/fetch-recent-form.mjs
node scripts/build-goal-profile-snapshot.mjs
node scripts/apply-form-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

世预赛表现和历史对阵快照由下面三个命令生成并写回前端数据：

```bash
node scripts/build-international-context.mjs
node scripts/apply-qualifying-performance.mjs
node scripts/export-data-snapshots.mjs
```

历史路径因子由下面三个命令从 48 队世界杯历史记录重算并写回前端数据：

```bash
node scripts/build-wc-path-snapshot.mjs
node scripts/apply-wc-path-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

阵容画像代理值由下面三个命令导出、回写并刷新审计快照：

```bash
node scripts/export-squad-profiles.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

FIFA 最终名单状态由下面命令回写；它只更新公告状态，不伪造球员级身价/年龄：

```bash
node scripts/apply-squad-announcement-status.mjs
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

球员级名单可从公开 squad tracker 生成；该命令只导入确认 23-26 人且已标记为最终名单的球队：

```bash
node scripts/fetch-wikipedia-squads.mjs
node scripts/build-squad-import-candidates.mjs
node scripts/enrich-squad-player-proxies.mjs
node scripts/apply-player-availability.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-browser-data.mjs
node scripts/apply-squad-announcement-status.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

FIFA 官方名单 PDF 缺口覆盖可单独应用：

```bash
node scripts/apply-fifa-official-squad-overrides.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-browser-data.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

Transfermarkt 球队/球员身价快照由下面命令刷新；球员页能匹配的行写为真实球员身价，未匹配行写为队级总值分配代理：

```bash
node scripts/fetch-transfermarkt-market-values.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-browser-data.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

Open-Meteo 天气快照由下面命令刷新；超出预报窗的比赛会保留场馆 baseline：

```bash
node scripts/fetch-weather-snapshot.mjs
node scripts/apply-schedule-factors.mjs
node scripts/export-data-snapshots.mjs
```

球员级名单数据就绪后，复制模板为 `data/squads_2026.csv`，填入球员年龄、俱乐部、联赛、身价、伤病状态和名单来源，再聚合并回写：

```bash
node scripts/create-squad-template.mjs
node scripts/apply-player-availability.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-browser-data.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

球员可用性 watchlist 可单独刷新并审计：

```bash
node scripts/apply-player-availability.mjs
node scripts/build-player-club-season-snapshot.mjs
node scripts/build-squad-browser-data.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

也可以用样例校验聚合逻辑，但输出到临时目录，避免污染正式快照：

```bash
node scripts/aggregate-squads.mjs ../data/squads_2026_sample.csv /private/tmp/squad_profile_test.csv
```

球队氛围/上下文因子由下面三个命令重算并写回前端数据：

```bash
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

后续要提升真实性时，建议按这个顺序补源：

1. 继续补齐剩余 49 名未匹配球员的 Transfermarkt 球员页，并交叉核验本季俱乐部表现。
2. 持续扩充 `player_availability_watchlist.csv`，用赛前伤病/停赛列表重算 `injuryRisk`。
3. 用教练任期、队长/核心连续性、公开纪律事件和新闻/社媒情绪替换 `team_context_snapshot.csv` 的手工上下文项。
4. 在 `travelKm`、`restDays`、`timezoneShift`、`entryTravelKm`、`entryTimezoneShift`、`borderCrossings`、`altitudeLoad`、`climateLoad` 基础上继续加入真实训练基地、开球时间和淘汰赛路径模拟。
5. 把 `champion_paths_summary.csv` 继续展开成逐场路径表，用对手强度、加时/点球、东道主和淘汰赛轮次重算更细的 `wcPath`。
