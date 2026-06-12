import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const sourceUrl = "https://raw.githubusercontent.com/martj42/international_results/master/results.csv";
const snapshotDate = new Date().toISOString().slice(0, 10);
const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");

function extractConst(name) {
  const start = appSource.indexOf(`const ${name} = `);
  if (start === -1) throw new Error(`Missing const ${name}`);
  const valueStart = start + `const ${name} = `.length;
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escape = false;

  for (let index = valueStart; index < appSource.length; index += 1) {
    const char = appSource[index];
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
    if (depth === 0 && char === ";") return appSource.slice(valueStart, index);
  }
  throw new Error(`Could not parse const ${name}`);
}

function parseConst(name) {
  return vm.runInNewContext(`(${extractConst(name)})`, {});
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === "\"" && next === "\"") {
        cell += "\"";
        index += 1;
      } else if (char === "\"") {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...data] = rows;
  return data
    .filter((values) => values.some(Boolean))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function pairKey(a, b) {
  return [a, b].sort().join("||");
}

const baseTeams = parseConst("baseTeams");
const teamFactors = parseConst("teamFactors");
const aliases = {
  "Korea Republic": ["South Korea", "Korea Republic"],
  Czechia: ["Czech Republic", "Czechia"],
  USA: ["United States", "USA"],
  "Türkiye": ["Turkey", "Türkiye"],
  Curacao: ["Curacao", "Curaçao"],
  "Cote d'Ivoire": ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"],
  "IR Iran": ["Iran", "IR Iran"],
  "Cabo Verde": ["Cape Verde", "Cabo Verde"],
  "Congo DR": ["DR Congo", "Congo DR", "Democratic Republic of the Congo", "Zaire"],
};

const canonicalByName = new Map();
for (const team of baseTeams) {
  const names = [team.en, team.name, ...(aliases[team.en] || [])];
  for (const name of names) {
    canonicalByName.set(normalizeName(name), team.en);
  }
}

function canonicalTeam(value) {
  return canonicalByName.get(normalizeName(value)) || null;
}

function emptyQualifying(team) {
  return {
    team: team.en,
    snapshot_date: snapshotDate,
    source: "martj42/international_results results.csv",
    source_url: sourceUrl,
    qualification_status: team.host ? "host_exempt" : "qualified",
    matches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    goal_diff: 0,
    points: 0,
    points_per_match: 0,
    away_matches: 0,
    away_points: 0,
    away_points_per_match: 0,
    qualifying_score: team.host ? 60 : teamFactors[team.en]?.form ?? 55,
    source_note: team.host
      ? "Host nation did not play 2026 World Cup qualifiers; neutral baseline avoids double-counting friendly form."
      : "No qualifying rows matched; score falls back to current form until source coverage improves.",
  };
}

function scoreQualifying(row) {
  if (row.matches === 0) return row;
  const pointsPerMatch = row.points / row.matches;
  const goalDiffPerMatch = row.goal_diff / row.matches;
  const goalsForPerMatch = row.goals_for / row.matches;
  const goalsAgainstPerMatch = row.goals_against / row.matches;
  const awayPointsPerMatch = row.away_matches ? row.away_points / row.away_matches : pointsPerMatch;
  const ppgScore = (pointsPerMatch / 3) * 100;
  const gdScore = clamp(50 + goalDiffPerMatch * 18, 0, 100);
  const attackScore = clamp((goalsForPerMatch / 3) * 100, 0, 100);
  const defenseScore = clamp(100 - (goalsAgainstPerMatch / 3) * 100, 0, 100);
  const awayScore = (awayPointsPerMatch / 3) * 100;
  return {
    ...row,
    points_per_match: round(pointsPerMatch),
    away_points_per_match: round(awayPointsPerMatch),
    qualifying_score: Math.round(
      ppgScore * 0.45 +
      gdScore * 0.25 +
      defenseScore * 0.15 +
      attackScore * 0.1 +
      awayScore * 0.05,
    ),
    source_note: "Score combines points per match, goal difference, defensive record, attacking output and away qualifying record.",
  };
}

function addTeamResult(row, goalsFor, goalsAgainst, away) {
  row.matches += 1;
  row.goals_for += goalsFor;
  row.goals_against += goalsAgainst;
  row.goal_diff += goalsFor - goalsAgainst;
  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += 3;
    if (away) row.away_points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += 1;
    if (away) row.away_points += 1;
  } else {
    row.losses += 1;
  }
  if (away) row.away_matches += 1;
}

