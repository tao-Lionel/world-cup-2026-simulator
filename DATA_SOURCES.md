# 数据来源与可信边界

本项目的目标是让模拟器逐步接近真实预测工具。当前版本已把数据模型扩展到多因子球队画像，并在界面中把“字段是否存在”和“字段可信度”分开展示：字段覆盖说明每队是否有该因子，数据可信度说明这些因子目前是权威快照、市场快照、研究快照，还是代理/人工估计。

## 已接入或可交叉核验的来源

| 因子 | 当前处理 | 主要来源 |
|---|---|---|
| FIFA 排名/积分 | 已拆出 48 队 2026-06-11 官方排名快照（赛前最后一次更新）并可回写模型；`fetch-fifa-ranking-snapshot.mjs` 经 FIFA by-country API 一键刷新 | FIFA/Coca-Cola Men's World Ranking：<https://inside.fifa.com/fifa-world-ranking/men> |
| 2026 分组 | 写入 12 个小组 | FIFA 2026 Final Draw：<https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-draw-results> |
| 夺冠赔率 | 已升级为双源共识：BetMGM 美式赔率经 power 法去水（去除 ~30% overround，长尾去得更多），与 Polymarket 冠军市场（overround 仅 ~4%）归一概率取等权平均，回写为公平美式赔率 | Yahoo Sports/BetMGM：<https://sports.yahoo.com/soccer/betting/article/2026-world-cup-odds-for-all-48-teams-to-win-the-title-200221552.html>、Polymarket：<https://polymarket.com/event/world-cup-winner> |
| Elo/强度 | 已抓取 48 队 2026-06-07 Elo Score 快照并写入模型 | International-football.net，页面注明来源为 eloratings.net：<https://www.international-football.net/elo-ratings-table> |
| 近两年战绩 | 已抓取每队最近 10 场国家队比赛，按胜平负、净胜球和时间衰减生成 form | International-football.net 国家队页面 last international games |
| Transfermarkt 身价 | 已抓取 48 队参赛队总身价，并从国家队明细页匹配 1121/1247 个当前在册球员身价；未匹配行按队级总值分配代理 | Transfermarkt 2026 World Cup participants：<https://www.transfermarkt.us/world-cup/teilnehmer/pokalwettbewerb/FIWC> |
| 比赛日天气 | 已抓取 Open-Meteo 当前可用预报窗；超出预报窗的小组赛保留场馆 baseline 并在逐场快照标记 | Open-Meteo forecast API：<https://open-meteo.com/> |
| 历届世界杯路径难度 | 已由 48 队历史出场、总战绩、最佳成绩、2022 成绩、近期参赛和冠军/决赛经验重算 | Football365 48 队世界杯记录 + `deep-research-report.md` 冠军路径整理 |
| 淘汰赛路径 | 已接入 73-104 号固定淘汰赛赛程树，并生成 495 种第三名出线组合固定映射表，替代运行时临时分配 | FIFA World Cup 2026 knockout bracket：<https://www.fifa.com/en/articles/knockout-stage-match-schedule-bracket>、`data/third_place_assignment_map.csv` |
| 阵容画像 | 已拆出 48 队阵容画像，48 队均已接入球员级最终名单行 | `data/squad_profile_snapshot.csv`、`data/squads_2026.csv`、`data/squad_announcement_status.csv`、FIFA squad announcement hub、Wikipedia squad tracker |
| 球员可用性 | 已新增可审计 watchlist，并把已核验的伤病缺席/伤愈入选状态映射到球员行和球队伤病风险 | `data/player_availability_watchlist.csv`、`data/player_availability_audit.csv`、FIFA squad announcement hub、各队公告、媒体补充 |

## 当前来源等级

