import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

// Builds data/backtest_matches.csv: every completed match between two of the
// 48 finalists since WINDOW_START, with leak-free pre-match Elo, FIFA-SUM
// points and recent-form scores reconstructed by replaying the full
// match history. Engine Elo/FIFA levels are linearly calibrated to the
// official snapshots in app.js so the same normalize() bounds apply.

const SOURCE_URL = "https://raw.githubusercontent.com/martj42/international_results/master/results.csv";
const WINDOW_START = "2022-07-01";

// Dataset uses common English names; model uses FIFA names.
const datasetAliases = {
  "Korea Republic": "South Korea",
  Czechia: "Czech Republic",
  USA: "United States",
  "Türkiye": "Turkey",
  Curacao: "Curaçao",
  "Cote d'Ivoire": "Ivory Coast",
  "IR Iran": "Iran",
  "Cabo Verde": "Cape Verde",
  "Congo DR": "DR Congo",
};

function extractConst(source, name) {
  const start = source.indexOf(`const ${name} = `);
  if (start === -1) throw new Error(`Missing const ${name}`);
  const valueStart = start + `const ${name} = `.length;
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escape = false;
  for (let index = valueStart; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === stringQuote) inString = false;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }
    if (char === "{" || char === "[") depth += 1;
    if (char === "}" || char === "]") depth -= 1;
    if (depth === 0 && char === ";") return source.slice(valueStart, index);
  }
  throw new Error(`Could not parse const ${name}`);
}

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"" && line[index + 1] === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

// eloratings.net-style K factors plus log-loss weights for the fit.
function matchImportance(tournament) {
  const name = tournament.toLowerCase();
  if (name === "fifa world cup") return { k: 60, weight: 1 };
  if (name.includes("qualification")) return { k: 40, weight: 1 };
  if (
    name.includes("euro") ||
    name.includes("copa américa") ||
    name.includes("copa america") ||
    name.includes("african cup") ||
    name.includes("africa cup") ||
    name.includes("asian cup") ||
    name.includes("gold cup")
  ) return { k: 50, weight: 1 };
  if (name.includes("nations league") || name.includes("confederations")) return { k: 40, weight: 1 };
  if (name === "friendly") return { k: 20, weight: 0.6 };
  return { k: 30, weight: 0.8 };
}

// FIFA SUM importance coefficients (approximated from tournament name only;
// knockout-stage boosts and the no-deduction knockout rule are not applied).
function fifaImportance(tournament) {
  const name = tournament.toLowerCase();
  if (name === "fifa world cup") return 50;
  if (name.includes("qualification")) return 25;
  if (
    name.includes("euro") ||
    name.includes("copa américa") ||
    name.includes("copa america") ||
    name.includes("african cup") ||
    name.includes("africa cup") ||
    name.includes("asian cup") ||
    name.includes("gold cup")
  ) return 35;
  if (name.includes("nations league")) return 15;
  if (name === "friendly") return 10;
  return 10;
}

// Mirrors computeForm in fetch-recent-form.mjs.
function formScore(history, matchDate) {
  if (!history.length) return 60;
  const latest = new Date(`${matchDate}T12:00:00Z`);
  let weightedPoints = 0;
  let weightSum = 0;
  let weightedGoalDiff = 0;
  for (const entry of history) {
    const ageDays = (latest - new Date(entry.date)) / 86400000;
    const recency = Math.max(0.45, 1 - (ageDays / 820) * 0.55);
    const resultPoints = entry.result === "W" ? 3 : entry.result === "D" ? 1 : 0;
    weightedPoints += resultPoints * recency;
    weightedGoalDiff += Math.max(-3, Math.min(3, entry.goalDiff)) * recency;
    weightSum += recency;
  }
  const pointsPerGame = weightedPoints / weightSum;
  const avgGoalDiff = weightedGoalDiff / weightSum;
  return Math.round(Math.max(42, Math.min(84, 44 + pointsPerGame * 11 + avgGoalDiff * 3)));
}

function linearCalibration(pairs) {
  const n = pairs.length;
  const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / n;
  const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / n;
  let covariance = 0;
  let variance = 0;
  for (const [x, y] of pairs) {
    covariance += (x - meanX) * (y - meanY);
    variance += (x - meanX) ** 2;
  }
  const slope = covariance / variance;
  return { slope, intercept: meanY - slope * meanX };
}

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const baseTeams = vm.runInNewContext(`(${extractConst(appSource, "baseTeams")})`, {});
const teamFactors = vm.runInNewContext(`(${extractConst(appSource, "teamFactors")})`, {});
const datasetToModel = new Map(
  baseTeams.map((team) => [datasetAliases[team.en] || team.en, team.en]),
);

const response = await fetch(SOURCE_URL);
if (!response.ok) throw new Error(`martj42/international_results: HTTP ${response.status}`);
const text = await response.text();
const lines = text.trim().split(/\r?\n/);
const headers = lines.shift().split(",");
const col = Object.fromEntries(headers.map((header, index) => [header, index]));

const elo = new Map();
const fifa = new Map();
const recent = new Map();
const getElo = (team) => elo.get(team) ?? 1500;
const getFifa = (team) => fifa.get(team) ?? 1400;
const getRecent = (team) => {
  if (!recent.has(team)) recent.set(team, []);
  return recent.get(team);
};
const today = new Date().toISOString().slice(0, 10);
const output = [];

