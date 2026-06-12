import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

function extractConst(name) {
  const start = source.indexOf(`const ${name} = `);
  if (start === -1) throw new Error(`Missing const ${name}`);
  const valueStart = start + `const ${name} = `.length;
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escape = false;
  for (let index = valueStart; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === stringQuote) inString = false;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }
    if (char === "{" || char === "[") depth += 1;
    if (char === "}" || char === "]") depth -= 1;
    if (depth === 0 && char === ";") return source.slice(valueStart, index);
  }
  throw new Error(`Could not parse const ${name}`);
}

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

const baseTeams = vm.runInNewContext(`(${extractConst("baseTeams")})`, {});
const teamFactors = vm.runInNewContext(`(${extractConst("teamFactors")})`, {});

let snapshotDate = "2026-04-01";
let snapshotUrl = "https://inside.fifa.com/fifa-world-ranking/men?dateId=id13678";
try {
  const existing = await readFile(new URL("../data/fifa_ranking_snapshot.csv", import.meta.url), "utf8");
  const firstRow = existing.trim().split(/\r?\n/)[1];
  const dateMatch = firstRow?.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) snapshotDate = dateMatch[0];
  const headers = existing.trim().split(/\r?\n/)[0].split(",");
  const urlIndex = headers.indexOf("source_url");
  if (urlIndex !== -1 && firstRow) {
    const cells = firstRow.split(",");
    if (cells[urlIndex]) snapshotUrl = cells[urlIndex];
  }
} catch {
  // keep defaults when no snapshot exists yet
}
const headers = [
  "team",
  "snapshot_date",
  "source",
  "source_url",
  "fifa_rank",
  "fifa_points",
  "points_precision",
  "source_note",
];

const rows = baseTeams.map((team) => {
  const factors = teamFactors[team.en];
  if (!factors) throw new Error(`Missing factors for ${team.en}`);
  return {
    team: team.en,
    snapshot_date: snapshotDate,
    source: "FIFA/Coca-Cola Men's World Ranking",
    source_url: snapshotUrl,
    fifa_rank: factors.fifaRank,
    fifa_points: factors.fifaPoints,
    points_precision: "rounded integer",
    source_note: `Official FIFA ranking last official update ${snapshotDate}; model stores rounded points.`,
  };
});

await writeFile(
  new URL("../data/fifa_ranking_snapshot.csv", import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Exported FIFA ranking snapshot for ${rows.length} teams.`);