| 等级 | 权重 | 字段 | 含义 |
|---|---:|---|---|
| 权威快照 | 1.00 | 2026 分组、主办国身份、FIFA 排名、FIFA 积分 | 已有明确官方入口，可直接核验 |
| 市场快照 | 0.82 | 夺冠赔率 | 可从多个赔率站交叉核验，但会高频波动 |
| 研究快照 | 0.72 | 历史世界杯路径难度 | 已拆成 48 队历史记录与路径特征表，后续可继续细化逐场路径 |
| 可替换快照 | 0.62 | Elo 强度、近两年战绩、阵容身价、赛程旅行与休息、比赛日天气/场馆环境、名单公告状态、名单状态 | 已替换为固定日期/固定赛程快照，可继续刷新 |
| 代理估计 | 0.36 | 俱乐部分布 | 已进入模型，但仍是联赛强度代理分 |
| 人工量化 | 0.26 | 球队氛围 | 已拆成结构化上下文快照，但仍保持低权重 |

## 阵容相关指标

| 因子 | 当前处理 | 后续替换方式 |
|---|---|---|
| 最终名单公告 | 已接入 `squad_announcement_status.csv`；截至 2026-06-02，本地 48 队均标记为 FIFA 最终名单确认 | FIFA 公告页、Wikipedia squad tracker |
| 球员级最终名单 | 已生成 `squads_2026.csv`，当前覆盖 48 队、1247 名球员；Argentina 因 Balerdi 伤退、替补待公布而暂为 25 人 | FIFA 官方 SquadLists PDF + Wikipedia squad tracker wikitext |
| 阵容身价 | 已进入 `squad_profile_snapshot.csv`，单位为百万欧元；1121/1247 名当前在册球员匹配到球员页真实身价，未匹配行按队级总值分配 | Transfermarkt 参赛队页 + 国家队明细页 |
| 平均年龄 | 已进入 `squad_profile_snapshot.csv`；48 队均由球员出生日期计算 | 最终名单逐球员计算 |
| 伤病风险 | 已进入 `squad_profile_snapshot.csv`，0-100 分，越低越好；球员行默认 unknown，但 watchlist 中已核验的可用性会覆盖球员状态或作为队级缺席惩罚 | 赛前伤病列表、出场状态、新闻源 |
| 俱乐部分布 | 已进入 `squad_profile_snapshot.csv`；48 队均由球员俱乐部国家/联赛代理聚合 | 球员俱乐部字段聚合 |
| 球队氛围 | 已拆成领导连续性、教练稳定、近期势头和压力风险四项合成 | 后续用教练任期、队长/核心连续性、公开纪律事件和新闻/社媒情绪替换 |
| 入境旅行距离 | 已用代表性出发地到首场小组赛场馆距离估计 | 后续可替换为真实训练基地、包机路线和抵达时间 |
| 入境时区差 | 已用代表性出发地与首场小组赛场馆 6 月 UTC offset 估计 | 后续可加入赛前抵达天数和生物钟适应期 |
| 旅行距离 | 已用官方小组赛赛程与场馆坐标计算小组赛场馆间移动距离 | 后续可加入真实训练基地和淘汰赛路径 |
| 休息天数 | 已用官方小组赛日期计算两段平均休息天数 | 后续可加入开球时间和淘汰赛间隔 |
| 淘汰赛动态路径疲劳 | 已按上一场所在地、比赛日期、旅行距离、休息天数、时区和场馆环境变化调整单场强度 | 后续可加入真实训练基地、住宿基地和开球时间 |
| 时区跨度 | 已按场馆 6 月 UTC offset 计算小组赛最大时区差 | 后续可加入球队训练基地、入境方向和生物钟适应天数 |
| 跨境次数 | 已按小组赛场馆国家序列计算 | 后续可加入真实住宿基地和出入境流程 |
| 海拔负担 | 已按小组赛最高场馆海拔估计 | 后续可加入训练基地海拔和适应期 |
| 场馆环境负担 | 已升级为比赛日天气/场馆环境负担；Open-Meteo 可预报日期使用天气预报，超出预报窗的比赛保留场馆 baseline | 后续可加入开球时间和球场屋顶状态 |

## 现在的模型含义

