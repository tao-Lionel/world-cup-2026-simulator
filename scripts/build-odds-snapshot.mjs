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

function fractionalToDecimal(value) {
  const [numerator, denominator] = value.split("/").map(Number);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    throw new Error(`Invalid fractional odds: ${value}`);
  }
  return (numerator / denominator) + 1;
}

function decimalToAmerican(decimal) {
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

const rows = parseCsv(await readFile(new URL("../data/odds_market_raw.csv", import.meta.url), "utf8"));
const headers = [
  "team",
  "snapshot_date",
  "source",
  "source_url",
  "consensus_american_odds",
  "consensus_implied_pct",
  "book_count",
  "best_fractional",
  "shortest_fractional",
  "bet365_fractional",
  "betway_fractional",
  "bwin_fractional",
  "betsson_fractional",
  "source_note",
];

const output = rows.map((row) => {
  const bookOdds = [
    row.bet365_fractional,
    row.betway_fractional,
    row.bwin_fractional,
    row.betsson_fractional,
  ].filter(Boolean);
  const decimals = bookOdds.map(fractionalToDecimal);
  const implied = decimals.map((decimal) => 1 / decimal);
  const averageImplied = implied.reduce((sum, value) => sum + value, 0) / implied.length;
  const consensusDecimal = 1 / averageImplied;
  const sortedOdds = [...bookOdds].sort((a, b) => fractionalToDecimal(a) - fractionalToDecimal(b));
  return {
    team: row.team,
    snapshot_date: row.snapshot_date,
    source: "TheGameDay four-book outright table",
    source_url: row.source_url,
    consensus_american_odds: decimalToAmerican(consensusDecimal),
    consensus_implied_pct: (averageImplied * 100).toFixed(2),
    book_count: bookOdds.length,
    best_fractional: sortedOdds[sortedOdds.length - 1],
    shortest_fractional: sortedOdds[0],
    bet365_fractional: row.bet365_fractional,
    betway_fractional: row.betway_fractional,
    bwin_fractional: row.bwin_fractional,
    betsson_fractional: row.betsson_fractional,
    source_note: "Consensus uses average implied probability across bet365, Betway, Bwin and Betsson prices listed by TheGameDay.",
  };
});

await writeFile(
  new URL("../data/odds_snapshot.csv", import.meta.url),
  [
    headers.join(","),
    ...output.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Built odds snapshot for ${output.length} teams.`);
