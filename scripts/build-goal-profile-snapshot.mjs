import { readFile, writeFile } from "node:fs/promises";

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

function round(value) {
  return Math.round(value * 1000) / 1000;
}

const rows = parseCsv(await readFile(new URL("../data/recent_matches_2024_2026.csv", import.meta.url), "utf8"));
const byTeam = new Map();
for (const row of rows) {
  const goalsFor = Number(row.goals_for);
  const goalsAgainst = Number(row.goals_against);
  if (!row.team || !Number.isFinite(goalsFor) || !Number.isFinite(goalsAgainst)) continue;
  if (!byTeam.has(row.team)) byTeam.set(row.team, []);
  byTeam.get(row.team).push({
    date: row.date,
    goalsFor,
    goalsAgainst,
    totalGoals: goalsFor + goalsAgainst,
  });
}

const teams = {};
let snapshotDate = "";
for (const [team, matches] of [...byTeam.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  matches.sort((a, b) => b.date.localeCompare(a.date));
  const buckets = Object.fromEntries(["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((key) => [key, 0]));
  let weightTotal = 0;
  let goalsForTotal = 0;
  let goalsAgainstTotal = 0;
  let totalGoalsTotal = 0;
  matches.forEach((match, index) => {
    const weight = Math.pow(0.92, index);
    const bucket = `s${Math.min(match.totalGoals, 7)}`;
    buckets[bucket] += weight;
    weightTotal += weight;
    goalsForTotal += match.goalsFor * weight;
    goalsAgainstTotal += match.goalsAgainst * weight;
    totalGoalsTotal += match.totalGoals * weight;
    if (match.date > snapshotDate) snapshotDate = match.date;
  });
  teams[team] = {
    matches: matches.length,
    weightedMatches: round(weightTotal),
    avgFor: round(goalsForTotal / weightTotal),
    avgAgainst: round(goalsAgainstTotal / weightTotal),
    avgTotal: round(totalGoalsTotal / weightTotal),
    totalGoalBuckets: Object.fromEntries(
      Object.entries(buckets).map(([key, value]) => [key, round(value / weightTotal)]),
    ),
  };
}

const snapshot = {
  source: "data/recent_matches_2024_2026.csv",
  snapshotDate,
  teamCount: Object.keys(teams).length,
  teams,
};

await writeFile(
  new URL("../data/recent_goal_profiles.json", import.meta.url),
  JSON.stringify(snapshot, null, 2) + "\n",
);
await writeFile(
  new URL("../data/recent_goal_profiles.js", import.meta.url),
  `globalThis.RECENT_GOAL_PROFILES = ${JSON.stringify(snapshot, null, 2)};\n`,
);

console.log(`Built recent goal profiles for ${snapshot.teamCount} teams through ${snapshot.snapshotDate}.`);