for (const line of lines) {
  const cells = parseCsvLine(line);
  const date = cells[col.date];
  const homeScore = Number(cells[col.home_score]);
  const awayScore = Number(cells[col.away_score]);
  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) continue;
  if (date > today) continue;
  const home = cells[col.home_team];
  const away = cells[col.away_team];
  const tournament = cells[col.tournament];
  const neutral = cells[col.neutral] === "TRUE";
  const { k, weight } = matchImportance(tournament);

  const homeElo = getElo(home);
  const awayElo = getElo(away);
  const homeFifa = getFifa(home);
  const awayFifa = getFifa(away);

  const modelHome = datasetToModel.get(home);
  const modelAway = datasetToModel.get(away);
  if (date >= WINDOW_START && modelHome && modelAway) {
    output.push({
      date,
      home_team: modelHome,
      away_team: modelAway,
      home_score: homeScore,
      away_score: awayScore,
      tournament,
      neutral: neutral ? "TRUE" : "FALSE",
      home_elo_pre: homeElo,
      away_elo_pre: awayElo,
      home_fifa_pre: homeFifa,
      away_fifa_pre: awayFifa,
      home_form_pre: formScore(getRecent(home), date),
      away_form_pre: formScore(getRecent(away), date),
      match_weight: weight,
    });
  }

  // Elo update (goal-difference multiplier, +100 home advantage).
  const goalDiff = Math.abs(homeScore - awayScore);
  const multiplier = goalDiff <= 1 ? 1 : goalDiff === 2 ? 1.5 : goalDiff === 3 ? 1.75 : 1.75 + (goalDiff - 3) / 8;
  const eloExpected = 1 / (1 + 10 ** ((awayElo - (homeElo + (neutral ? 0 : 100))) / 400));
  const result = homeScore > awayScore ? 1 : homeScore < awayScore ? 0 : 0.5;
  const eloDelta = k * multiplier * (result - eloExpected);
  elo.set(home, homeElo + eloDelta);
  elo.set(away, awayElo - eloDelta);

  // FIFA SUM update (no home advantage, no goal-difference term).
  const importance = fifaImportance(tournament);
  const fifaExpectedHome = 1 / (10 ** (-(homeFifa - awayFifa) / 600) + 1);
  fifa.set(home, homeFifa + importance * (result - fifaExpectedHome));
  fifa.set(away, awayFifa + importance * ((1 - result) - (1 - fifaExpectedHome)));

  // Recent-form history (last 10 matches per team).
  const homeHistory = getRecent(home);
  const awayHistory = getRecent(away);
  homeHistory.push({ date, result: result === 1 ? "W" : result === 0.5 ? "D" : "L", goalDiff: homeScore - awayScore });
  awayHistory.push({ date, result: result === 0 ? "W" : result === 0.5 ? "D" : "L", goalDiff: awayScore - homeScore });
  if (homeHistory.length > 10) homeHistory.shift();
  if (awayHistory.length > 10) awayHistory.shift();
}

if (output.length < 300) throw new Error(`Too few backtest matches: ${output.length}`);

// Calibrate engine Elo/FIFA levels to the official snapshots in app.js so the
// backtest can reuse the model's normalize() bounds.
const eloPairs = [];
const fifaPairs = [];
for (const [datasetName, modelName] of datasetToModel) {
  const factors = teamFactors[modelName];
  if (!factors) continue;
  eloPairs.push([getElo(datasetName), factors.elo]);
  fifaPairs.push([getFifa(datasetName), factors.fifaPoints]);
}
const eloFit = linearCalibration(eloPairs);
const fifaFit = linearCalibration(fifaPairs);
const correlate = (pairs) => {
  const n = pairs.length;
  const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / n;
  const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pairs) {
    sxy += (x - meanX) * (y - meanY);
    sxx += (x - meanX) ** 2;
    syy += (y - meanY) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
};

for (const row of output) {
  row.home_elo_pre = Math.round(eloFit.slope * row.home_elo_pre + eloFit.intercept);
  row.away_elo_pre = Math.round(eloFit.slope * row.away_elo_pre + eloFit.intercept);
  row.home_fifa_pre = Math.round(fifaFit.slope * row.home_fifa_pre + fifaFit.intercept);
  row.away_fifa_pre = Math.round(fifaFit.slope * row.away_fifa_pre + fifaFit.intercept);
}

const outHeaders = [
  "date",
  "home_team",
  "away_team",
  "home_score",
  "away_score",
  "tournament",
  "neutral",
  "home_elo_pre",
  "away_elo_pre",
  "home_fifa_pre",
  "away_fifa_pre",
  "home_form_pre",
  "away_form_pre",
  "match_weight",
];
await writeFile(
  new URL("../data/backtest_matches.csv", import.meta.url),
  [
    outHeaders.join(","),
    ...output.map((row) => outHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Prepared ${output.length} backtest matches (${WINDOW_START} .. ${today}) from ${lines.length} historical games.`);
console.log(`Engine vs snapshot correlation: Elo ${correlate(eloPairs).toFixed(3)} (slope ${eloFit.slope.toFixed(2)}), FIFA ${correlate(fifaPairs).toFixed(3)} (slope ${fifaFit.slope.toFixed(2)}).`);
