# 数据来源与可信边界

本项目的目标是让模拟器逐步接近真实预测工具。当前版本已把数据模型扩展到多因子球队画像，并在界面中把“字段是否存在”和“字段可信度”分开展示：字段覆盖说明每队是否有该因子，数据可信度说明这些因子目前是权威快照、市场快照、研究快照，还是代理/人工估计。

## 已接入或可交叉核验的来源

| 因子 | 当前处理 | 主要来源 |
|---|---|---|
| FIFA 排名/积分 | 已拆出 48 队 2026-04-01 官方排名快照并可回写模型 | FIFA/Coca-Cola Men's World Ranking：<https://inside.fifa.com/fifa-world-ranking/men?dateId=id13678> |
| 2026 分组 | 写入 12 个小组 | FIFA 2026 Final Draw：<https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-draw-results> |
| 夺冠赔率 | 已用四家机构公开表生成 consensus 美式赔率并写回 48 队 | TheGameDay 2026-05-15 表，包含 bet365、Betway、Bwin、Betsson |
| Elo/强度 | 已抓取 48 队 2026-03-31 Elo Score 快照并写入模型 | International-football.net，页面注明来源为 eloratings.net：<https://www.international-football.net/elo-ratings-table> |
| 近两年战绩 | 已抓取每队最近 10 场国家队比赛，按胜平负、净胜球和时间衰减生成 form | International-football.net 国家队页面 last international games |
| 历届世界杯路径难度 | 已由 48 队历史出场、总战绩、最佳成绩、2022 成绩、近期参赛和冠军/决赛经验重算 | Football365 48 队世界杯记录 + `deep-research-report.md` 冠军路径整理 |
| 淘汰赛路径 | 已接入 73-104 号固定淘汰赛赛程树，并生成 495 种第三名出线组合固定映射表，替代运行时临时分配 | FIFA World Cup 2026 knockout bracket：<https://www.fifa.com/en/articles/knockout-stage-match-schedule-bracket>、`data/third_place_assignment_map.csv` |
| 阵容画像 | 已拆出 48 队阵容画像，31 队已接入球员级名单行，其余保留代理聚合 | `data/squad_profile_snapshot.csv`、`data/squads_2026.csv`、`data/squad_announcement_status.csv`、`data/squads_2026_template.csv`、FIFA squad announcement hub、Wikipedia squad tracker |
| 球员可用性 | 已新增可审计 watchlist，并把已核验的伤病缺席/伤愈入选状态映射到球员行和球队伤病风险 | `data/player_availability_watchlist.csv`、`data/player_availability_audit.csv`、FIFA squad announcement hub、各队公告、媒体补充 |

## 当前来源等级

| 等级 | 权重 | 字段 | 含义 |
|---|---:|---|---|
| 权威快照 | 1.00 | 2026 分组、主办国身份、FIFA 排名、FIFA 积分 | 已有明确官方入口，可直接核验 |
| 市场快照 | 0.82 | 夺冠赔率 | 可从多个赔率站交叉核验，但会高频波动 |
| 研究快照 | 0.72 | 历史世界杯路径难度 | 已拆成 48 队历史记录与路径特征表，后续可继续细化逐场路径 |
| 可替换快照 | 0.62 | Elo 强度、近两年战绩、赛程旅行与休息、名单公告状态 | 已替换为固定日期/固定赛程快照，可继续刷新 |
| 代理估计 | 0.36 | 阵容身价、平均年龄、伤病、俱乐部分布、名单状态 | 已进入模型，但不是最终实时数据 |
| 人工量化 | 0.26 | 球队氛围 | 已拆成结构化上下文快照，但仍保持低权重 |

## 暂定代理指标