`app.js` 中的 `modelRating` 不是单一数据源，而是以下权重的合成分：

- 阵容价值与年龄：44%
- FIFA 排名/积分：22%
- Elo 快照：17%
- 夺冠赔率：6%
- 健康/伤病风险：5%（固定）
- 球队氛围：2%（固定）
- 近况：1%
- 世界杯路径经验：1%
- 俱乐部分布：1%
- 赛程旅行与休息：1%（固定）

这些权重由 `backtest-model-weights.mjs` 在 2022-07 以来 48 强之间的 490 场真实比赛上回测拟合（Davidson 胜平负模型 + Nelder-Mead，5 折交叉验证），完整对比见 `data/model_weights_backtest.csv`：

- fifa/elo/form 三个动态因子使用 `fetch-backtest-matches.mjs` 重放全部历史比赛得到的逐场赛前值（与官方快照相关性 Elo 0.984、FIFA 0.959），无未来信息泄漏。
- odds/squad/wcPath/club 使用当前快照分：squad/wcPath/club 在一个周期内变化缓慢，近似成立；odds 存在轻度泄漏，已在拟合中自然得到低权重。
- health/atmosphere/schedule 是世界杯特有调整项，历史比赛无法验证，按原值固定，不参与拟合。
- 交叉验证显示拟合权重的 log-loss（1.0372）略优于旧手设权重（1.0377）和等权（1.0388）；各合理权重间差距很小，应理解为"有依据的默认值"而不是精确最优。
- 阵容身价权重显著上升、近况权重接近归零，与公开研究结论一致（市场身价是强预测因子，近况噪音大）。

## 数据校验

仓库提供 `npm test` 作为开源维护入口，会检查脚本语法、核心 CSV 行数、48 队覆盖、495 种第三名映射、球员名单、可用性 watchlist 审计和模拟器核心链路。GitHub Actions 会在 push / pull request 时运行同一套检查。

## 下一步数据替换顺序

1. 继续提升 Transfermarkt 球员页匹配率，减少 `transfermarkt_team_value_allocated_proxy` 行，并补伤病状态和预计角色。
2. 持续重跑 `fetch-wikipedia-squads.mjs`、FIFA 覆盖和可用性脚本，捕捉赛前伤病替换和名单变更。
3. 把 `champion_paths_summary.csv` 继续展开成逐场路径表，加入对手强度、加时/点球和淘汰赛压力，进一步重算 `wcPath`。
4. 在 `schedule_travel.csv` 基础上加入真实训练基地、抵达时间、开球时间和淘汰赛路径模拟。
5. 定期重跑 `fetch-fifa-ranking-snapshot.mjs`、`fetch-elo-snapshot.mjs`、`fetch-recent-form.mjs`、`fetch-polymarket-odds.mjs` 和 `fetch-weather-snapshot.mjs` 更新 FIFA 排名/Elo/近况/赔率/天气。
6. 淘汰赛阶段每轮结束后重跑 `fetch-backtest-matches.mjs` + `backtest-model-weights.mjs`，吸收新完赛样本复核权重。

## 当前本地数据文件

