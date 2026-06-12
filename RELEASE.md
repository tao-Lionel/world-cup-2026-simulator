# 发布说明

## v1.1.0

- 新增球队信息模块：点击排名表、小组卡片或综合分编辑列表中的球队，可查看球队模型因子、名单状态、阵容汇总、核心球员和球员明细。
- 新增 `data/squads_2026.js` 浏览器名单快照，由 `data/squads_2026.csv` 生成，保证直接打开 `index.html` 时也能查看球员级阵容。
- 新增 `scripts/build-squad-browser-data.mjs` 和 `npm run build:squads`，并把 CSV/JS 一致性纳入 `npm test`。
- 新增 `data/qualifying_performance.csv`，把 48 队 2023-2026 世预赛表现写入综合强度模型。
- 新增 `data/head_to_head_summary.csv` / `.js`，覆盖 48 队 1128 个历史对阵组合，并在单场预测面板展示。
- 新增 `data/player_club_season_snapshot.csv`，接入 2025/26 球员俱乐部赛季表现和主力角色评分，并在球队详情阵容表展示。
- 新增 `data/squad_club_season_profile.csv`，把球员本季俱乐部表现聚合为队级 `clubSeasonScore`，并以 4% 权重接入综合强度模型。

## v1.0.0

本版本是 2026 世界杯夺冠概率模拟器的开源最终版。它完成了可离线运行的前端模拟器、可审计数据快照、数据刷新脚本、随机种子复现、概率置信区间、固定淘汰赛路径、第三名映射表、阵容导入审计、免责声明和 GitHub Actions 校验。

## 发布范围

- 48 队、12 组、32 强淘汰赛的新赛制模拟。
- 小组赛、最佳第三名、固定 73-104 号淘汰赛树和点球流程。
- FIFA 排名、Elo、赔率、近况、世预赛表现、世界杯历史路径、阵容、球员本季俱乐部表现、队级本季表现、主力角色、伤病、俱乐部分布、赛程旅行、休息、比赛日天气/场馆环境和球队上下文的多因子模型。
- 同一 seed、设置和数据快照下可复现实验结果。
- Monte Carlo 阶段概率和冠军概率的 95% 置信区间。
- `data/` 下的 CSV/JSON 快照、来源清单和数据质量字段。
- `npm test` 校验入口和 `.github/workflows/ci.yml` 自动检查。

## 当前数据边界

- 数据快照截止到仓库内记录的刷新日期；高频变化字段需要后续重新抓取或人工核验。
- `data/squads_2026.csv` 当前覆盖 48 队、1248 名在册球员；48 队均为 26 人。
- `data/player_club_season_snapshot.csv` 当前覆盖 1248 名球员；1199 名球员有 Transfermarkt performance-game 逐场表现，其余 49 名使用显式代理。
- `data/squad_club_season_profile.csv` 当前覆盖 48 队；`clubSeasonScore` 已接入模型，权重为 4%。
- 历史对阵当前用于单场预测解释，不直接调整概率，避免小样本交锋被过度放大。
- `data/squad_import_candidates.csv` 当前为 0 行，仍用于记录后续 tracker 已解析但不应直接导入的候选名单。
- 球员身价优先使用 Transfermarkt 球员页；标记为 `transfermarkt_team_value_allocated_proxy` 的字段是队级总身价分配代理值，不是真实球员市场身价。
- 本项目不是 FIFA 官方产品，也不构成博彩建议。

## 发布校验

发布前应运行：

```bash
npm test
```

通过条件：

- 所有 `.mjs` 脚本、`app.js`、第三名映射 JS 和历史对阵 JS 语法检查通过。
- 48 队、核心 CSV 行数、球员名单、球员本季俱乐部表现、队级本季表现、可用性审计和第三名映射表完整。
- 模拟器核心链路可连续验证 500 次锦标赛。

## 后续数据刷新

当伤病状态、赛前名单替换、赔率、Elo 或近期比赛数据更新后，按 `README.md` 中的数据刷新命令重跑对应脚本，再执行 `npm test`。若刷新改变模型快照，应把数据和来源说明一起提交。
