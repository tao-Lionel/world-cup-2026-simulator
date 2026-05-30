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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function leadershipContinuity(team, factors) {
  let score = 50;
  if (team.host) score += 10;
  if (factors.wcPath >= 80) score += 8;
  if (factors.clubScore >= 80) score += 5;
  if (factors.avgAge >= 26 && factors.avgAge <= 28.5) score += 6;
  if (factors.avgAge > 29) score -= 5;
  if (factors.squadStatus.includes("暂定")) score -= 3;
  return clamp(Math.round(score), 30, 90);
}

function staffStability(team, factors) {
  let score = 52;
  if (team.host) score += 6;
  if (factors.form >= 72) score += 9;
  if (factors.form < 58) score -= 8;
  if (factors.wcPath >= 70) score += 6;
  if (factors.injuryRisk >= 23) score -= 5;
  return clamp(Math.round(score), 28, 88);
}

function momentumScore(factors) {
  return clamp(Math.round((factors.form * 0.72) + (factors.wcPath * 0.18) + ((100 - factors.injuryRisk) * 0.10)), 20, 95);
}

function pressureRisk(team, factors) {
  let risk = 45;
  if (team.host) risk += 8;
  if (factors.odds < 1500) risk += 10;
  if (factors.wcPath >= 85) risk += 5;
  if (factors.form < 60) risk += 6;
  if (factors.injuryRisk >= 23) risk += 7;
  return clamp(Math.round(risk), 20, 80);
}

function cohesionScore(team, factors) {
  const leadership = leadershipContinuity(team, factors);
  const staff = staffStability(team, factors);
  const momentum = momentumScore(factors);
  const pressure = pressureRisk(team, factors);
  const score = (leadership * 0.28) + (staff * 0.22) + (momentum * 0.32) + ((100 - pressure) * 0.18);
  return clamp(Math.round(score), 35, 90);
}

const baseTeams = vm.runInNewContext(`(${extractConst("baseTeams")})`, {});
const teamFactors = vm.runInNewContext(`(${extractConst("teamFactors")})`, {});
const headers = [
  "team",
  "snapshot_date",
  "atmosphere_score",
  "leadership_continuity",
  "staff_stability",
  "momentum_score",
  "pressure_risk",
  "source_tier",
  "source_note",
];

const rows = baseTeams.map((team) => {
  const factors = teamFactors[team.en];
  if (!factors) throw new Error(`Missing factors for ${team.en}`);
  return {
    team: team.en,
    snapshot_date: "2026-05-30",
    atmosphere_score: cohesionScore(team, factors),
    leadership_continuity: leadershipContinuity(team, factors),
    staff_stability: staffStability(team, factors),
    momentum_score: momentumScore(factors),
    pressure_risk: pressureRisk(team, factors),
    source_tier: "structured_manual",
    source_note: "Derived from current form, World Cup history, injury risk, host status, squad status and manual context priors. Replace with news/sentiment/coach-tenure sources when available.",
  };
});

await writeFile(
  new URL("../data/team_context_snapshot.csv", import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Built team context snapshot for ${rows.length} teams.`);
