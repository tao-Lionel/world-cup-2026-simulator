import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const indexSource = await readFile(new URL("../index.html", import.meta.url), "utf8");
const stylesSource = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const realSportteryOddsJson = await readFile(new URL("../data/sporttery_football_odds_snapshot.json", import.meta.url), "utf8");
const thirdPlaceMapSource = await readFile(new URL("../data/third_place_assignment_map.js", import.meta.url), "utf8");
const squadBrowserDataSource = await readFile(new URL("../data/squads_2026.js", import.meta.url), "utf8");
const runtimeSource = source.slice(0, source.indexOf("document.addEventListener"));
const featureSources = [
  ["index.html", indexSource],
  ["styles.css", stylesSource],
  ["app.js", source],
];
const removedFeatureTerms = [
  "冠军路径电影票",
  "一键爆冷宇宙",
  "路径票",
  "电影票",
  "ticketTeam",
  "ticketBtn",
  "downloadTicketBtn",
  "pathTicket",
  "chaosBtn",
  "chaosUniverse",
  "latestPathTicket",
  "latestChaosUniverse",
  "generatePathTicket",
  "generateChaosUniverse",
  "data-scene=\"chaos\"",
  "pickBiggestUpset",
];
const removedFeatureMatches = featureSources.flatMap(([file, text]) => (
  removedFeatureTerms
    .filter((term) => text.includes(term))
    .map((term) => `${file}:${term}`)
));

const context = {
  console,
  Math,
  document: {
    nodes: {},
    querySelector(selector) {
      if (!this.nodes[selector]) this.nodes[selector] = { innerHTML: "", textContent: "", value: "" };
      return this.nodes[selector];
    },
  },
};
vm.createContext(context);

