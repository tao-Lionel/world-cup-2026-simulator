import { readFile, writeFile } from "node:fs/promises";

const squadPath = new URL("../data/squads_2026.csv", import.meta.url);
const overridesPath = new URL("../data/fifa_official_squad_overrides.csv", import.meta.url);

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

const rows = parseCsv(await readFile(squadPath, "utf8"));
const overrides = parseCsv(await readFile(overridesPath, "utf8"));
let applied = 0;

for (const override of overrides) {
  const slot = Number(override.slot);
  const sameTeamRows = rows.filter((row) => row.team === override.team);
  if (!sameTeamRows.length) throw new Error(`Unknown team in official override: ${override.team}`);
  if (sameTeamRows.some((row) => row.player === override.player)) continue;
  if (sameTeamRows.length >= 26) continue;

  for (const row of sameTeamRows) {
    if (Number(row.slot) >= slot) row.slot = String(Number(row.slot) + 1);
  }
  rows.push({
    team: override.team,
    slot: override.slot,
    player: override.player,
    position: override.position,
    age: override.age,
    club: override.club,
    league: override.league,
    market_value_m: override.market_value_m,
    caps: override.caps,
    goals: override.goals,
    injury_status: override.injury_status || "unknown",
    expected_role: override.expected_role,
    list_status: override.list_status,
    source_url: override.source_url,
    snapshot_date: override.snapshot_date,
    value_source: "official_fifa_pdf_pending_market_value",
  });
  applied += 1;
}

const byTeam = new Map();
for (const row of rows) {
  if (!byTeam.has(row.team)) byTeam.set(row.team, []);
  byTeam.get(row.team).push(row);
}

const output = [];
for (const teamRows of byTeam.values()) {
  teamRows.sort((a, b) => Number(a.slot) - Number(b.slot));
  teamRows.forEach((row, index) => {
    row.slot = String(index + 1);
  });
  output.push(...teamRows);
}

await writeFile(
  squadPath,
  [
    headers.join(","),
    ...output.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Applied ${applied} FIFA official squad overrides.`);
