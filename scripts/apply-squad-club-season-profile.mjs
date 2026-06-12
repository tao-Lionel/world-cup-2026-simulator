import { readFile, writeFile } from "node:fs/promises";

function parseCsvLine(line) {
  const cells = [];
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
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

const appPath = new URL("../app.js", import.meta.url);
const rows = parseCsv(await readFile(new URL("../data/squad_club_season_profile.csv", import.meta.url), "utf8"));
const snapshotDate = rows[0]?.snapshot_date;
let app = await readFile(appPath, "utf8");

for (const row of rows) {
  const score = Number(row.club_season_score);
  if (!Number.isFinite(score)) throw new Error(`Invalid club season score for ${row.team}`);
  const escapedTeam = row.team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entryPattern = new RegExp(`((?:^|\\n)\\s*(?:"${escapedTeam}"|${escapedTeam}): \\{[^\\n]*?clubScore: [^,]+, )(?:(?:clubSeasonScore: [^,]+, )?)`, "m");
  if (!entryPattern.test(app)) throw new Error(`Missing teamFactors entry for ${row.team}`);
  app = app.replace(entryPattern, `$1clubSeasonScore: ${score}, `);
}

const fieldLine = `{ key: "clubSeasonScore", label: "本季俱乐部表现", tier: "snapshot", source: "Transfermarkt player performance-game aggregation ${snapshotDate}" }`;
if (app.includes(`key: "clubSeasonScore"`)) {
  app = app.replace(
    /\{ key: "clubSeasonScore", label: "本季俱乐部表现", tier: "snapshot", source: "[^"]+" \}/,
    fieldLine,
  );
} else {
  app = app.replace(
    /(\s+\{ key: "clubScore", label: "俱乐部分布", tier: "proxy", source: "[^"]+" \},)/,
    `$1\n  ${fieldLine},`,
  );
}

await writeFile(appPath, app);
console.log(`Applied ${rows.length} club season scores to app.js.`);