const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Failed to fetch international results: HTTP ${response.status}`);
const results = parseCsv(await response.text());

const qualifyingByTeam = new Map(baseTeams.map((team) => [team.en, emptyQualifying(team)]));
const pairRows = [];
const pairByKey = new Map();
const teamNames = baseTeams.map((team) => team.en).sort();

for (let aIndex = 0; aIndex < teamNames.length; aIndex += 1) {
  for (let bIndex = aIndex + 1; bIndex < teamNames.length; bIndex += 1) {
    const teamA = teamNames[aIndex];
    const teamB = teamNames[bIndex];
    const key = pairKey(teamA, teamB);
    const row = {
      pair_key: key,
      team_a: teamA,
      team_b: teamB,
      matches: 0,
      competitive_matches: 0,
      team_a_wins: 0,
      draws: 0,
      team_b_wins: 0,
      team_a_goals: 0,
      team_b_goals: 0,
      recent_matches_since_2010: 0,
      recent_team_a_wins: 0,
      recent_draws: 0,
      recent_team_b_wins: 0,
      last_match_date: "",
      last_match_tournament: "",
      last_match_score: "",
      last_match_result_for_team_a: "",
      source_url: sourceUrl,
    };
    pairRows.push(row);
    pairByKey.set(key, row);
  }
}

for (const result of results) {
  const home = canonicalTeam(result.home_team);
  const away = canonicalTeam(result.away_team);
  const homeScore = Number(result.home_score);
  const awayScore = Number(result.away_score);
  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) continue;

  if (
    result.date >= "2023-09-07" &&
    result.date <= "2026-03-31" &&
    String(result.tournament).toLowerCase().includes("fifa world cup qualification")
  ) {
    if (home && qualifyingByTeam.has(home)) addTeamResult(qualifyingByTeam.get(home), homeScore, awayScore, false);
    if (away && qualifyingByTeam.has(away)) addTeamResult(qualifyingByTeam.get(away), awayScore, homeScore, true);
  }

  if (!home || !away || home === away) continue;
  const key = pairKey(home, away);
  const pair = pairByKey.get(key);
  if (!pair) continue;
  const aIsHome = pair.team_a === home;
  const aGoals = aIsHome ? homeScore : awayScore;
  const bGoals = aIsHome ? awayScore : homeScore;
  pair.matches += 1;
  pair.team_a_goals += aGoals;
  pair.team_b_goals += bGoals;
  if (result.tournament !== "Friendly") pair.competitive_matches += 1;
  if (aGoals > bGoals) pair.team_a_wins += 1;
  else if (aGoals === bGoals) pair.draws += 1;
  else pair.team_b_wins += 1;
  if (result.date >= "2010-01-01") {
    pair.recent_matches_since_2010 += 1;
    if (aGoals > bGoals) pair.recent_team_a_wins += 1;
    else if (aGoals === bGoals) pair.recent_draws += 1;
    else pair.recent_team_b_wins += 1;
  }
  if (!pair.last_match_date || result.date > pair.last_match_date) {
    pair.last_match_date = result.date;
    pair.last_match_tournament = result.tournament;
    pair.last_match_score = `${home} ${homeScore}-${awayScore} ${away}`;
    pair.last_match_result_for_team_a = aGoals > bGoals ? "W" : aGoals === bGoals ? "D" : "L";
  }
}

const qualifyingRows = [...qualifyingByTeam.values()]
  .map((row) => scoreQualifying(row))
  .sort((a, b) => a.team.localeCompare(b.team));

for (const row of qualifyingRows) {
  row.points_per_match = round(row.points_per_match);
}

const qualifyingHeaders = [
  "team",
  "snapshot_date",
  "source",
  "source_url",
  "qualification_status",
  "matches",
  "wins",
  "draws",
  "losses",
  "goals_for",
  "goals_against",
  "goal_diff",
  "points",
  "points_per_match",
  "away_matches",
  "away_points_per_match",
  "qualifying_score",
  "source_note",
];

const headToHeadHeaders = [
  "pair_key",
  "team_a",
  "team_b",
  "matches",
  "competitive_matches",
  "team_a_wins",
  "draws",
  "team_b_wins",
  "team_a_goals",
  "team_b_goals",
  "recent_matches_since_2010",
  "recent_team_a_wins",
  "recent_draws",
  "recent_team_b_wins",
  "last_match_date",
  "last_match_tournament",
  "last_match_score",
  "last_match_result_for_team_a",
  "source_url",
];

function toCsv(headers, rows) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n";
}

await writeFile(new URL("../data/qualifying_performance.csv", import.meta.url), toCsv(qualifyingHeaders, qualifyingRows));
await writeFile(new URL("../data/head_to_head_summary.csv", import.meta.url), toCsv(headToHeadHeaders, pairRows));
await writeFile(
  new URL("../data/head_to_head_summary.js", import.meta.url),
  `const HEAD_TO_HEAD_SUMMARY = ${JSON.stringify({
    snapshotDate,
    source: "martj42/international_results results.csv",
    sourceUrl,
    pairCount: pairRows.length,
    pairs: Object.fromEntries(pairRows.map((row) => [row.pair_key, row])),
  }, null, 2)};\n\nif (typeof globalThis !== "undefined") globalThis.HEAD_TO_HEAD_SUMMARY = HEAD_TO_HEAD_SUMMARY;\n`,
);

console.log(`Built ${qualifyingRows.length} qualifying rows and ${pairRows.length} head-to-head pairs from ${results.length} international results.`);
