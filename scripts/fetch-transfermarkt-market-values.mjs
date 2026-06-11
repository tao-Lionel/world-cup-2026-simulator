import { readFile, writeFile } from "node:fs/promises";

const PARTICIPANTS_URL = "https://www.transfermarkt.us/world-cup/teilnehmer/pokalwettbewerb/FIWC";
const SOURCE_DATE = new Date().toISOString().slice(0, 10);
const USER_AGENT = "Mozilla/5.0 (compatible; world-cup-2026-simulator/1.1)";

const teamNameMap = new Map([
  ["United States", "USA"],
  ["South Korea", "Korea Republic"],
  ["Turkiye", "Türkiye"],
  ["Ivory Coast", "Cote d'Ivoire"],
  ["Cape Verde", "Cabo Verde"],
  ["Democratic Republic of the Congo", "Congo DR"],
  ["Iran", "IR Iran"],
  ["Curaçao", "Curacao"],
  ["Bosnia-Herzegovina", "Bosnia and Herzegovina"],
]);

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

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&oslash;", "ø")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&#039;", "'")
    .replaceAll("&quot;", "\"")
    .trim();
}

function parseMoneyToMillions(value) {
  const normalized = decodeHtml(value).replace(/[€,\s]/g, "");
  const match = normalized.match(/^([0-9.]+)(bn|m|k)$/i);
  if (!match) return "";
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return "";
  if (match[2].toLowerCase() === "bn") return Math.round(amount * 1000 * 100) / 100;
  if (match[2].toLowerCase() === "m") return Math.round(amount * 100) / 100;
  return Math.round((amount / 1000) * 100) / 100;
}

