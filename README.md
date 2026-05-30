# 2026 世界杯夺冠概率模拟器

这是一个离线单页模拟器，基于 `deep-research-report.md` 的建模建议做成：

- 2026 新赛制：48 队、12 个小组。
- 输出概率分布，而不是单一冠军断言。
- 小组赛使用进球分布模拟，前二名和 8 个最佳第三名出线。
- 淘汰赛使用 FIFA 公布的 73-104 号固定赛程树；第三名席位按 495 种晋级组合固定映射表分配，平局后进入点球。
- 综合强度由 FIFA 排名/积分、Elo 快照、夺冠赔率、近况、世界杯路径经验、阵容价值、年龄、伤病风险、俱乐部分布、球队氛围、入境旅行、组赛旅行和休息天数合成。
- 数据面板会同时显示字段覆盖、平均可信度、可核验字段数和代理/人工字段数，避免把代理指标误读成官方数据。
- 48 队综合分仍可手动编辑，便于替换成更准确的 Elo、赔率、阵容或自建模型分数。
- `data/` 目录保存球队因子、来源清单、模型权重和历届冠军路径摘要，方便后续替换真实数据源。
- FIFA 排名/积分已拆为 2026-04-01 官方快照文件，可单独回写模型。
- Elo 已从手工代理替换为 2026-03-31 的 International-football.net / eloratings.net 快照。
- 夺冠赔率已从手工代理替换为 2026-05-15 四家机构公开表的 consensus 快照。
- 近况已从手工代理替换为每队最近 10 场国家队比赛的计算快照。
- 历史路径难度已从手工代理替换为 48 队世界杯历史记录特征快照。
- 入境旅行距离、入境时区差、小组赛旅行距离、休息天数、时区跨度、跨境次数、海拔和场馆环境负担已由 FIFA 小组赛赛程、场馆坐标、代表性出发地和场馆地理快照计算，不再使用纯手工代理值。
- 淘汰赛会动态计算路径疲劳：每场按上一场/小组末战所在地、比赛日期、旅行距离、休息天数、时区变化和场馆环境变化做小幅强度调整。
- 已新增 `data/third_place_assignment_map.csv` 和浏览器运行用的 `data/third_place_assignment_map.js`，把 495 种第三名出线组合固定为可审计映射，不再由运行时第三名积分排序临时决定对位。
- 名单公告状态已拆到 `data/squad_announcement_status.csv`；截至 2026-05-30，本地已标记 32 队公布 26 人名单，但 FIFA 最终确认仍待 2026-06-02。
- 已新增 `data/squads_2026.csv`，从公开 squad tracker 导入 31 队、806 名球员的 26 人名单行；平均年龄和俱乐部分布已按球员行聚合，球员身价由球队总身价按角色/年龄/联赛/国家队资历分配。
- 已新增 `data/player_availability_watchlist.csv`，把已核验的伤病缺席、停赛、伤愈入选等可用性信息映射到球员行，并在无法匹配球员行时作为队级健康风险惩罚。
- 阵容身价、平均年龄、伤病风险和俱乐部分布已拆到 `data/squad_profile_snapshot.csv`；有球员行的队伍使用球员级聚合，未确认 26 人名单的队伍仍使用暂定代理。
- 已提供 `data/squads_2026_template.csv` 和聚合脚本，官方/暂定名单填入后可自动生成阵容身价、平均年龄、伤病风险和俱乐部分布。
- 球队氛围已拆成 `data/team_context_snapshot.csv`，由领导连续性、教练稳定、近期势头和压力风险合成，仍保持低权重。

## 使用方式

直接在浏览器打开 `index.html` 即可运行。也可以在当前目录启动一个静态服务器：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 注意

当前版本是探索型概率工具。淘汰赛路径已接入 FIFA 固定 match-number bracket；第三名席位已展开为 495 种组合映射表。该表由 FIFA 公布的 32 强候选占位符生成，用于保证模拟器稳定可复现；若后续 FIFA 发布逐组合官方表，应以官方表替换。

数据层已经扩展为多来源球队画像，但并非所有字段都是官方最终数据：26 人名单、伤病、氛围、赛程疲劳等在赛前会持续变化，目前用可替换的暂定/代理指标承接。CSV 导出会包含 `data_quality`、`source_backed_fields` 和 `proxy_fields`，字段来源和可信边界见 `DATA_SOURCES.md`。

本项目不是 FIFA 官方产品，也不构成博彩建议。完整免责声明见 `DISCLAIMER.md`。

## 数据快照

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

生成并写回历史路径快照：

```bash
node scripts/build-wc-path-snapshot.mjs
node scripts/apply-wc-path-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

导出并回写暂定阵容画像：

```bash
node scripts/export-squad-profiles.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

回写已公布 26 人名单的公告状态：

```bash
node scripts/apply-squad-announcement-status.mjs
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

从 Wikipedia squad tracker 抓取已确认 26 人名单并生成球员级 CSV：

```bash
node scripts/fetch-wikipedia-squads.mjs
node scripts/enrich-squad-player-proxies.mjs
node scripts/apply-player-availability.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/apply-squad-announcement-status.mjs
node scripts/build-team-context-snapshot.mjs
node scripts/apply-team-context-snapshot.mjs
node scripts/export-data-snapshots.mjs
```

球员级名单填好后，从名单聚合阵容画像并回写：

```bash
node scripts/create-squad-template.mjs
node scripts/apply-player-availability.mjs
node scripts/aggregate-squads.mjs
node scripts/apply-squad-profiles.mjs
node scripts/export-data-snapshots.mjs
```

刷新球员可用性 watchlist 并重算伤病风险：

```bash
node scripts/apply-player-availability.mjs
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
