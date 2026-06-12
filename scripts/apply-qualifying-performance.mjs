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

const appPath = new URL("../app.js", import.meta.url);
const rows = parseCsv(await readFile(new URL("../data/qualifying_performance.csv", import.meta.url), "utf8"));
let app = await readFile(appPath, "utf8");

for (const row of rows) {
  const score = Number(row.qualifying_score);
  if (!Number.isFinite(score)) throw new Error(`Invalid qualifying score for ${row.team}`);
  const escapedTeam = row.team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entryPattern = new RegExp(`((?:^|\\n)\\s*(?:"${escapedTeam}"|${escapedTeam}): \\{[^\\n]*?form: [^,]+, )(?:(?:qualifyingScore: [^,]+, )?)`, "m");
  if (!entryPattern.test(app)) throw new Error(`Missing teamFactors entry for ${row.team}`);
  app = app.replace(entryPattern, `$1qualifyingScore: ${score}, `);
}

await writeFile(appPath, app);
console.log(`Applied ${rows.length} qualifying performance scores to app.js.`);
