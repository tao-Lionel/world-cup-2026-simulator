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

const eloNames = {
  "Korea Republic": "South Korea",
  Czechia: "Czech Republic",
  USA: "United States",
  "Cote d'Ivoire": "Ivory Coast",
  "IR Iran": "Iran",
  "Cabo Verde": "Cape Verde",
  "Türkiye": "Turkey",
  "Congo DR": "Dem. Rep. of Congo",
};

async function fetchElo(eloTeam) {
  const url = `https://www.international-football.net/country?team=${encodeURIComponent(eloTeam)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${eloTeam}: HTTP ${response.status}`);
  const html = await response.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const match = text.match(/Elo Score\s+([0-9]{3,4})\b/i);
  if (!match) throw new Error(`${eloTeam}: Elo Score not found`);
  return { elo: Number(match[1]), url };
}

const rows = [];
for (const team of baseTeams) {
  const eloTeam = eloNames[team.en] || team.en;
  const current = teamFactors[team.en]?.elo;
  const { elo, url } = await fetchElo(eloTeam);
  rows.push({
    team: team.en,
    elo_team: eloTeam,
    snapshot_date: "2026-03-31",
    elo,
    previous_model_elo: current,
    delta: elo - current,
    source_url: url,
  });
  console.log(`${team.en}: ${current} -> ${elo}`);
}

const headers = ["team", "elo_team", "snapshot_date", "elo", "previous_model_elo", "delta", "source_url"];
await writeFile(
  new URL("../data/elo_snapshot.csv", import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Fetched Elo snapshot for ${rows.length} teams.`);
