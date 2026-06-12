import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

// Fits MODEL_WEIGHTS against real match outcomes from data/backtest_matches.csv.
// Rating = weighted sum of the same normalised sub-scores app.js uses; outcome
// probabilities come from a Davidson win/draw/loss model on the rating gap.
// fifa/elo/form use leak-free pre-match values replayed per match; squad,
// wcPath, club and odds use the current snapshot (slow-moving or documented
// as a leak caveat in DATA_SOURCES.md). health/atmosphere/schedule are
// tournament-specific adjustments that past matches cannot validate, so they
// keep fixed weights and only the remaining budget is fitted.

const FACTORS = ["fifa", "elo", "odds", "form", "squad", "wcPath", "health", "club", "atmosphere", "schedule"];
const FITTED_FACTORS = ["fifa", "elo", "odds", "form", "squad", "wcPath", "club"];
const FIXED_WEIGHTS = { health: 0.05, atmosphere: 0.02, schedule: 0.01 };
const FIT_BUDGET = 1 - Object.values(FIXED_WEIGHTS).reduce((sum, value) => sum + value, 0);
const MIN_WEIGHT = 0.01;
const FOLDS = 5;

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

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines.map((line) => {
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
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

// Mirrors of app.js scoring helpers (keep in sync with computeModelRating).
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const normalize = (value, min, max) => clamp((value - min) / (max - min), 0, 1);
const oddsProbability = (odds) => {
  if (!odds) return 0.002;
  return odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
};
function scheduleScore(factors) {
  const travelScore = 1 - normalize(factors.travelKm, 0, 5500);
  const restScore = normalize(factors.restDays, 4.8, 6.6);
  const timezoneScore = 1 - normalize(factors.timezoneShift ?? 0, 0, 3);
  const entryTravelScore = 1 - normalize(factors.entryTravelKm ?? 0, 0, 15000);
  const entryTimezoneScore = 1 - normalize(factors.entryTimezoneShift ?? 0, 0, 19);
  const borderScore = 1 - normalize(factors.borderCrossings ?? 0, 0, 2);
  const altitudeScore = 1 - normalize(factors.altitudeLoad ?? 0, 0, 2240);
  const climateScore = 1 - normalize(factors.climateLoad ?? 0, 20, 80);
  return (
    travelScore * 0.32 +
    restScore * 0.22 +
    timezoneScore * 0.1 +
    entryTravelScore * 0.1 +
    entryTimezoneScore * 0.07 +
    borderScore * 0.07 +
    altitudeScore * 0.06 +
    climateScore * 0.06
  );
}

function staticSubScores(factors) {
  return {
    odds: normalize(Math.sqrt(oddsProbability(factors.odds)), 0.03, 0.43),
    squad: normalize(Math.log10(factors.squadValue + 30), 1.45, 3.25),
    wcPath: normalize(factors.wcPath, 12, 96),
    health: 1 - normalize(factors.injuryRisk, 15, 28),
    club: normalize(factors.clubScore, 30, 94),
    atmosphere: normalize(factors.atmosphere, 48, 86),
    schedule: scheduleScore(factors),
  };
}

// Generic Nelder-Mead minimiser.
function nelderMead(fn, x0, { maxIterations = 6000, step = 0.25 } = {}) {
  const n = x0.length;
  let simplex = [x0.slice()];
  for (let i = 0; i < n; i += 1) {
    const point = x0.slice();
    point[i] += step;
    simplex.push(point);
  }
  let values = simplex.map(fn);
  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const order = values.map((value, index) => index).sort((a, b) => values[a] - values[b]);
    simplex = order.map((index) => simplex[index]);
    values = order.map((index) => values[index]);
    if (Math.abs(values[n] - values[0]) < 1e-9) break;
    const centroid = new Array(n).fill(0);
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) centroid[j] += simplex[i][j] / n;
    }
    const worst = simplex[n];
    const reflect = centroid.map((c, j) => c + (c - worst[j]));
    const reflectValue = fn(reflect);
    if (reflectValue < values[0]) {
      const expand = centroid.map((c, j) => c + 2 * (c - worst[j]));
      const expandValue = fn(expand);
      if (expandValue < reflectValue) {
        simplex[n] = expand;
        values[n] = expandValue;
      } else {
        simplex[n] = reflect;
        values[n] = reflectValue;
      }
    } else if (reflectValue < values[n - 1]) {
      simplex[n] = reflect;
      values[n] = reflectValue;
    } else {
      const contract = centroid.map((c, j) => c + 0.5 * (worst[j] - c));
      const contractValue = fn(contract);
      if (contractValue < values[n]) {
        simplex[n] = contract;
        values[n] = contractValue;
      } else {
        for (let i = 1; i <= n; i += 1) {
          simplex[i] = simplex[i].map((value, j) => simplex[0][j] + 0.5 * (value - simplex[0][j]));
          values[i] = fn(simplex[i]);
        }
      }
    }
  }
  const best = values.indexOf(Math.min(...values));
  return { x: simplex[best], value: values[best] };
}