| 因子 | 当前处理 | 后续替换方式 |
|---|---|---|
| 26 人名单公告 | 已接入 `squad_announcement_status.csv`；截至 2026-05-30，本地标记 31 队可导入 26 人名单，但 `fifa_final_26_available` 仍为 false | FIFA 公告页、各协会公告和 squad tracker |
| 球员级 26 人名单 | 已生成 `squads_2026.csv`，覆盖 31 队、806 名球员；其余球队等待确认 26 人名单 | Wikipedia squad tracker wikitext + 各协会来源链接 |
| 阵容身价 | 已进入 `squad_profile_snapshot.csv`，单位为百万欧元；31 队已把球队总身价按角色、年龄、联赛和国家队资历分配到球员层 | Transfermarkt 或同类来源导出后替换 |
| 平均年龄 | 已进入 `squad_profile_snapshot.csv`；31 队由球员出生日期计算，其余用预计名单结构代理 | 最终名单逐球员计算 |
| 伤病风险 | 已进入 `squad_profile_snapshot.csv`，0-100 分，越低越好；球员行默认 unknown，但 watchlist 中已核验的可用性会覆盖球员状态或作为队级缺席惩罚 | 赛前伤病列表、出场状态、新闻源 |
| 俱乐部分布 | 已进入 `squad_profile_snapshot.csv`；31 队由球员俱乐部国家/联赛代理聚合，其余保留球队级代理值 | 球员俱乐部字段聚合 |
| 球队氛围 | 已拆成领导连续性、教练稳定、近期势头和压力风险四项合成 | 后续用教练任期、队长/核心连续性、公开纪律事件和新闻/社媒情绪替换 |
| 入境旅行距离 | 已用代表性出发地到首场小组赛场馆距离估计 | 后续可替换为真实训练基地、包机路线和抵达时间 |
| 入境时区差 | 已用代表性出发地与首场小组赛场馆 6 月 UTC offset 估计 | 后续可加入赛前抵达天数和生物钟适应期 |
| 旅行距离 | 已用官方小组赛赛程与场馆坐标计算小组赛场馆间移动距离 | 后续可加入真实训练基地和淘汰赛路径 |
| 休息天数 | 已用官方小组赛日期计算两段平均休息天数 | 后续可加入开球时间和淘汰赛间隔 |
| 淘汰赛动态路径疲劳 | 已按上一场所在地、比赛日期、旅行距离、休息天数、时区和场馆环境变化调整单场强度 | 后续可加入真实训练基地、住宿基地和开球时间 |
| 时区跨度 | 已按场馆 6 月 UTC offset 计算小组赛最大时区差 | 后续可加入球队训练基地、入境方向和生物钟适应天数 |
| 跨境次数 | 已按小组赛场馆国家序列计算 | 后续可加入真实住宿基地和出入境流程 |
| 海拔负担 | 已按小组赛最高场馆海拔估计 | 后续可加入训练基地海拔和适应期 |
| 场馆环境负担 | 已按热/湿/海拔/室内外做 0-100 估计 | 后续可换成逐场天气、开球时间和球场屋顶状态 |

## 现在的模型含义

`app.js` 中的 `modelRating` 不是单一数据源，而是以下权重的合成分：

- FIFA 排名/积分：23%
- Elo 快照：22%
- 夺冠赔率：14%
- 近况：11%
- 阵容价值与年龄：11%
- 世界杯路径经验：7%
- 健康/伤病风险：5%
- 俱乐部分布：4%
- 球队氛围：2%
- 赛程旅行与休息：1%

这些权重是第一版工程默认值，目的是让模拟器可以跑完整链路。要提高真实性，下一步应把暂定代理指标拆成独立数据文件，并用脚本从最新公开源刷新。

## 数据校验

仓库提供 `npm test` 作为开源维护入口，会检查脚本语法、核心 CSV 行数、48 队覆盖、495 种第三名映射、球员名单、可用性 watchlist 审计和模拟器核心链路。GitHub Actions 会在 push / pull request 时运行同一套检查。

## 下一步数据替换顺序

1. 用真实球员 market value 覆盖当前 `team_value_allocated_proxy`，并补伤病状态和预计角色。
2. 等剩余球队确认 26 人名单后重跑 `fetch-wikipedia-squads.mjs`，把覆盖率从 31 队推到 48 队。
3. 把 `champion_paths_summary.csv` 继续展开成逐场路径表，加入对手强度、加时/点球和淘汰赛压力，进一步重算 `wcPath`。
4. 在 `schedule_travel.csv` 基础上加入真实训练基地、抵达时间、开球时间和淘汰赛路径模拟。
5. 定期重跑 `fetch-elo-snapshot.mjs` 和 `fetch-recent-form.mjs` 更新 Elo/近况。

## 当前本地数据文件

