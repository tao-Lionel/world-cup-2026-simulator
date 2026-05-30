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

function labelStatus(row) {
  if (row.announcement_status === "association_26_announced") return "已公布26人名单";
  if (row.announcement_status === "squad_announced_unverified") return "已公布名单待核26人";
  if (row.announcement_status === "preliminary") return "暂定/初选名单";
  if (row.announcement_status === "training_camp") return "训练营名单";
  if (row.announcement_status === "pending") return "待公布";
  return row.announcement_status;
}

function replaceFactor(app, team, key, value) {
  const escapedTeam = team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const renderedValue = Number.isFinite(Number(value)) && value !== "" ? Number(value) : JSON.stringify(value);
  const existingPattern = new RegExp(`((?:\"${escapedTeam}\"|${escapedTeam}): \\{[^\\n]+?)${escapedKey}: (?:"[^"]*"|[0-9.]+|true|false)`, "m");
  if (existingPattern.test(app)) return app.replace(existingPattern, `$1${key}: ${renderedValue}`);
  const insertPattern = new RegExp(`((?:\"${escapedTeam}\"|${escapedTeam}): \\{[^\\n]+?)(squadStatus: )`, "m");
  if (!insertPattern.test(app)) throw new Error(`Could not insert ${key} for ${team}`);
  return app.replace(insertPattern, `$1${key}: ${renderedValue}, $2`);
}

const announcementRows = parseCsv(await readFile(new URL("../data/squad_announcement_status.csv", import.meta.url), "utf8"));
const announcementByTeam = new Map(announcementRows.map((row) => [row.team, row]));
const profileRows = parseCsv(await readFile(new URL("../data/squad_profile_snapshot.csv", import.meta.url), "utf8"));

const profileHeaders = [
  "team",
  "snapshot_date",
  "squad_status",
  "final_26_available",
  "announced_26_available",
  "announcement_status",
  "announcement_date",
  "squad_value_m",
  "avg_age",
  "injury_risk",
  "club_score",
  "profile_status",
  "source_note",
  "replacement_key",
];

const nextProfiles = profileRows.map((row) => {
  const announcement = announcementByTeam.get(row.team);
  if (!announcement) throw new Error(`Missing announcement status for ${row.team}`);
  const statusLabel = labelStatus(announcement);
  const announced26 = announcement.announced_26_available === "true";
  return {
    ...row,
    squad_status: announced26 ? statusLabel : row.squad_status,
    final_26_available: announcement.fifa_final_26_available,
    announced_26_available: announcement.announced_26_available,
    announcement_status: statusLabel,
    announcement_date: announcement.announced_date,
    profile_status: announced26 ? "announced_26_pending_player_rows" : row.profile_status,
    source_note: announced26
      ? `${announcement.source_title}; player-level rows not captured yet, aggregate values retained.`
      : row.source_note,
  };
});

await writeFile(
  new URL("../data/squad_profile_snapshot.csv", import.meta.url),
  [
    profileHeaders.join(","),
    ...nextProfiles.map((row) => profileHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

let app = await readFile(new URL("../app.js", import.meta.url), "utf8");
for (const row of announcementRows) {
  const statusLabel = labelStatus(row);
  app = replaceFactor(app, row.team, "squadAnnouncementStatus", statusLabel);
  app = replaceFactor(app, row.team, "squadAnnouncementDate", row.announced_date);
  if (row.announced_26_available === "true") app = replaceFactor(app, row.team, "squadStatus", statusLabel);
}

await writeFile(new URL("../app.js", import.meta.url), app);
console.log(`Applied squad announcement status for ${announcementRows.length} teams.`);
