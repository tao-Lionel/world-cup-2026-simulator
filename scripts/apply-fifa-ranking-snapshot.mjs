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

const rows = parseCsv(await readFile(new URL("../data/fifa_ranking_snapshot.csv", import.meta.url), "utf8"));
let app = await readFile(new URL("../app.js", import.meta.url), "utf8");

for (const row of rows) {
  const escapedTeam = row.team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const teamPattern = new RegExp(`((?:\"${escapedTeam}\"|${escapedTeam}): \\{[^\\n]+?)fifaRank: [0-9.]+, fifaPoints: [0-9.]+`, "m");
  if (!teamPattern.test(app)) throw new Error(`Could not update FIFA ranking for ${row.team}`);
  app = app.replace(teamPattern, `$1fifaRank: ${row.fifa_rank}, fifaPoints: ${row.fifa_points}`);
}

const snapshotDates = [...new Set(rows.map((row) => row.snapshot_date))];
if (snapshotDates.length !== 1) throw new Error(`Inconsistent snapshot dates: ${snapshotDates.join(", ")}`);
const snapshotDate = snapshotDates[0];

app = app.replace(
  /\{ label: "FIFA 排名", value: "[^"]+" \}/,
  `{ label: "FIFA 排名", value: "${snapshotDate} 官方快照" }`,
);
app = app.replace(
  /\{ key: "fifaRank", label: "FIFA 排名", tier: "verified", source: "[^"]+" \}/,
  `{ key: "fifaRank", label: "FIFA 排名", tier: "verified", source: "FIFA/Coca-Cola ranking ${snapshotDate}" }`,
);
app = app.replace(
  /\{ key: "fifaPoints", label: "FIFA 积分", tier: "verified", source: "[^"]+" \}/,
  `{ key: "fifaPoints", label: "FIFA 积分", tier: "verified", source: "FIFA/Coca-Cola ranking ${snapshotDate}" }`,
);

await writeFile(new URL("../app.js", import.meta.url), app);
console.log(`Applied FIFA ranking snapshot for ${rows.length} teams.`);
