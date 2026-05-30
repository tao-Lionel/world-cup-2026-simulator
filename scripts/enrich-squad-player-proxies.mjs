import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

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
    if (depth === 0 && char === ";") return appSource.slice(valueStart, index);
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

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function leagueFactor(league) {
  const normalized = league.trim().toLowerCase();
  const scores = new Map([
    ["premier league", 1.55],
    ["la liga", 1.5],
    ["serie a", 1.42],
    ["bundesliga", 1.42],
    ["ligue 1", 1.28],
    ["eredivisie", 1.18],
    ["primeira liga", 1.16],
    ["brasileirao", 1.12],
    ["argentine primera division", 1.08],
    ["mls", 0.98],
    ["liga mx", 0.92],
    ["saudi pro league", 0.88],
    ["j1 league", 0.86],
    ["k league 1", 0.82],
    ["a-league", 0.72],
    ["eng", 1.32],
    ["esp", 1.28],
    ["ita", 1.24],
    ["ger", 1.24],
    ["fra", 1.14],
    ["ned", 1.08],
    ["por", 1.06],
    ["bra", 1.02],
    ["arg", 0.98],
    ["usa", 0.9],
    ["mex", 0.88],
    ["jpn", 0.84],
    ["kor", 0.8],
    ["ksa", 0.78],
    ["qat", 0.68],
  ]);
  return scores.get(normalized) ?? (normalized ? 0.78 : 0.72);
}

function ageFactor(age, position) {
  if (!age) return 1;
  if (position === "GK") {
    if (age >= 28 && age <= 34) return 1.12;
    if (age < 24) return 0.82;
    if (age > 37) return 0.76;
    return 1;
  }
  if (age >= 22 && age <= 27) return 1.22;
  if (age >= 28 && age <= 31) return 1.05;
  if (age < 21) return 0.88;
  if (age > 34) return 0.72;
  return 0.92;
}

function positionFactor(position) {
  if (position === "FW") return 1.2;
  if (position === "MF") return 1.08;
  if (position === "DF") return 0.96;
  if (position === "GK") return 0.82;
  return 1;
}

function roleFromRank(index, total) {
  if (index < Math.max(8, Math.round(total * 0.38))) return "starter";
  if (index < Math.max(17, Math.round(total * 0.7))) return "rotation";
  return "squad";
}

function playerScore(row) {
  const age = numberValue(row.age);
  const caps = numberValue(row.caps);
  const goals = numberValue(row.goals);
  const position = row.position.trim();
  const roleFactor = row.expected_role === "starter" ? 1.25 : row.expected_role === "rotation" ? 1 : row.expected_role === "reserve" ? 0.58 : 0.78;
  const capFactor = 1 + Math.min(caps, 80) / 130;
  const goalFactor = 1 + Math.min(goals, 30) / (position === "FW" ? 55 : 90);
  return leagueFactor(row.league) * ageFactor(age, position) * positionFactor(position) * roleFactor * capFactor * goalFactor;
}

const teamFactors = vm.runInNewContext(`(${extractConst("teamFactors")})`, {});
const headers = [
  "team",
  "slot",
  "player",
  "position",
  "age",
  "club",
  "league",
  "market_value_m",
  "caps",
  "goals",
  "injury_status",
  "expected_role",
  "list_status",
  "source_url",
  "snapshot_date",
  "value_source",
];

const rows = parseCsv(await readFile(new URL("../data/squads_2026.csv", import.meta.url), "utf8"));
const byTeam = new Map();
for (const row of rows) {
  if (!byTeam.has(row.team)) byTeam.set(row.team, []);
  byTeam.get(row.team).push(row);
}

const output = [];
const statusRows = [["team", "players", "team_value_m", "allocated_value_m", "value_source"]];
for (const [team, players] of byTeam.entries()) {
  const target = numberValue(teamFactors[team]?.squadValue);
  const scored = players.map((row) => ({ row, score: playerScore(row) }))
    .sort((a, b) => b.score - a.score);
  scored.forEach((item, index) => {
    item.row.expected_role = roleFromRank(index, scored.length);
  });
  const scoreTotal = scored.reduce((sum, item) => sum + item.score, 0);
  let allocated = 0;
  scored.forEach((item, index) => {
    const value = index === scored.length - 1
      ? Math.round(Math.max(0, target - allocated) * 10) / 10
      : Math.round((target * item.score / scoreTotal) * 10) / 10;
    allocated += value;
    item.row.market_value_m = value;
    item.row.value_source = "team_value_allocated_proxy";
  });
  statusRows.push([team, players.length, target, Math.round(allocated * 10) / 10, "team_value_allocated_proxy"]);
  output.push(...players.sort((a, b) => Number(a.slot) - Number(b.slot)));
}

await writeFile(
  new URL("../data/squads_2026.csv", import.meta.url),
  [
    headers.join(","),
    ...output.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

await writeFile(
  new URL("../data/squad_value_allocation.csv", import.meta.url),
  statusRows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n",
);

console.log(`Allocated player value proxies for ${output.length} players across ${byTeam.size} teams.`);
