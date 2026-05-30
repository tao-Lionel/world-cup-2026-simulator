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

const rows = parseCsv(await readFile(new URL("../data/elo_snapshot.csv", import.meta.url), "utf8"));
let app = await readFile(new URL("../app.js", import.meta.url), "utf8");

for (const row of rows) {
  const escapedTeam = row.team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const teamPattern = new RegExp(`((?:\"${escapedTeam}\"|${escapedTeam}): \\{[^\\n]+?)elo: [0-9.]+`, "m");
  if (!teamPattern.test(app)) throw new Error(`Could not update Elo for ${row.team}`);
  app = app.replace(teamPattern, `$1elo: ${row.elo}`);
}

app = app.replace(
  "{ label: \"Elo\", value: \"Elo/强度代理\" }",
  "{ label: \"Elo\", value: \"2026-03-31 快照\" }",
);
app = app.replace(
  "{ key: \"elo\", label: \"Elo 强度\", tier: \"snapshot\", source: \"World Football Elo 待替换快照\" }",
  "{ key: \"elo\", label: \"Elo 强度\", tier: \"snapshot\", source: \"International-football.net / eloratings.net 2026-03-31\" }",
);
app = app.replace("<div><span>Elo</span><strong>${f.elo}</strong><small>强度代理</small></div>", "<div><span>Elo</span><strong>${f.elo}</strong><small>2026-03-31</small></div>");

await writeFile(new URL("../app.js", import.meta.url), app);
console.log(`Applied Elo snapshot for ${rows.length} teams.`);
