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

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function americanToImplied(value) {
  const odds = Number(value);
  return odds >= 0 ? 100 / (odds + 100) : -odds / (-odds + 100);
}

function probabilityToAmerican(probability) {
  const decimal = 1 / probability;
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

// Power-method de-vig: find k >= 1 so that sum(p_i^k) = 1, then use p_i^k as
// fair probabilities. Unlike proportional scaling, this removes more margin
// from longshots than from favourites, matching observed bookmaker bias.
function powerDevig(impliedProbabilities) {
  const total = impliedProbabilities.reduce((sum, value) => sum + value, 0);
  if (total <= 1) return impliedProbabilities.map((value) => value / total);
  let low = 1;
  let high = 5;
  const sumAt = (k) => impliedProbabilities.reduce((sum, value) => sum + value ** k, 0);
  while (sumAt(high) > 1) high *= 2;
  for (let iteration = 0; iteration < 80; iteration += 1) {
    const mid = (low + high) / 2;
    if (sumAt(mid) > 1) low = mid;
    else high = mid;
  }
  const k = (low + high) / 2;
  const fair = impliedProbabilities.map((value) => value ** k);
  const fairTotal = fair.reduce((sum, value) => sum + value, 0);
  return fair.map((value) => value / fairTotal);
}

const bookRows = parseCsv(await readFile(new URL("../data/odds_market_raw.csv", import.meta.url), "utf8"));
const exchangeRows = parseCsv(await readFile(new URL("../data/polymarket_odds_raw.csv", import.meta.url), "utf8"));

const bookByTeam = new Map(bookRows.map((row) => [row.team, row]));
const exchangeByTeam = new Map(exchangeRows.map((row) => [row.team, row]));
const teams = [...bookByTeam.keys()];
if (teams.length !== 48) throw new Error(`Expected 48 bookmaker rows, got ${teams.length}`);
for (const team of teams) {
  if (!exchangeByTeam.has(team)) throw new Error(`Missing Polymarket row for ${team}`);
}

const bookImplied = teams.map((team) => americanToImplied(bookByTeam.get(team).american_odds));
const bookOverround = bookImplied.reduce((sum, value) => sum + value, 0);
const bookFair = powerDevig(bookImplied);

const exchangeImplied = teams.map((team) => Number(exchangeByTeam.get(team).implied_probability));
const exchangeOverround = exchangeImplied.reduce((sum, value) => sum + value, 0);
const exchangeFair = exchangeImplied.map((value) => value / exchangeOverround);

const headers = [
  "team",
  "snapshot_date",
  "source",
  "source_url",
  "consensus_american_odds",
  "consensus_implied_pct",
  "book_count",
  "betmgm_american_odds",
  "betmgm_raw_implied_pct",
  "betmgm_fair_pct",
  "polymarket_raw_implied_pct",
  "polymarket_fair_pct",
  "source_note",
];

const output = teams.map((team, index) => {
  const bookRow = bookByTeam.get(team);
  const exchangeRow = exchangeByTeam.get(team);
  const consensus = (bookFair[index] + exchangeFair[index]) / 2;
  return {
    team,
    snapshot_date: exchangeRow.snapshot_date,
    source: "BetMGM (power de-vig) + Polymarket consensus",
    source_url: `${bookRow.source_url} | ${exchangeRow.source_url}`,
    consensus_american_odds: probabilityToAmerican(consensus),
    consensus_implied_pct: (consensus * 100).toFixed(2),
    book_count: 2,
    betmgm_american_odds: bookRow.american_odds,
    betmgm_raw_implied_pct: (bookImplied[index] * 100).toFixed(2),
    betmgm_fair_pct: (bookFair[index] * 100).toFixed(2),
    polymarket_raw_implied_pct: (exchangeImplied[index] * 100).toFixed(2),
    polymarket_fair_pct: (exchangeFair[index] * 100).toFixed(2),
    source_note: `Equal-weight mean of de-vigged BetMGM (overround ${(bookOverround * 100).toFixed(1)}%) and normalised Polymarket (${(exchangeOverround * 100).toFixed(1)}%).`,
  };
});

output.sort((a, b) => Number(b.consensus_implied_pct) - Number(a.consensus_implied_pct) || a.team.localeCompare(b.team));
await writeFile(
  new URL("../data/odds_snapshot.csv", import.meta.url),
  [
    headers.join(","),
    ...output.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

const consensusTotal = output.reduce((sum, row) => sum + Number(row.consensus_implied_pct), 0);
console.log(`Built consensus odds snapshot for ${output.length} teams.`);
console.log(`BetMGM overround ${(bookOverround * 100).toFixed(1)}% -> de-vigged; Polymarket ${(exchangeOverround * 100).toFixed(1)}% -> normalised; consensus total ${consensusTotal.toFixed(1)}%.`);
