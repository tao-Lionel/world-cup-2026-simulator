import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

function extractConst(name) {
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
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === stringQuote) {
        inString = false;
      }
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

function parseConst(name) {
  return vm.runInNewContext(`(${extractConst(name)})`, {});
}

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

const baseTeams = parseConst("baseTeams");
const sourceTiers = parseConst("SOURCE_TIERS");
const dataFields = parseConst("DATA_FIELDS");
const teamFactors = parseConst("teamFactors");
const modelWeights = parseConst("MODEL_WEIGHTS");

function normalize(value, min, max) {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function oddsProbability(odds) {
  if (!odds) return 0.002;
  return odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
}

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

function fieldValue(team, factors, field) {
  if (field.key === "group") return team.group;
  if (field.key === "host") return team.host === true;
  return factors[field.key];
}

function dataReliability(team, factors) {
  const filledFields = dataFields.filter((field) => {
    const value = fieldValue(team, factors, field);
    return value !== undefined && value !== null && value !== "";
  });
  const score = filledFields.reduce((sum, field) => sum + sourceTiers[field.tier].weight, 0);
  const reliableCount = filledFields.filter((field) => ["verified", "market", "research", "snapshot"].includes(field.tier)).length;
  const proxyCount = filledFields.length - reliableCount;
  return {
    coverage: Math.round((filledFields.length / dataFields.length) * 100),
    score: Math.round((score / dataFields.length) * 100),
    reliableCount,
    proxyCount,
  };
}

function modelRating(factors) {
  const score =
    modelWeights.fifa * normalize(factors.fifaPoints, 1280, 1877) +
    modelWeights.elo * normalize(factors.elo, 1420, 2170) +
    modelWeights.odds * normalize(Math.sqrt(oddsProbability(factors.odds)), 0.03, 0.43) +
    modelWeights.form * normalize(factors.form, 45, 82) +
    modelWeights.squad * normalize(Math.log10(factors.squadValue + 30), 1.45, 3.25) +
    modelWeights.wcPath * normalize(factors.wcPath, 12, 96) +
    modelWeights.health * (1 - normalize(factors.injuryRisk, 15, 28)) +
    modelWeights.club * normalize(factors.clubScore, 30, 94) +
    modelWeights.atmosphere * normalize(factors.atmosphere, 48, 86) +
    modelWeights.schedule * scheduleScore(factors);
  return Math.round(1375 + (score * 760));
}

const factorHeaders = [
  "team",
  "group",
  "confed",
  "host",
  "model_rating",
  "data_coverage",
  "data_quality",
  "source_backed_fields",
  "proxy_fields",
  "fifa_rank",
  "fifa_points",
  "elo",
  "form",
  "wc_path",
  "odds",
  "squad_status",
  "squad_announcement_status",
  "squad_announcement_date",
  "squad_value_m",
  "avg_age",
  "injury_risk",
  "club_score",
  "atmosphere",
  "travel_km",
  "rest_days",
  "timezone_shift_hours",
  "entry_travel_km",
  "entry_timezone_shift_hours",
  "border_crossings",
  "altitude_load_m",
  "climate_load",
];

const teamRows = baseTeams.map((team) => {
  const factors = teamFactors[team.en];
  if (!factors) throw new Error(`Missing factors for ${team.en}`);
  const reliability = dataReliability(team, factors);
  return [
    team.en,
    team.group,
    team.confed,
    team.host ? "true" : "false",
    modelRating(factors),
    reliability.coverage,
    reliability.score,
    reliability.reliableCount,
    reliability.proxyCount,
    factors.fifaRank,
    factors.fifaPoints,
    factors.elo,
    factors.form,
    factors.wcPath,
    factors.odds,
    factors.squadStatus,
    factors.squadAnnouncementStatus,
    factors.squadAnnouncementDate,
    factors.squadValue,
    factors.avgAge,
    factors.injuryRisk,
    factors.clubScore,
    factors.atmosphere,
    factors.travelKm,
    factors.restDays,
    factors.timezoneShift,
    factors.entryTravelKm,
    factors.entryTimezoneShift,
    factors.borderCrossings,
    factors.altitudeLoad,
    factors.climateLoad,
  ];
});

const fieldHeaders = ["field", "label", "tier", "tier_label", "tier_weight", "source"];
const fieldRows = dataFields.map((field) => [
  field.key,
  field.label,
  field.tier,
  sourceTiers[field.tier].label,
  sourceTiers[field.tier].weight,
  field.source,
]);

const weightHeaders = ["factor", "weight"];
const weightRows = Object.entries(modelWeights);

const writeCsv = (path, headers, rows) => writeFile(
  new URL(path, import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ].join("\n") + "\n",
);

await writeCsv("../data/team_factors_snapshot.csv", factorHeaders, teamRows);
await writeCsv("../data/source_manifest.csv", fieldHeaders, fieldRows);
await writeCsv("../data/model_weights.csv", weightHeaders, weightRows);
await writeFile(
  new URL("../data/team_factors_snapshot.json", import.meta.url),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    note: "Exported from app.js. Proxy fields should be replaced by source-specific datasets over time.",
    teams: baseTeams.map((team) => ({
      ...team,
      factors: teamFactors[team.en],
    })),
  }, null, 2) + "\n",
);

console.log(`Exported ${teamRows.length} teams, ${fieldRows.length} source fields, ${weightRows.length} model weights.`);
