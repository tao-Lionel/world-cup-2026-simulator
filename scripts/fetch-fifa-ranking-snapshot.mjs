import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const SOURCE_URL = "https://inside.fifa.com/api/rankings/by-country";
const PAGE_URL = "https://inside.fifa.com/fifa-world-ranking/men";

const fifaCountryCodes = {
  Mexico: "MEX",
  "South Africa": "RSA",
  "Korea Republic": "KOR",
  Czechia: "CZE",
  Canada: "CAN",
  "Bosnia and Herzegovina": "BIH",
  Qatar: "QAT",
  Switzerland: "SUI",
  Brazil: "BRA",
  Morocco: "MAR",
  Haiti: "HAI",
  Scotland: "SCO",
  USA: "USA",
  Paraguay: "PAR",
  Australia: "AUS",
  "Türkiye": "TUR",
  Germany: "GER",
  Curacao: "CUW",
  "Cote d'Ivoire": "CIV",
  Ecuador: "ECU",
  Netherlands: "NED",
  Japan: "JPN",
  Sweden: "SWE",
  Tunisia: "TUN",
  Belgium: "BEL",
  Egypt: "EGY",
  "IR Iran": "IRN",
  "New Zealand": "NZL",
  Spain: "ESP",
  "Cabo Verde": "CPV",
  "Saudi Arabia": "KSA",
  Uruguay: "URU",
  France: "FRA",
  Senegal: "SEN",
  Iraq: "IRQ",
  Norway: "NOR",
  Argentina: "ARG",
  Algeria: "ALG",
  Austria: "AUT",
  Jordan: "JOR",
  Portugal: "POR",
  "Congo DR": "COD",
  Uzbekistan: "UZB",
  Colombia: "COL",
  England: "ENG",
  Croatia: "CRO",
  Ghana: "GHA",
  Panama: "PAN",
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

async function fetchLatestRanking(countryCode) {
  const url = `${SOURCE_URL}?gender=male&countryCode=${countryCode}&footballType=football&locale=en`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`FIFA by-country ${countryCode}: HTTP ${response.status}`);
  const payload = await response.json();
  const entries = Array.isArray(payload) ? payload : payload?.rankings;
  if (!Array.isArray(entries) || !entries.length) throw new Error(`FIFA by-country ${countryCode}: empty series`);
  const dated = entries.filter((entry) => entry && typeof entry === "object" && entry.PubDate);
  dated.sort((a, b) => String(a.PubDate).localeCompare(String(b.PubDate)));
  const latest = dated[dated.length - 1];
  if (!latest || !Number.isFinite(latest.Rank) || !Number.isFinite(latest.DecimalTotalPoints)) {
    throw new Error(`FIFA by-country ${countryCode}: missing rank/points in latest entry`);
  }
  return latest;
}

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const baseTeams = vm.runInNewContext(`(${extractConst(appSource, "baseTeams")})`, {});
if (baseTeams.length !== 48) throw new Error(`Expected 48 teams, got ${baseTeams.length}`);

const rows = [];
for (const team of baseTeams) {
  const code = fifaCountryCodes[team.en];
  if (!code) throw new Error(`Missing FIFA country code for ${team.en}`);
  const latest = await fetchLatestRanking(code);
  rows.push({
    team: team.en,
    snapshot_date: String(latest.PubDate).slice(0, 10),
    source: "FIFA/Coca-Cola Men's World Ranking",
    source_url: `${PAGE_URL} (api/rankings/by-country ${code})`,
    fifa_rank: latest.Rank,
    fifa_points: Math.round(latest.DecimalTotalPoints),
    points_precision: "rounded integer",
    source_note: `Latest published entry in FIFA by-country series; decimal points ${latest.DecimalTotalPoints}.`,
  });
  console.log(`${team.en} (${code}): rank ${latest.Rank}, points ${latest.DecimalTotalPoints} (${String(latest.PubDate).slice(0, 10)})`);
}

const snapshotDates = [...new Set(rows.map((row) => row.snapshot_date))];
if (snapshotDates.length !== 1) {
  throw new Error(`Inconsistent snapshot dates across teams: ${snapshotDates.join(", ")}`);
}

rows.sort((a, b) => a.fifa_rank - b.fifa_rank || a.team.localeCompare(b.team));
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
await writeFile(
  new URL("../data/fifa_ranking_snapshot.csv", import.meta.url),
  [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Fetched FIFA ranking snapshot (${snapshotDates[0]}) for ${rows.length} teams.`);
