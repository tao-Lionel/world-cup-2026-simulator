import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const SNAPSHOT_DATE = new Date().toISOString().slice(0, 10);

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

const baseTeams = vm.runInNewContext(`(${extractConst("baseTeams")})`, {});
const teamFactors = vm.runInNewContext(`(${extractConst("teamFactors")})`, {});

const headers = [
  "team",
  "snapshot_date",
  "squad_status",
  "final_26_available",
  "squad_value_m",
  "avg_age",
  "injury_risk",
  "club_score",
  "profile_status",
  "source_note",
  "replacement_key",
];

const rows = baseTeams.map((team) => {
  const factors = teamFactors[team.en];
  if (!factors) throw new Error(`Missing factors for ${team.en}`);
  return {
    team: team.en,
    snapshot_date: SNAPSHOT_DATE,
    squad_status: factors.squadStatus,
    final_26_available: "false",
    squad_value_m: factors.squadValue,
    avg_age: factors.avgAge,
    injury_risk: factors.injuryRisk,
    club_score: factors.clubScore,
    profile_status: "provisional_aggregate",
    source_note: "Current aggregate placeholder. Replace with player-level squads_2026.csv after official/provisional squad rows are collected.",
    replacement_key: "squads_2026.csv -> aggregate by team",
  };
});

await writeFile(
  new URL("../data/squad_profile_snapshot.csv", import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Exported provisional squad profiles for ${rows.length} teams.`);