// Softmax over fitted factors, scaled to the fitting budget.
function budgetWeights(z) {
  const logits = [0, ...z];
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  const fitted = exps.map((value) => (value / total) * FIT_BUDGET);
  const weights = {};
  FITTED_FACTORS.forEach((factor, index) => {
    weights[factor] = fitted[index];
  });
  return { ...weights, ...FIXED_WEIGHTS };
}

// Davidson model: P(home), P(draw), P(away) from the rating gap.
function matchProbabilities(gap, nu) {
  const eH = Math.exp(gap);
  const eA = Math.exp(-gap);
  const z = eH + eA + nu;
  return [eH / z, nu / z, eA / z];
}

function buildEvaluator(matches, staticScores) {
  return (weights, scale, nu, homeAdvantage) => {
    let lossSum = 0;
    let brierSum = 0;
    let weightSum = 0;
    for (const match of matches) {
      let gap = 0;
      for (const factor of FACTORS) {
        const weight = weights[factor];
        if (!weight) continue;
        let sHome;
        let sAway;
        if (factor === "elo") {
          sHome = normalize(match.homeEloPre, 1420, 2170);
          sAway = normalize(match.awayEloPre, 1420, 2170);
        } else if (factor === "fifa") {
          sHome = normalize(match.homeFifaPre, 1280, 1877);
          sAway = normalize(match.awayFifaPre, 1280, 1877);
        } else if (factor === "form") {
          sHome = normalize(match.homeFormPre, 45, 82);
          sAway = normalize(match.awayFormPre, 45, 82);
        } else {
          sHome = staticScores.get(match.home_team)[factor];
          sAway = staticScores.get(match.away_team)[factor];
        }
        gap += weight * (sHome - sAway);
      }
      gap = scale * gap + (match.neutral ? 0 : homeAdvantage);
      const probabilities = matchProbabilities(gap, nu);
      const outcome = match.outcome; // 0 home win, 1 draw, 2 away win
      const w = match.weight;
      lossSum += -Math.log(Math.max(probabilities[outcome], 1e-12)) * w;
      let brier = 0;
      for (let i = 0; i < 3; i += 1) brier += (probabilities[i] - (i === outcome ? 1 : 0)) ** 2;
      brierSum += brier * w;
      weightSum += w;
    }
    return { logLoss: lossSum / weightSum, brier: brierSum / weightSum };
  };
}

function fitOutcomeParams(evaluate, weights) {
  const objective = (params) => evaluate(weights, Math.exp(params[0]), Math.exp(params[1]), params[2]).logLoss;
  const { x } = nelderMead(objective, [Math.log(6), Math.log(0.9), 0.3], { step: 0.4 });
  return { scale: Math.exp(x[0]), nu: Math.exp(x[1]), homeAdvantage: x[2] };
}