| 文件 | 用途 |
|---|---|
| `data/team_factors_snapshot.csv` | 48 队当前模型输入快照，含综合分、字段覆盖率、数据可信度、可核验字段数和代理字段数 |
| `data/team_factors_snapshot.json` | 与 CSV 相同的 JSON 版，便于程序读取 |
| `data/source_manifest.csv` | 字段来源等级、可信权重与来源说明 |
| `data/model_weights.csv` | 综合强度模型权重 |
| `data/fifa_ranking_snapshot.csv` | 48 队 FIFA/Coca-Cola 2026-06-11 官方排名和模型使用的四舍五入积分 |
| `data/odds_market_raw.csv` | Yahoo Sports 发布的 BetMGM 2026-06-01 全 48 队冠军赔率原始表 |
| `data/polymarket_odds_raw.csv` | Polymarket 冠军市场 48 队中间价隐含概率原始快照 |
| `data/odds_snapshot.csv` | BetMGM（power 法去水）+ Polymarket 双源共识概率与公平美式赔率 |
| `data/backtest_matches.csv` | 2022-07 以来 48 强互相之间的已完赛记录，含逐场赛前 Elo/FIFA/form 重建值 |
| `data/model_weights_backtest.csv` | 各候选权重的 5 折交叉验证 log-loss/Brier 对比报告 |
| `data/model_weights_fitted.csv` | 回测拟合得到的当前模型权重 |
| `data/transfermarkt_team_market_values.csv` | Transfermarkt 2026 世界杯参赛队总身价、平均年龄、外援比例和球队页入口 |
| `data/transfermarkt_player_market_values.csv` | Transfermarkt 国家队明细页解析出的球员级身价快照 |
| `data/elo_snapshot.csv` | 48 队 2026-06-07 Elo Score、原模型值和差值 |
| `data/recent_matches_2024_2026.csv` | 48 队最近 10 场国家队比赛明细，共 480 场队伍视角记录 |
| `data/form_snapshot.csv` | 每队按近赛结果计算出的 form、原模型值和差值 |
| `data/champion_paths_summary.csv` | 1930-2022 历届冠军路径摘要，用于后续重算路径难度 |
| `data/world_cup_history_raw.csv` | 48 队世界杯历史记录，含出场次数、总战绩、最佳成绩和 2022 成绩 |
| `data/wc_path_features.csv` | 由历史记录生成的 `wcPath` 特征分 |
| `data/group_stage_schedule.csv` | 72 场小组赛日期、对阵、场馆，来自 FIFA 赛程页 |
| `data/knockout_schedule.csv` | 73-104 号淘汰赛固定赛程树，含轮次、日期、场馆和晋级路径 |
| `data/third_place_assignment_map.csv` | 495 种第三名出线组合到 8 个 32 强第三名占位符的固定映射 |
| `data/third_place_assignment_map.js` | 浏览器运行时使用的第三名映射表 |
| `data/venues.csv` | 16 个赛场坐标、时区、海拔和环境负担估计 |
| `data/team_travel_origins.csv` | 48 队代表性出发地、坐标和 6 月 UTC offset |
| `data/schedule_travel.csv` | 由赛程、场馆和出发地数据计算出的每队入境距离、入境时区差、组赛移动距离、休息、时区、跨境、海拔和环境负担 |
| `data/match_weather_snapshot.csv` | 72 场小组赛逐场天气快照；可预报日期来自 Open-Meteo，超出预报窗的比赛保留 baseline |
| `data/schedule_weather.csv` | 按球队聚合的小组赛平均天气/环境负担 |
| `data/team_path_context.csv` | 每队小组赛末战日期、场馆和时区，用作淘汰赛动态路径疲劳的初始状态 |
| `data/squad_profile_snapshot.csv` | 48 队最终名单阵容画像，由球员级名单聚合生成 |
| `data/squad_announcement_status.csv` | 48 队名单公告状态，当前均标记为 2026-06-02 FIFA 最终名单确认 |
| `data/squads_2026.csv` | 已导入的球员级最终名单行，当前覆盖 48 队、1247 名球员 |
| `data/squads_2026.js` | 浏览器运行用的球员级名单快照，由 `squads_2026.csv` 生成 |
| `data/fifa_official_squad_overrides.csv` | FIFA 官方 PDF 与本地 tracker 的缺口覆盖，目前用于补齐 Austria、Canada 和 Jordan 各 1 名球员 |
| `data/squad_value_allocation.csv` | 球队总身价分配到球员层的审计表，确保球员行加总回到球队总值 |
| `data/squad_collection_status.csv` | 每队 wikitext 解析状态、球员行数和是否导入 |
| `data/squad_import_candidates.csv` | tracker 已解析但本地公告状态仍未确认 26 人名单的候选导入审计表 |
| `data/player_availability_watchlist.csv` | 球员伤病、停赛、伤愈入选和伤病缺席 watchlist |
| `data/player_availability_audit.csv` | watchlist 映射到当前球员名单的匹配审计结果 |
| `data/player_availability_source_manifest.csv` | 球员可用性来源入口、可信等级和用途 |
| `data/squads_2026_template.csv` | 48 队 x 26 人的球员级名单录入模板 |
| `data/squads_2026_sample.csv` | 聚合脚本样例数据，不参与正式模型 |
| `data/squad_source_manifest.csv` | FIFA 名单规则页、官方名单公告入口和检查日期 |
| `data/team_context_snapshot.csv` | 48 队结构化球队氛围/上下文快照 |

