import { readFile, writeFile } from "node:fs/promises";

const squadPath = process.argv[2] || "../data/squads_2026.csv";
const watchlistPath = process.argv[3] || "../data/player_availability_watchlist.csv";
const auditPath = process.argv[4] || "../data/player_availability_audit.csv";

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

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const squads = parseCsv(await readFile(new URL(squadPath, import.meta.url), "utf8"));
const watchlist = parseCsv(await readFile(new URL(watchlistPath, import.meta.url), "utf8"));
const squadHeaders = Object.keys(squads[0] || {});
const playerIndex = new Map(
  squads.map((row, index) => [`${normalizeKey(row.team)}|${normalizeKey(row.player)}`, index]),
);

const auditHeaders = [
  "team",
  "player",
  "status",
  "severity",
  "matched",
  "previous_status",
  "applied_status",
  "source_url",
  "checked_date",
  "notes",
];

const auditRows = [];

for (const item of watchlist) {
  if (!item.team || !item.player) continue;
  const key = `${normalizeKey(item.team)}|${normalizeKey(item.player)}`;
  const matchIndex = playerIndex.get(key);
  const previousStatus = matchIndex === undefined ? "" : squads[matchIndex].injury_status;
  if (matchIndex !== undefined && item.status) {
    squads[matchIndex].injury_status = item.status;
  }
  auditRows.push({
    team: item.team,
    player: item.player,
    status: item.status,
    severity: item.severity,
    matched: matchIndex === undefined ? "false" : "true",
    previous_status: previousStatus,
    applied_status: matchIndex === undefined ? "" : squads[matchIndex].injury_status,
    source_url: item.source_url,
    checked_date: item.checked_date,
    notes: item.notes,
  });
}

await writeFile(
  new URL(squadPath, import.meta.url),
  [
    squadHeaders.join(","),
    ...squads.map((row) => squadHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

await writeFile(
  new URL(auditPath, import.meta.url),
  [
    auditHeaders.join(","),
    ...auditRows.map((row) => auditHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

const matched = auditRows.filter((row) => row.matched === "true").length;
console.log(`Applied ${matched}/${auditRows.length} player availability rows.`);
