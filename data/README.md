# 数据层说明

这个目录是模拟器的数据审计层。当前前端仍从 `app.js` 读取数据，下面这些文件用于核对来源、导出、后续替换代理字段。

## 文件

- `team_factors_snapshot.csv` / `team_factors_snapshot.json`：48 支球队当前因子快照；CSV 同时导出综合分、字段覆盖率和数据可信度。
- `source_manifest.csv`：每个因子的来源等级、可信权重和来源说明。
- `model_weights.csv`：综合强度模型的权重。
- `fifa_ranking_snapshot.csv`：48 队 FIFA/Coca-Cola 男足世界排名官方快照，日期为 2026-04-01。
- `odds_market_raw.csv`：TheGameDay 2026-05-15 公开表中的 bet365、Betway、Bwin、Betsson 冠军赔率原始分数赔率。
- `odds_snapshot.csv`：由四家机构平均隐含概率生成的 consensus 美式赔率。
- `elo_snapshot.csv`：48 队 2026-03-31 Elo Score 快照，来自 International-football.net 国家页。
- `recent_matches_2024_2026.csv`：48 队最近 10 场国家队比赛明细。
- `form_snapshot.csv`：由近赛结果、净胜球和时间衰减计算出的 form。
- `champion_paths_summary.csv`：从 `deep-research-report.md` 整理出的 1930-2022 历届冠军路径摘要。
- `world_cup_history_raw.csv`：48 队世界杯历史记录，包含出场次数、总战绩、最佳成绩和 2022 成绩。
- `wc_path_features.csv`：由历史记录重算出的路径经验/历史难度特征分。
- `group_stage_schedule.csv`：72 场 2026 小组赛日期、对阵和场馆。
- `knockout_schedule.csv`：73-104 号淘汰赛固定赛程树，含轮次、日期、场馆和晋级路径。
- `venues.csv`：16 个承办场馆坐标、6 月时区、海拔和场馆环境负担估计。
- `team_travel_origins.csv`：48 队代表性出发地、坐标和 6 月 UTC offset，用于估计入境旅行距离与时区差。
- `schedule_travel.csv`：按小组赛场馆序列计算出的每队入境距离、入境时区差、组赛移动距离、休息、时区跨度、跨境、海拔和环境负担。
- `team_path_context.csv`：每队小组赛末战日期、场馆和时区，用作淘汰赛动态路径疲劳的初始状态。
- `squad_profile_snapshot.csv`：48 队暂定阵容画像，承接身价、年龄、伤病风险、俱乐部分布和名单状态；当前仍是代理聚合值。
- `squad_announcement_status.csv`：48 队名单公告状态，区分已公布 26 人名单、初选名单、训练营名单和待公布；FIFA 最终名单仍单独标记。
- `squads_2026.csv`：从公开 squad tracker 导入的球员级名单行，当前覆盖 31 队、806 名球员；`market_value_m` 当前为球队总身价分配代理值。
- `squad_value_allocation.csv`：球员级身价代理分配审计表，记录每队目标总值和分配后总值。
- `squad_collection_status.csv`：每队球员名单解析状态，记录 wikitext 球员数、导入数和跳过原因。
- `squads_2026_template.csv`：48 队 x 26 个球员槽位的名单录入模板。
- `squads_2026_sample.csv`：聚合脚本的最小样例，不参与正式模型。
- `squad_source_manifest.csv`：名单维度的优先来源入口和规则说明。
- `team_context_snapshot.csv`：48 队结构化球队氛围/上下文快照，拆分为领导连续性、教练稳定、近期势头和压力风险。

## 更新方式

当前快照由下面的命令从 `app.js` 导出：

```bash
node scripts/export-data-snapshots.mjs
```

模拟器核心链路可用下面命令校验：

```bash
node scripts/validate-simulator.mjs
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

夺冠赔率由下面三个命令从原始市场表生成 consensus 快照并写回前端数据：

```bash
node scripts/build-odds-snapshot.mjs
node scripts/apply-odds-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

近两年战绩因子由下面三个命令刷新并写回前端数据：

```bash
node scripts/fetch-recent-form.mjs
node scripts/apply-form-snapshot.mjs
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

已公布 26 人名单的状态由下面命令回写；它只更新公告状态，不伪造球员级身价/年龄：

```bash
node scripts/apply-squad-announcement-status.mjs
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

球员级名单可从公开 squad tracker 生成；该命令只导入确认 23-26 人且已标记为 26 人名单的球队：

```bash
node scripts/fetch-wikipedia-squads.mjs
node scripts/enrich-squad-player-proxies.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/apply-squad-announcement-status.mjs
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

球员级名单数据就绪后，复制模板为 `data/squads_2026.csv`，填入球员年龄、俱乐部、联赛、身价、伤病状态和名单来源，再聚合并回写：

```bash
node scripts/create-squad-template.mjs
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

1. 用真实 market value 替换 `team_value_allocated_proxy`，并补伤病状态和预计角色，生成更真实的 `squadValue`、`injuryRisk`、`clubScore`。
2. 用赛前伤病/停赛列表重算 `injuryRisk`。
3. 用教练任期、队长/核心连续性、公开纪律事件和新闻/社媒情绪替换 `team_context_snapshot.csv` 的手工上下文项。
4. 在 `travelKm`、`restDays`、`timezoneShift`、`entryTravelKm`、`entryTimezoneShift`、`borderCrossings`、`altitudeLoad`、`climateLoad` 基础上继续加入真实训练基地和淘汰赛路径模拟。
5. 把 `champion_paths_summary.csv` 继续展开成逐场路径表，用对手强度、加时/点球、东道主和淘汰赛轮次重算更细的 `wcPath`。
