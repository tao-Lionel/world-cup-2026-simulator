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

const rows = parseCsv(await readFile(new URL("../data/team_context_snapshot.csv", import.meta.url), "utf8"));
let app = await readFile(new URL("../app.js", import.meta.url), "utf8");

for (const row of rows) {
  const escapedTeam = row.team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const teamPattern = new RegExp(`((?:\"${escapedTeam}\"|${escapedTeam}): \\{[^\\n]+?)atmosphere: [0-9.]+`, "m");
  if (!teamPattern.test(app)) throw new Error(`Could not update atmosphere for ${row.team}`);
  app = app.replace(teamPattern, `$1atmosphere: ${row.atmosphere_score}`);
}

app = app.replace(
  "{ label: \"氛围\", value: \"人工量化\" }",
  "{ label: \"氛围\", value: \"结构化上下文快照\" }",
);
app = app.replace(
  "{ key: \"atmosphere\", label: \"球队氛围\", tier: \"manual\", source: \"人工量化\" }",
  "{ key: \"atmosphere\", label: \"球队氛围\", tier: \"manual\", source: \"structured context snapshot 2026-06-02\" }",
);
app = app.replace(
  "{ key: \"atmosphere\", label: \"球队氛围\", tier: \"manual\", source: \"structured context snapshot 2026-05-30\" }",
  "{ key: \"atmosphere\", label: \"球队氛围\", tier: \"manual\", source: \"structured context snapshot 2026-06-02\" }",
);

await writeFile(new URL("../app.js", import.meta.url), app);
console.log(`Applied team context snapshot for ${rows.length} teams.`);
