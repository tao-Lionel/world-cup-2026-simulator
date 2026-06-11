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

const rows = parseCsv(await readFile(new URL("../data/form_snapshot.csv", import.meta.url), "utf8"));
const snapshotDate = rows[0]?.snapshot_date;
let app = await readFile(new URL("../app.js", import.meta.url), "utf8");

for (const row of rows) {
  const escapedTeam = row.team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const teamPattern = new RegExp(`((?:\"${escapedTeam}\"|${escapedTeam}): \\{[^\\n]+?)form: [0-9.]+`, "m");
  if (!teamPattern.test(app)) throw new Error(`Could not update form for ${row.team}`);
  app = app.replace(teamPattern, `$1form: ${row.form}`);
}

app = app.replace(
  /\{ key: "form", label: "近两年战绩", tier: "(?:proxy|snapshot)", source: "[^"]+" \}/,
  `{ key: "form", label: "近两年战绩", tier: "snapshot", source: "International-football.net last games through ${snapshotDate}" }`,
);

await writeFile(new URL("../app.js", import.meta.url), app);
console.log(`Applied form snapshot for ${rows.length} teams.`);
