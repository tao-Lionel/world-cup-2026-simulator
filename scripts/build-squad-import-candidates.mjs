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

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

const collectionRows = parseCsv(await readFile(new URL("../data/squad_collection_status.csv", import.meta.url), "utf8"));
const announcementRows = parseCsv(await readFile(new URL("../data/squad_announcement_status.csv", import.meta.url), "utf8"));
const announcementByTeam = new Map(announcementRows.map((row) => [row.team, row]));

const candidateRows = collectionRows
  .filter((row) => Number(row.parsed_players) >= 23 && Number(row.parsed_players) <= 26 && row.imported_players === "0")
  .map((row) => {
    const announcement = announcementByTeam.get(row.team) || {};
    const parsedPlayers = Number(row.parsed_players);
    const candidateStatus = parsedPlayers === 26 ? "needs_source_review" : "non_26_range_review";
    return {
      team: row.team,
      wiki_section: row.wiki_section,
      parsed_players: row.parsed_players,
      announcement_status: announcement.announcement_status || "",
      announced_26_available: announcement.announced_26_available || "false",
      fifa_final_26_available: announcement.fifa_final_26_available || "false",
      candidate_status: candidateStatus,
      recommended_action: parsedPlayers === 26
        ? "Verify source_url is a confirmed 26-player squad, then set announced_26_available=true in squad_announcement_status.csv."
        : "Do not import until list is confirmed as a 23-26 player tournament squad.",
      source_url: row.source_url,
    };
  });

const headers = [
  "team",
  "wiki_section",
  "parsed_players",
  "announcement_status",
  "announced_26_available",
  "fifa_final_26_available",
  "candidate_status",
  "recommended_action",
  "source_url",
];

await writeFile(
  new URL("../data/squad_import_candidates.csv", import.meta.url),
  [
    headers.join(","),
    ...candidateRows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Wrote ${candidateRows.length} squad import candidates.`);