function fitWeights(evaluate) {
  const zLength = FITTED_FACTORS.length - 1;
  const objective = (params) => {
    const weights = budgetWeights(params.slice(0, zLength));
    return evaluate(weights, Math.exp(params[zLength]), Math.exp(params[zLength + 1]), params[zLength + 2]).logLoss;
  };
  let best = null;
  for (const seedStep of [0.3, 0.7]) {
    const result = nelderMead(objective, [...new Array(zLength).fill(0), Math.log(6), Math.log(0.9), 0.3], { step: seedStep });
    if (!best || result.value < best.value) best = result;
  }
  return {
    weights: budgetWeights(best.x.slice(0, zLength)),
    scale: Math.exp(best.x[zLength]),
    nu: Math.exp(best.x[zLength + 1]),
    homeAdvantage: best.x[zLength + 2],
  };
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const baseTeams = vm.runInNewContext(`(${extractConst(appSource, "baseTeams")})`, {});
const teamFactors = vm.runInNewContext(`(${extractConst(appSource, "teamFactors")})`, {});
const currentWeights = vm.runInNewContext(`(${extractConst(appSource, "MODEL_WEIGHTS")})`, {});

const staticScores = new Map(
  baseTeams.map((team) => [team.en, staticSubScores(teamFactors[team.en])]),
);

const rows = parseCsv(await readFile(new URL("../data/backtest_matches.csv", import.meta.url), "utf8"));
const matches = rows.map((row) => ({
  home_team: row.home_team,
  away_team: row.away_team,
  homeEloPre: Number(row.home_elo_pre),
  awayEloPre: Number(row.away_elo_pre),
  homeFifaPre: Number(row.home_fifa_pre),
  awayFifaPre: Number(row.away_fifa_pre),
  homeFormPre: Number(row.home_form_pre),
  awayFormPre: Number(row.away_form_pre),
  neutral: row.neutral === "TRUE",
  weight: Number(row.match_weight),
  outcome: Number(row.home_score) > Number(row.away_score) ? 0 : Number(row.home_score) === Number(row.away_score) ? 1 : 2,
}));
console.log(`Loaded ${matches.length} matches.`);

// Shuffled k-fold split with a fixed seed for reproducibility.
const random = mulberry32(20260612);
const indices = matches.map((_, index) => index);
for (let i = indices.length - 1; i > 0; i -= 1) {
  const j = Math.floor(random() * (i + 1));
  [indices[i], indices[j]] = [indices[j], indices[i]];
}
const folds = Array.from({ length: FOLDS }, (_, fold) => indices.filter((_, position) => position % FOLDS === fold));

const singleFactor = (factor) => ({ [factor]: FIT_BUDGET, ...FIXED_WEIGHTS });
const candidates = [
  { name: "fitted", weights: null },
  { name: "current", weights: currentWeights },
  { name: "equal", weights: { ...Object.fromEntries(FITTED_FACTORS.map((factor) => [factor, FIT_BUDGET / FITTED_FACTORS.length])), ...FIXED_WEIGHTS } },
  { name: "elo_only", weights: singleFactor("elo") },
  { name: "fifa_only", weights: singleFactor("fifa") },
  { name: "odds_only", weights: singleFactor("odds") },
  { name: "form_only", weights: singleFactor("form") },
];

const report = [];
const finalWeightsByCandidate = {};
for (const candidate of candidates) {
  let logLossSum = 0;
  let brierSum = 0;
  for (const fold of folds) {
    const holdout = new Set(fold);
    const trainMatches = matches.filter((_, index) => !holdout.has(index));
    const testMatches = matches.filter((_, index) => holdout.has(index));
    const trainEvaluate = buildEvaluator(trainMatches, staticScores);
    const testEvaluate = buildEvaluator(testMatches, staticScores);
    let weights = candidate.weights;
    let params;
    if (candidate.name === "fitted") {
      const fit = fitWeights(trainEvaluate);
      weights = fit.weights;
      params = fit;
    } else {
      params = fitOutcomeParams(trainEvaluate, weights);
    }
    const { logLoss, brier } = testEvaluate(weights, params.scale, params.nu, params.homeAdvantage);
    logLossSum += logLoss;
    brierSum += brier;
  }
  report.push({
    candidate: candidate.name,
    cv_log_loss: (logLossSum / FOLDS).toFixed(4),
    cv_brier: (brierSum / FOLDS).toFixed(4),
  });
  console.log(`${candidate.name}: CV log-loss ${(logLossSum / FOLDS).toFixed(4)}, Brier ${(brierSum / FOLDS).toFixed(4)}`);
}

// Final fit on all matches for the published weights.
const fullEvaluate = buildEvaluator(matches, staticScores);
const finalFit = fitWeights(fullEvaluate);
const flooredEntries = FITTED_FACTORS.map((factor) => Math.max(finalFit.weights[factor], MIN_WEIGHT));
const flooredTotal = flooredEntries.reduce((sum, value) => sum + value, 0);
const scaled = flooredEntries.map((value) => (value / flooredTotal) * FIT_BUDGET);
const rounded = scaled.map((value) => Math.round(value * 100) / 100);
const roundingGap = Math.round((FIT_BUDGET - rounded.reduce((sum, value) => sum + value, 0)) * 100) / 100;
rounded[rounded.indexOf(Math.max(...rounded))] = Math.round((rounded[rounded.indexOf(Math.max(...rounded))] + roundingGap) * 100) / 100;
const finalWeights = { ...FIXED_WEIGHTS };
FITTED_FACTORS.forEach((factor, index) => {
  finalWeights[factor] = rounded[index];
});

console.log("Fitted weights (incl. fixed tournament factors):");
FACTORS.forEach((factor) => console.log(`  ${factor}: ${finalWeights[factor].toFixed(2)}${factor in FIXED_WEIGHTS ? " (fixed)" : ` (raw ${finalFit.weights[factor].toFixed(3)})`}`));
console.log(`Outcome params: scale ${finalFit.scale.toFixed(2)}, nu ${finalFit.nu.toFixed(3)}, home advantage ${finalFit.homeAdvantage.toFixed(3)}`);

for (const candidate of candidates) {
  finalWeightsByCandidate[candidate.name] = candidate.name === "fitted" ? finalWeights : candidate.weights;
}
const reportHeaders = ["candidate", "cv_log_loss", "cv_brier", ...FACTORS.map((factor) => `w_${factor}`)];
const reportRows = report.map((row) => ({
  ...row,
  ...Object.fromEntries(FACTORS.map((factor) => [
    `w_${factor}`,
    (finalWeightsByCandidate[row.candidate][factor] ?? 0).toFixed(2),
  ])),
}));
await writeFile(
  new URL("../data/model_weights_backtest.csv", import.meta.url),
  [
    reportHeaders.join(","),
    ...reportRows.map((row) => reportHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

await writeFile(
  new URL("../data/model_weights_fitted.csv", import.meta.url),
  ["factor,weight", ...FACTORS.map((factor) => `${factor},${finalWeights[factor]}`)].join("\n") + "\n",
);

console.log("Wrote data/model_weights_backtest.csv and data/model_weights_fitted.csv.");