`schedule_travel.csv` 中的 `entry_travel_km` / `entry_timezone_shift_hours` 使用代表性出发地到首场小组赛场馆估计，不等于球队最终训练基地、包机路线或抵达时间。`group_stage_travel_km` 只计算小组赛三场比赛的场馆间移动距离，不包含训练基地往返和淘汰赛路径。`avg_environment_load` 当前由 `schedule_weather.csv` 回写：Open-Meteo 可预报日期使用天气预报，超出预报窗的比赛保留场馆 baseline；真实比赛日还需要加入开球时间、温湿度、屋顶状态和球队适应期。

`third_place_assignment_map.csv` 已把 495 种第三名出线组合展开成固定映射，浏览器运行时会优先查表，不再根据各第三名之间的积分/净胜球临时决定占位。当前映射由 FIFA 公布的 32 强候选占位符生成；若 FIFA 后续发布逐组合官方表，应以官方表替换这份生成表。

淘汰赛动态路径疲劳当前在浏览器运行时按模拟路径逐场计算，不单独写回每支球队的静态字段。它使用 `team_path_context.csv`、`venues.csv` 和 `knockout_schedule.csv` 估算 travel/rest/timezone/climate 的单场影响；真实训练基地和开球时间尚未接入。

`squad_profile_snapshot.csv` 是为了让阵容维度有可审计入口。FIFA 2026-06-06 PDF 初始版本为 1,248 名球员；2026-06-07 Balerdi 伤退且 Argentina 尚未公布替补，因此当前在册快照为 1,247 人。

`squad_import_candidates.csv` 用来防止“可解析”被误读成“可导入”。2026-06-02 刷新后候选审计为 0 行；后续若 tracker 出现新的未确认名单变更，仍通过该文件单独审计。

`squads_2026.csv` 中的 `market_value_m` 若标记 `value_source=transfermarkt_player_market_value`，表示来自 Transfermarkt 国家队球员页；若标记 `value_source=transfermarkt_team_value_allocated_proxy`，表示未匹配到球员页，使用 Transfermarkt 队级总身价剩余值分配。当前匹配 1121/1247 名球员。

`player_availability_watchlist.csv` 是当前伤病/可用性数据的审计入口。若球员已存在于 `squads_2026.csv`，`apply-player-availability.mjs` 会把 `status` 写入该球员的 `injury_status`；若球员因伤落选或球队暂无球员级名单，则聚合脚本会把它作为队级健康风险惩罚写入 `squad_profile_snapshot.csv`。这避免把未核验的新闻自动扩散到全队。

`odds_snapshot.csv` 是市场预期快照，不是概率预测本身。当前使用 Yahoo Sports 于 2026-06-01 发布的 BetMGM 单机构全 48 队赔率，并换算隐含概率；该字段会随市场波动，需要定期刷新。

`fifa_ranking_snapshot.csv` 的积分是模型使用的整数快照；FIFA 官方页显示最后更新时间为 2026-04-01，下一次官方更新为 2026-06-11，因此在下一次刷新前不应把它标为 2026-05 数据。

`team_context_snapshot.csv` 目前仍属于结构化人工快照，分数由当前近况、历史路径、伤病风险、主办国身份、名单状态和上下文先验合成。它比单一手工分更可审计，但还不是实时舆情或球队内部状态数据。
