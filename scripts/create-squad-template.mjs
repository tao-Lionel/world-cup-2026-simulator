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
const headers = [
  "team",
  "slot",
  "player",
  "position",
  "age",
  "club",
  "league",
  "market_value_m",
  "caps",
  "goals",
  "injury_status",
  "expected_role",
  "list_status",
  "source_url",
  "snapshot_date",
];

const rows = [];
for (const team of baseTeams) {
  for (let slot = 1; slot <= 26; slot += 1) {
    rows.push({
      team: team.en,
      slot,
      player: "",
      position: "",
      age: "",
      club: "",
      league: "",
      market_value_m: "",
      caps: "",
      goals: "",
      injury_status: "unknown",
      expected_role: "squad",
      list_status: "provisional",
      source_url: "",
      snapshot_date: "2026-06-02",
    });
  }
}

await writeFile(
  new URL("../data/squads_2026_template.csv", import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Created squad template with ${rows.length} player slots.`);
