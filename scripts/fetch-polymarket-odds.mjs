import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const SOURCE_URL = "https://gamma-api.polymarket.com/events?slug=world-cup-winner";

const aliases = {
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Cape Verde": "Cabo Verde",
  "Curaçao": "Curacao",
  Iran: "IR Iran",
  "Ivory Coast": "Cote d'Ivoire",
  "South Korea": "Korea Republic",
  Turkiye: "Türkiye",
};

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
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const baseTeams = vm.runInNewContext(`(${extractConst(appSource, "baseTeams")})`, {});
const validTeams = new Set(baseTeams.map((team) => team.en));

const response = await fetch(SOURCE_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
if (!response.ok) throw new Error(`Polymarket: HTTP ${response.status}`);
const events = await response.json();
if (!Array.isArray(events) || !events.length) throw new Error("Polymarket: world-cup-winner event not found");
const event = events[0];
if (event.closed) throw new Error("Polymarket: world-cup-winner event is closed");

const snapshotDate = new Date().toISOString().slice(0, 10);
const rows = [];
for (const market of event.markets ?? []) {
  const sourceTeam = market.groupItemTitle;
  if (!sourceTeam) continue;
  const team = aliases[sourceTeam] || sourceTeam;
  if (!validTeams.has(team)) continue;
  const bid = Number(market.bestBid);
  const ask = Number(market.bestAsk);
  let probability;
  if (Number.isFinite(bid) && Number.isFinite(ask) && bid > 0 && ask > 0) {
    probability = (bid + ask) / 2;
  } else {
    const prices = JSON.parse(market.outcomePrices ?? "null");
    probability = Number(prices?.[0]);
  }
  if (!Number.isFinite(probability) || probability <= 0 || probability >= 1) {
    throw new Error(`Polymarket: bad price for ${sourceTeam}: ${probability}`);
  }
  rows.push({
    team,
    source_team: sourceTeam,
    snapshot_date: snapshotDate,
    source: "Polymarket World Cup Winner market",
    source_url: "https://polymarket.com/event/world-cup-winner",
    implied_probability: probability.toFixed(4),
    best_bid: Number.isFinite(bid) ? bid : "",
    best_ask: Number.isFinite(ask) ? ask : "",
    volume_usd: Math.round(Number(market.volumeNum) || 0),
  });
}

const rowTeams = new Set(rows.map((row) => row.team));
const missingTeams = [...validTeams].filter((team) => !rowTeams.has(team));
if (rows.length !== 48 || rowTeams.size !== 48 || missingTeams.length) {
  throw new Error(`Expected 48 unique teams, got ${rows.length}; missing: ${missingTeams.join(", ")}`);
}

rows.sort((a, b) => Number(b.implied_probability) - Number(a.implied_probability) || a.team.localeCompare(b.team));
const headers = [
  "team",
  "source_team",
  "snapshot_date",
  "source",
  "source_url",
  "implied_probability",
  "best_bid",
  "best_ask",
  "volume_usd",
];
await writeFile(
  new URL("../data/polymarket_odds_raw.csv", import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

const totalImplied = rows.reduce((sum, row) => sum + Number(row.implied_probability), 0);
console.log(`Fetched ${rows.length} Polymarket win probabilities (${snapshotDate}); total implied ${(totalImplied * 100).toFixed(1)}%.`);