vm.runInContext(`${thirdPlaceMapSource}
${squadBrowserDataSource}
globalThis.SPORTTERY_FOOTBALL_ODDS_SNAPSHOT = {
  window: { startDate: "2026-06-10", endDate: "2026-06-17" },
  matches: [
    {
      matchId: "ci-sporttery-render",
      matchNum: "周三001",
      matchDate: "2026-06-11",
      league: "世界杯",
      homeTeam: "阿根廷",
      awayTeam: "法国",
      sourceUrl: "https://www.sporttery.cn/",
      pools: [
        {
          code: "HAD",
          label: "胜平负",
          options: [
            { key: "h", label: "主胜", odds: 2.1 },
            { key: "d", label: "平", odds: 3.2 },
            { key: "a", label: "客胜", odds: 3 },
          ],
        },
      ],
    },
  ],
};
${runtimeSource}
const settings = { count: 1000, randomness: 1, hostBoost: 80, penaltyWeight: 0.65 };
const realSportteryOddsSnapshot = ${realSportteryOddsJson};
let missingChampion = 0;
let missingMatches = 0;
let missingR32 = 0;
let invalidThirdCombos = 0;
let missingThirdTableRows = 0;
let invalidThirdTableRows = 0;
let seededMismatch = 0;
let missingTeamDetail = 0;
let invalidMatchPrediction = 0;
let seededMatchMismatch = 0;
let invalidBettingAdvice = 0;
let invalidSportteryRecommendation = 0;
let missingSportteryRender = 0;
let missingBettingSlipRender = 0;
let missingBettingSlipActions = 0;
let missingBettingSlipRiskFields = 0;
let invalidSportteryVolatileRender = 0;
let invalidSportterySinglePriority = 0;
let invalidSportterySlipFilter = 0;
let invalidRealSportterySnapshot = 0;
function combinations(items, size) {
  const output = [];
  function walk(start, picked) {
    if (picked.length === size) {
      output.push([...picked]);
      return;
    }
    for (let index = start; index <= items.length - (size - picked.length); index += 1) {
      picked.push(items[index]);
      walk(index + 1, picked);
      picked.pop();
    }
  }
  walk(0, []);
  return output;
}
for (const combo of combinations("ABCDEFGHIJKL".split(""), 8)) {
  const comboKey = combo.join("");
  const mapped = THIRD_PLACE_ASSIGNMENT_TABLE[comboKey];
  if (!mapped) missingThirdTableRows += 1;
  if (mapped) {
    const values = Object.values(mapped);
    const unique = new Set(values);
    const withinCombo = values.every((group) => combo.includes(group));
    if (unique.size !== 8 || !withinCombo) invalidThirdTableRows += 1;
  }
  const rows = combo.map((group, index) => ({
    team: { group, id: index },
    pts: 3,
    gd: 0,
    gf: 1,
  }));
  if (thirdPlaceAssignments(rows, settings).size !== 8) invalidThirdCombos += 1;
}
for (let index = 0; index < 500; index += 1) {
  const tournament = simulateTournament(settings, true);
  if (!tournament.champion) missingChampion += 1;
  const matches = tournament.rounds.flatMap((round) => round.matches);
  if (matches.length !== 31) missingMatches += 1;
  if (tournament.stageWinners.r16.length !== 16) missingR32 += 1;
}

function pathSignature(tournament) {
  return JSON.stringify({
    champion: tournament.champion.id,
    totalGoals: tournament.totalGoals,
    penalties: tournament.penalties,
    rounds: tournament.rounds.map((round) => round.matches.map((match) => [
      match.match,
      match.a.id,
      match.b.id,
      match.aGoals,
      match.bGoals,
      match.winner.id,
      match.penalty,
    ])),
  });
}

const seededSettings = { ...settings, seed: "ci-reproducibility" };
const seededA = simulateTournament(seededSettings, true, createRng(seededSettings.seed));
const seededB = simulateTournament(seededSettings, true, createRng(seededSettings.seed));
if (pathSignature(seededA) !== pathSignature(seededB)) seededMismatch += 1;

const matchA = teams.find((team) => team.en === "Argentina");
const matchB = teams.find((team) => team.en === "France");
const matchSettings = { ...settings, count: 10000, seed: "ci-match-prediction" };
const matchSeed = matchSettings.seed + ":match:" + matchA.en + ":" + matchB.en;
const matchPredictionA = simulateMatchPrediction(matchA, matchB, matchSettings, createRng(matchSeed));
const matchPredictionB = simulateMatchPrediction(matchA, matchB, matchSettings, createRng(matchSeed));
const outcomeTotal = matchPredictionA.aWins + matchPredictionA.draws + matchPredictionA.bWins;
const scoreTotal = matchPredictionA.scores.reduce((sum, row) => sum + row.occurrences, 0);
if (
  outcomeTotal !== matchSettings.count ||
  scoreTotal !== matchSettings.count ||
  matchPredictionA.avgAGoals <= 0 ||
  matchPredictionA.avgBGoals <= 0 ||
  matchPredictionA.scores.length < 5
) invalidMatchPrediction += 1;
if (JSON.stringify(matchPredictionA.scores) !== JSON.stringify(matchPredictionB.scores)) seededMatchMismatch += 1;

const bettingAdvice = calculateBettingAdvice({
  a: matchA,
  b: matchB,
  count: 1000,
  aWins: 450,
  draws: 250,
  bWins: 300,
}, { home: 2.4, draw: 3.2, away: 2.8 });
const bettingBest = bettingAdvice.markets.find((market) => market.key === "home");
if (
  bettingAdvice.returnRate <= 0 ||
  bettingAdvice.returnRate >= 1 ||
  bettingAdvice.markets.length !== 3 ||
  !bettingBest ||
  bettingBest.expectedReturn <= 0 ||
  bettingBest.tone !== "positive"
) invalidBettingAdvice += 1;

const sportteryAdvice = rankSportteryOptions({
  matchId: "ci-sporttery",
  homeTeam: "阿根廷",
  awayTeam: "法国",
  pools: [
    {
      code: "HAD",
      label: "胜平负",
      single: "支持单关",
      options: [
        { key: "h", label: "主胜", odds: 1.85 },
        { key: "d", label: "平", odds: 3.35 },
        { key: "a", label: "客胜", odds: 4.2 },
      ],
    },
    {
      code: "TTG",
      label: "总进球",
      single: "需过关",
      options: [
        { key: "s3", label: "3球", odds: 3 },
      ],
    },
  ],
}, [
  { score: "2-1", occurrences: 480 },
  { score: "1-1", occurrences: 220 },
  { score: "0-1", occurrences: 180 },
  { score: "3-1", occurrences: 120 },
], 1000);
if (
  !sportteryAdvice.complete ||
  sportteryAdvice.ratedOptions.length !== 4 ||
  sportteryAdvice.recommended.poolCode !== "HAD" ||
  sportteryAdvice.recommended.optionKey !== "h" ||
  sportteryAdvice.recommended.modelProbability <= 0.55 ||
  sportteryAdvice.recommended.expectedReturn <= 0
) invalidSportteryRecommendation += 1;

const singlePriorityAdvice = rankSportteryOptions({
  matchId: "ci-sporttery-single",
  homeTeam: "阿根廷",
  awayTeam: "法国",
  pools: [
    {
      code: "HAD",
      label: "胜平负",
      single: "支持单关",
      options: [
        { key: "h", label: "主胜", odds: 1.9 },
      ],
    },
    {
      code: "TTG",
      label: "总进球",
      single: "需过关",
      options: [
        { key: "s3", label: "3球", odds: 2.2 },
      ],
    },
  ],
}, [
  { score: "2-1", occurrences: 550 },
  { score: "0-1", occurrences: 450 },
], 1000);
if (
  singlePriorityAdvice.recommended.poolCode !== "HAD" ||
  singlePriorityAdvice.recommended.single !== "支持单关"
) invalidSportterySinglePriority += 1;

const realSportteryRows = (realSportteryOddsSnapshot.matches || [])
  .map((match) => ({ match, advice: createSportteryRecommendation(match, { ...settings, count: 500, seed: "ci-real-sporttery" }) }));
if (realSportteryRows.some(({ advice }) => !advice.complete)) invalidRealSportterySnapshot += 1;
if ((realSportteryOddsSnapshot.matches || []).some((match) => !String(match.league || "").includes("世界杯"))) {
  invalidRealSportterySnapshot += 1;
}

document.nodes["#simCount"] = { innerHTML: "", textContent: "", value: "3000" };
document.nodes["#seedInput"] = { innerHTML: "", textContent: "", value: "ci-sporttery-render" };
document.nodes["#randomness"] = { innerHTML: "", textContent: "", value: "1" };
document.nodes["#hostBoost"] = { innerHTML: "", textContent: "", value: "80" };
document.nodes["#penaltyWeight"] = { innerHTML: "", textContent: "", value: "0.65" };
renderSportteryOdds();
const sportteryRenderHtml = document.nodes["#sportteryOdds"].innerHTML;
if (!sportteryRenderHtml.includes("保守建议") && !sportteryRenderHtml.includes("本场建议跳过")) missingSportteryRender += 1;
if (
  !sportteryRenderHtml.includes("投注清单") ||
  !sportteryRenderHtml.includes("周三001") ||
  !sportteryRenderHtml.includes("模型") ||
  !sportteryRenderHtml.includes("EV") ||
  !sportteryRenderHtml.includes("亏损") ||
  !sportteryRenderHtml.includes("安全垫") ||
  !sportteryRenderHtml.includes("单位")
) missingBettingSlipRender += 1;
const sportterySlipText = buildSportterySlipText([{
  match: {
    matchNum: "周三001",
    homeTeam: "阿根廷",
    awayTeam: "法国",
  },
  advice: sportteryAdvice,
}]);
if (
  !sportteryRenderHtml.includes("复制清单") ||
  !sportteryRenderHtml.includes("下载清单") ||
  !sportterySlipText.includes("周三001") ||
  !sportterySlipText.includes("阿根廷 vs 法国") ||
  !sportterySlipText.includes("胜平负 · 主胜") ||
  !sportterySlipText.includes("支持单关") ||
  !sportterySlipText.includes("EV")
) missingBettingSlipActions += 1;
if (
  !sportterySlipText.includes("亏损") ||
  !sportterySlipText.includes("安全垫") ||
  !sportterySlipText.includes("单位") ||
  !sportterySlipText.includes("1u")
) missingBettingSlipRiskFields += 1;
const mixedSlipRows = [
  {
    match: {
      matchNum: "周三001",
      homeTeam: "阿根廷",
      awayTeam: "法国",
    },
    advice: sportteryAdvice,
  },
  {
    match: {
      matchNum: "周三002",
      homeTeam: "巴西",
      awayTeam: "德国",
    },
    advice: {
      complete: true,
      recommended: {
        poolLabel: "总进球",
        optionLabel: "3球",
        single: "需过关",
        odds: 3,
        modelProbability: 0.36,
        lossProbability: 0.64,
        expectedReturn: 0.08,
        edge: 0.0267,
        verdict: "高波动",
        tone: "watch",
      },
    },
  },
];
const filteredSlipText = buildSportterySlipText(mixedSlipRows, true);
const fullSlipText = buildSportterySlipText(mixedSlipRows, false);
const filteredSlipHtml = renderSportteryBettingSlip(mixedSlipRows);
if (
  filteredSlipText.includes("周三002") ||
  !fullSlipText.includes("周三002") ||
  filteredSlipHtml.includes("周三002") ||
  !filteredSlipHtml.includes("只看可下注")
) invalidSportterySlipFilter += 1;
const volatileHtml = renderSportteryRecommendation({
  complete: true,
  count: 1000,
  recommended: {
    poolLabel: "总进球",
    optionLabel: "3球",
    odds: 3,
    modelProbability: 0.36,
    expectedReturn: 0.08,
    verdict: "高波动",
    tone: "watch",
  },
});
if (!volatileHtml.includes("本场建议跳过") || volatileHtml.includes("保守建议")) invalidSportteryVolatileRender += 1;

renderTeamProfile(teams.find((team) => team.en === "Spain"));
const profileHtml = document.nodes["#teamDrawerBody"].innerHTML;
if (!profileHtml.includes("阵容信息") || !profileHtml.includes("squad-table") || !profileHtml.includes("<tbody>")) missingTeamDetail += 1;

globalThis.validation = {
  teams: teams.length,
  simulations: 500,
  missingChampion,
  missingMatches,
  missingR32,
  invalidThirdCombos,
  missingThirdTableRows,
  invalidThirdTableRows,
  seededMismatch,
  missingTeamDetail,
  invalidMatchPrediction,
  seededMatchMismatch,
  invalidBettingAdvice,
  invalidSportteryRecommendation,
  missingSportteryRender,
  missingBettingSlipRender,
  missingBettingSlipActions,
  missingBettingSlipRiskFields,
  invalidSportteryVolatileRender,
  invalidSportterySinglePriority,
  invalidSportterySlipFilter,
  invalidRealSportterySnapshot,
};
`, context);

const result = context.validation;
if (
  result.teams !== 48 ||
  result.missingChampion ||
  result.missingMatches ||
  result.missingR32 ||
  result.invalidThirdCombos ||
  result.missingThirdTableRows ||
  result.invalidThirdTableRows ||
  result.seededMismatch ||
  result.missingTeamDetail ||
  result.invalidMatchPrediction ||
  result.seededMatchMismatch ||
  result.invalidBettingAdvice ||
  result.invalidSportteryRecommendation ||
  result.missingSportteryRender ||
  result.missingBettingSlipRender ||
  result.missingBettingSlipActions ||
  result.missingBettingSlipRiskFields ||
  result.invalidSportteryVolatileRender ||
  result.invalidSportterySinglePriority ||
  result.invalidSportterySlipFilter ||
  result.invalidRealSportterySnapshot
) {
  throw new Error(`Simulator validation failed: ${JSON.stringify(result)}`);
}

if (removedFeatureMatches.length) {
  throw new Error(`Removed feature residue found: ${removedFeatureMatches.join(", ")}`);
}

console.log(`Validated ${result.simulations} tournaments, ${result.teams} teams, single-match prediction, Sporttery recommendation, 495 third-place table rows, fixed knockout bracket complete.`);
