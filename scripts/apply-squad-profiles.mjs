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

function replaceFactor(app, team, key, value) {
  const escapedTeam = team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const teamPattern = new RegExp(`((?:\"${escapedTeam}\"|${escapedTeam}): \\{[^\\n]+?)${escapedKey}: (?:"[^"]*"|[0-9.]+)`, "m");
  if (!teamPattern.test(app)) throw new Error(`Could not update ${key} for ${team}`);
  const renderedValue = Number.isFinite(Number(value)) && value !== "" ? Number(value) : JSON.stringify(value);
  return app.replace(teamPattern, `$1${key}: ${renderedValue}`);
}

const rows = parseCsv(await readFile(new URL("../data/squad_profile_snapshot.csv", import.meta.url), "utf8"));
const snapshotDate = rows[0]?.snapshot_date;
let app = await readFile(new URL("../app.js", import.meta.url), "utf8");

for (const row of rows) {
  app = replaceFactor(app, row.team, "squadValue", row.squad_value_m);
  app = replaceFactor(app, row.team, "avgAge", row.avg_age);
  app = replaceFactor(app, row.team, "injuryRisk", row.injury_risk);
  app = replaceFactor(app, row.team, "clubScore", row.club_score);
  app = replaceFactor(app, row.team, "squadStatus", row.squad_status);
}

app = app.replace(
  /\{ label: "阵容", value: "[^"]+" \}/,
  `{ label: "阵容", value: "FIFA 最终名单 ${snapshotDate}" }`,
);
app = app.replace(
  /\{ key: "squadValue", label: "阵容身价", tier: "snapshot", source: "[^"]+" \}/,
  `{ key: "squadValue", label: "阵容身价", tier: "snapshot", source: "Transfermarkt team/player market values ${snapshotDate}" }`,
);
app = app.replace(
  /\{ key: "avgAge", label: "平均年龄", tier: "snapshot", source: "[^"]+" \}/,
  `{ key: "avgAge", label: "平均年龄", tier: "snapshot", source: "FIFA final squad player ages ${snapshotDate}" }`,
);
app = app.replace(
  /\{ key: "injuryRisk", label: "伤病风险", tier: "snapshot", source: "[^"]+" \}/,
  `{ key: "injuryRisk", label: "伤病风险", tier: "snapshot", source: "player availability watchlist ${snapshotDate} + health proxy" }`,
);
app = app.replace(
  /\{ key: "squadStatus", label: "名单状态", tier: "snapshot", source: "[^"]+" \}/,
  `{ key: "squadStatus", label: "名单状态", tier: "snapshot", source: "FIFA final squad lists + Wikipedia squad tracker ${snapshotDate}" }`,
);

await writeFile(new URL("../app.js", import.meta.url), app);
console.log(`Applied squad profiles for ${rows.length} teams.`);