function normalizeName(value) {
  return decodeHtml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function sortedNameKey(value) {
  const tokens = decodeHtml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];
  return tokens.sort().join("");
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Transfermarkt fetch failed ${response.status}: ${url}`);
  return response.text();
}

function parseTeamRows(html) {
  const rowPattern = /<tr class="(?:odd|even)">([\s\S]*?)<\/tr>/g;
  const rows = [];
  for (const match of html.matchAll(rowPattern)) {
    const row = match[1];
    const link = row.match(/<td class="links no-border-links hauptlink"><a title="([^"]+)" href="([^"]+)">([^<]+)<\/a><\/td>/);
    const cells = [...row.matchAll(/<td class="(?:zentriert|rechts)">([^<]+)<\/td>/g)].map((cell) => decodeHtml(cell[1]));
    if (!link || cells.length < 6) continue;
    rows.push({
      team: teamNameMap.get(decodeHtml(link[3])) || decodeHtml(link[3]),
      transfermarkt_team: decodeHtml(link[3]),
      squad_size: cells[0],
      avg_age: cells[1],
      world_cup_participations: cells[2],
      foreign_players_pct: cells[3].replace(" %", ""),
      market_value_m: parseMoneyToMillions(cells[4]),
      avg_market_value_m: parseMoneyToMillions(cells[5]),
      team_url: new URL(link[2], PARTICIPANTS_URL).href,
      source_url: PARTICIPANTS_URL,
      snapshot_date: SOURCE_DATE,
    });
  }
  return rows;
}

function parsePlayerRows(html, team, teamUrl) {
  const rowPattern = /<td class="zentriert rueckennummer[\s\S]*?<\/td><td class="">\s*<table class="inline-table">([\s\S]*?)<\/table>\s*<\/td><td class="zentriert">([^<]+)<\/td><td class="zentriert">([\s\S]*?)<\/td><td class="rechts hauptlink"><a href="[^"]+">([^<]+)<\/a>/g;
  const rows = [];
  for (const match of html.matchAll(rowPattern)) {
    const row = match[1];
    const player = row.match(/<td class="hauptlink">\s*<a href="([^"]+\/profil\/spieler\/\d+)">\s*([^<]+?)\s*<\/a>/);
    if (!player) continue;
    rows.push({
      team,
      player: decodeHtml(player[2]),
      transfermarkt_url: new URL(player[1], teamUrl).href,
      market_value_m: parseMoneyToMillions(match[4]),
      source_url: teamUrl,
      snapshot_date: SOURCE_DATE,
    });
  }
  return rows;
}

const knownTeams = new Set(parseCsv(await readFile(new URL("../data/team_factors_snapshot.csv", import.meta.url), "utf8")).map((row) => row.team));
const teamRows = [];
for (let page = 1; page <= 7; page += 1) {
  const pageUrl = page === 1 ? PARTICIPANTS_URL : `${PARTICIPANTS_URL}/page/${page}`;
  teamRows.push(...parseTeamRows(await fetchText(pageUrl)));
}
const filteredTeamRows = [...new Map(
  teamRows
    .filter((row) => knownTeams.has(row.team))
    .map((row) => [row.team, row]),
).values()];
if (filteredTeamRows.length !== 48) throw new Error(`Expected 48 Transfermarkt team rows, got ${filteredTeamRows.length}`);

const playerRows = [];
for (const row of filteredTeamRows) {
  const html = await fetchText(row.team_url);
  playerRows.push(...parsePlayerRows(html, row.team, row.team_url));
}

const squadRows = parseCsv(await readFile(new URL("../data/squads_2026.csv", import.meta.url), "utf8"));
const playerValueByTeam = new Map();
const playerValueBySortedTeam = new Map();
const duplicateSortedKeys = new Set();
for (const row of playerRows) {
  playerValueByTeam.set(`${row.team}:${normalizeName(row.player)}`, row);
  const sortedKey = `${row.team}:${sortedNameKey(row.player)}`;
  if (playerValueBySortedTeam.has(sortedKey)) duplicateSortedKeys.add(sortedKey);
  else playerValueBySortedTeam.set(sortedKey, row);
}
for (const key of duplicateSortedKeys) {
  playerValueBySortedTeam.delete(key);
}

let matched = 0;
for (const row of squadRows) {
  const transfermarkt = playerValueByTeam.get(`${row.team}:${normalizeName(row.player)}`) ||
    playerValueBySortedTeam.get(`${row.team}:${sortedNameKey(row.player)}`);
  if (!transfermarkt) continue;
  row.market_value_m = transfermarkt.market_value_m;
  row.value_source = "transfermarkt_player_market_value";
  matched += 1;
}

const teamValueByTeam = new Map(filteredTeamRows.map((row) => [row.team, Number(row.market_value_m)]));
const byTeam = new Map();
for (const row of squadRows) {
  if (!byTeam.has(row.team)) byTeam.set(row.team, []);
  byTeam.get(row.team).push(row);
}

for (const [team, rows] of byTeam.entries()) {
  const target = teamValueByTeam.get(team);
  const missing = rows.filter((row) => row.value_source !== "transfermarkt_player_market_value");
  const knownTotal = rows.reduce((sum, row) => row.value_source === "transfermarkt_player_market_value" ? sum + Number(row.market_value_m || 0) : sum, 0);
  const fallback = missing.length ? Math.max(0, target - knownTotal) / missing.length : 0;
  for (const row of missing) {
    row.market_value_m = Math.round(fallback * 100) / 100;
    row.value_source = "transfermarkt_team_value_allocated_proxy";
  }
}

const allocationHeaders = [
  "team",
  "players",
  "team_value_m",
  "player_market_value_m",
  "allocated_proxy_value_m",
  "matched_player_values",
  "proxy_player_values",
  "value_source",
];
const allocationRows = [...byTeam.entries()].map(([team, rows]) => {
  const playerMarketRows = rows.filter((row) => row.value_source === "transfermarkt_player_market_value");
  const proxyRows = rows.filter((row) => row.value_source === "transfermarkt_team_value_allocated_proxy");
  const playerMarketTotal = playerMarketRows.reduce((sum, row) => sum + Number(row.market_value_m || 0), 0);
  const proxyTotal = proxyRows.reduce((sum, row) => sum + Number(row.market_value_m || 0), 0);
  return {
    team,
    players: rows.length,
    team_value_m: teamValueByTeam.get(team),
    player_market_value_m: Math.round(playerMarketTotal * 100) / 100,
    allocated_proxy_value_m: Math.round(proxyTotal * 100) / 100,
    matched_player_values: playerMarketRows.length,
    proxy_player_values: proxyRows.length,
    value_source: proxyRows.length ? "transfermarkt_mixed_player_and_team_proxy" : "transfermarkt_player_market_value",
  };
});

const squadHeaders = Object.keys(squadRows[0]);
await writeFile(
  new URL("../data/squads_2026.csv", import.meta.url),
  [
    squadHeaders.join(","),
    ...squadRows.map((row) => squadHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

const teamHeaders = ["team", "transfermarkt_team", "squad_size", "avg_age", "world_cup_participations", "foreign_players_pct", "market_value_m", "avg_market_value_m", "team_url", "source_url", "snapshot_date"];
await writeFile(
  new URL("../data/transfermarkt_team_market_values.csv", import.meta.url),
  [
    teamHeaders.join(","),
    ...filteredTeamRows.map((row) => teamHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

const playerHeaders = ["team", "player", "market_value_m", "transfermarkt_url", "source_url", "snapshot_date"];
await writeFile(
  new URL("../data/transfermarkt_player_market_values.csv", import.meta.url),
  [
    playerHeaders.join(","),
    ...playerRows.map((row) => playerHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

await writeFile(
  new URL("../data/squad_value_allocation.csv", import.meta.url),
  [
    allocationHeaders.join(","),
    ...allocationRows.map((row) => allocationHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Fetched Transfermarkt values for ${filteredTeamRows.length} teams and ${playerRows.length} players; matched ${matched}/${squadRows.length} squad rows.`);