| 文件 | 用途 |
|---|---|
| `data/team_factors_snapshot.csv` | 48 队当前模型输入快照，含综合分、字段覆盖率、数据可信度、可核验字段数和代理字段数 |
| `data/team_factors_snapshot.json` | 与 CSV 相同的 JSON 版，便于程序读取 |
| `data/source_manifest.csv` | 字段来源等级、可信权重与来源说明 |
| `data/model_weights.csv` | 综合强度模型权重 |
| `data/fifa_ranking_snapshot.csv` | 48 队 FIFA/Coca-Cola 2026-04-01 官方排名和模型使用的四舍五入积分 |
| `data/odds_market_raw.csv` | TheGameDay 2026-05-15 四家机构冠军赔率原始表 |
| `data/odds_snapshot.csv` | 四家机构平均隐含概率生成的 consensus 美式赔率 |
| `data/elo_snapshot.csv` | 48 队 2026-03-31 Elo Score、原模型值和差值 |
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
| `data/team_path_context.csv` | 每队小组赛末战日期、场馆和时区，用作淘汰赛动态路径疲劳的初始状态 |
| `data/squad_profile_snapshot.csv` | 48 队暂定阵容画像，后续可由官方/暂定 26 人名单聚合替换 |
| `data/squad_announcement_status.csv` | 48 队名单公告状态，区分已公布 26 人名单与初选/训练营/待公布状态 |
| `data/squads_2026.csv` | 已导入的球员级名单行，当前覆盖 31 队、806 名球员 |
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

`schedule_travel.csv` 中的 `entry_travel_km` / `entry_timezone_shift_hours` 使用代表性出发地到首场小组赛场馆估计，不等于球队最终训练基地、包机路线或抵达时间。`group_stage_travel_km` 只计算小组赛三场比赛的场馆间移动距离，不包含训练基地往返和淘汰赛路径。`avg_environment_load` 是场馆环境估计，不等于实时天气预报；真实比赛日还需要加入开球时间、温湿度、屋顶状态和球队适应期。

`third_place_assignment_map.csv` 已把 495 种第三名出线组合展开成固定映射，浏览器运行时会优先查表，不再根据各第三名之间的积分/净胜球临时决定占位。当前映射由 FIFA 公布的 32 强候选占位符生成；若 FIFA 后续发布逐组合官方表，应以官方表替换这份生成表。

淘汰赛动态路径疲劳当前在浏览器运行时按模拟路径逐场计算，不单独写回每支球队的静态字段。它使用 `team_path_context.csv`、`venues.csv` 和 `knockout_schedule.csv` 估算 travel/rest/timezone/climate 的单场影响；真实训练基地和开球时间尚未接入。

`squad_profile_snapshot.csv` 是为了让阵容维度有可审计入口；`squads_2026.csv` 已把可确认 26 人名单的球队先接入球员级模型，但它不等于 FIFA 统一发布的最终名单。FIFA 名单规则页显示，2026 世界杯每队最终名单为 23-26 人，最终名单在各队提交后由 FIFA 于 2026-06-02 公布；因此 2026-05-30 前即使 `announced_26_available=true`，`fifa_final_26_available` 仍保持 false。

`squad_import_candidates.csv` 用来防止“可解析”被误读成“可导入”。例如 2026-05-30 刷新时，Egypt 在 tracker 中解析出 26 行，但 FIFA 英文公告页仍说明这是 27 人 preliminary squad，因此继续保留为候选审计，不写入 `squads_2026.csv`。

`squads_2026.csv` 中的 `market_value_m` 当前若标记 `value_source=team_value_allocated_proxy`，表示它不是外部真实球员身价，而是把球队级 `squadValue` 按球员角色、年龄、联赛和国家队资历分摊到球员行。这样模型可以先用球员颗粒度运行，但仍需要后续用真实 market value 替换。

`player_availability_watchlist.csv` 是当前伤病/可用性数据的审计入口。若球员已存在于 `squads_2026.csv`，`apply-player-availability.mjs` 会把 `status` 写入该球员的 `injury_status`；若球员因伤落选或球队暂无球员级名单，则聚合脚本会把它作为队级健康风险惩罚写入 `squad_profile_snapshot.csv`。这避免把未核验的新闻自动扩散到全队。

`odds_snapshot.csv` 是市场预期快照，不是概率预测本身。脚本先把四家分数赔率转成隐含概率，取平均隐含概率，再换算成模型使用的美式赔率；该字段会随市场波动，需要定期刷新。

`fifa_ranking_snapshot.csv` 的积分是模型使用的整数快照；FIFA 官方页显示最后更新时间为 2026-04-01，下一次官方更新为 2026-06-11，因此在下一次刷新前不应把它标为 2026-05 数据。

`team_context_snapshot.csv` 目前仍属于结构化人工快照，分数由当前近况、历史路径、伤病风险、主办国身份、名单状态和上下文先验合成。它比单一手工分更可审计，但还不是实时舆情或球队内部状态数据。
