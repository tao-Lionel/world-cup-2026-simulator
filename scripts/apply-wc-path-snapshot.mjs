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

const rows = parseCsv(await readFile(new URL("../data/wc_path_features.csv", import.meta.url), "utf8"));
let app = await readFile(new URL("../app.js", import.meta.url), "utf8");

for (const row of rows) {
  const escapedTeam = row.team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const teamPattern = new RegExp(`((?:\"${escapedTeam}\"|${escapedTeam}): \\{[^\\n]+?)wcPath: [0-9.]+`, "m");
  if (!teamPattern.test(app)) throw new Error(`Could not update wcPath for ${row.team}`);
  app = app.replace(teamPattern, `$1wcPath: ${row.wc_path_score}`);
}

app = app.replace(
  "{ key: \"wcPath\", label: \"历史路径难度\", tier: \"research\", source: \"deep-research-report.md\" }",
  "{ key: \"wcPath\", label: \"历史路径难度\", tier: \"research\", source: \"Football365 records + champion path summary\" }",
);

await writeFile(new URL("../app.js", import.meta.url), app);
console.log(`Applied World Cup path features for ${rows.length} teams.`);
