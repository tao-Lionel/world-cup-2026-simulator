import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const SOURCE_URL = "https://sports.yahoo.com/soccer/betting/article/2026-world-cup-odds-for-all-48-teams-to-win-the-title-200221552.html";

function extractConst(source, name) {
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
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function stripHtml(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .trim();
}

function toAmericanOdds(value) {
  if (value.startsWith("+")) return Number(value.slice(1));
  const match = value.match(/^([\d,]+)-1$/);
  if (!match) throw new Error(`Unsupported odds: ${value}`);
  return Number(match[1].replaceAll(",", "")) * 100;
}

const aliases = {
  "Bosnia & Herzegovina": "Bosnia and Herzegovina",
  "Cape Verde": "Cabo Verde",
  Columbia: "Colombia",
  "Czech Republic": "Czechia",
  "DR Congo": "Congo DR",
  Iran: "IR Iran",
  "Ivory Coast": "Cote d'Ivoire",
  Turkey: "Türkiye",
};

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const baseTeams = vm.runInNewContext(`(${extractConst(appSource, "baseTeams")})`, {});
const validTeams = new Set(baseTeams.map((team) => team.en));

const response = await fetch(SOURCE_URL);
if (!response.ok) throw new Error(`Yahoo Sports: HTTP ${response.status}`);
const html = await response.text();
const publishedMatch = html.match(/"datePublished":"(\d{4}-\d{2}-\d{2})T/);
if (!publishedMatch) throw new Error("Yahoo Sports publication date not found");

const sectionStart = html.indexOf('id="odds-for-every-team-to-win-the-2026-world-cup"');
const sectionEnd = html.indexOf("<h2", sectionStart + 10);
if (sectionStart === -1 || sectionEnd === -1) throw new Error("Yahoo Sports odds section not found");

const rows = [];
for (const match of html.slice(sectionStart, sectionEnd).matchAll(/<p>([\s\S]*?)<\/p>/g)) {
  const text = stripHtml(match[1]);
  const oddsMatch = text.match(/^(.+):\s*(\+\d+|[\d,]+-1)$/);
  if (!oddsMatch) continue;
  for (const sourceTeam of oddsMatch[1].split(",").map((team) => team.trim())) {
    const team = aliases[sourceTeam] || sourceTeam;
    if (!validTeams.has(team)) throw new Error(`Unknown team in odds source: ${sourceTeam}`);
    rows.push({
      team,
      source_team: sourceTeam,
      snapshot_date: publishedMatch[1],
      source: "Yahoo Sports / BetMGM outright odds",
      source_url: SOURCE_URL,
      american_odds: toAmericanOdds(oddsMatch[2]),
    });
  }
}

const rowTeams = new Set(rows.map((row) => row.team));
const missingTeams = [...validTeams].filter((team) => !rowTeams.has(team));
if (rows.length !== 48 || rowTeams.size !== 48 || missingTeams.length) {
  throw new Error(`Expected 48 unique teams, got ${rows.length}; missing: ${missingTeams.join(", ")}`);
}

rows.sort((a, b) => a.american_odds - b.american_odds || a.team.localeCompare(b.team));
const headers = ["team", "source_team", "snapshot_date", "source", "source_url", "american_odds"];
await writeFile(
  new URL("../data/odds_market_raw.csv", import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Fetched ${rows.length} BetMGM outright odds from Yahoo Sports (${publishedMatch[1]}).`);
