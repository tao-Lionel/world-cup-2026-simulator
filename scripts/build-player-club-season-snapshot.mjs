import { readFile, writeFile } from "node:fs/promises";

const SEASON_ID = Number(process.env.CLUB_SEASON_ID || 2025);
const SNAPSHOT_DATE = new Date().toISOString().slice(0, 10);
const USER_AGENT = "Mozilla/5.0 (compatible; world-cup-2026-simulator/1.1)";
const CONCURRENCY = Number(process.env.PLAYER_STATS_CONCURRENCY || 8);

function parseCsvLine(line) {
  const cells = [];
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
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function sortedNameKey(value) {
  const tokens = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];
  return tokens.sort().join("");
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rounded(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value, min, max) {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function transfermarktPlayerId(url) {
  const match = String(url || "").match(/\/spieler\/(\d+)/);
  return match?.[1] || "";
}

function decodeHtml(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&#039;", "'")
    .replaceAll("&quot;", "\"")
    .replaceAll("&nbsp;", " ")
    .trim();
}

function importedRoleScore(role) {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "starter") return 78;
  if (normalized === "rotation") return 52;
  if (normalized === "reserve") return 28;
  return 40;
}

function injuryPenalty(status) {
  const normalized = String(status || "").toLowerCase();
  if (["injured", "out", "omitted_injury"].includes(normalized)) return 24;
  if (["doubtful", "questionable"].includes(normalized)) return 14;
  if (["minor", "knock"].includes(normalized)) return 7;
  if (normalized === "suspended") return 18;
  return 0;
}

function projectedRole(score) {
  if (score >= 68) return "starter";
  if (score >= 38) return "rotation";
  return "reserve";
}

function leagueWeight(league) {
  const normalized = String(league || "").trim().toLowerCase();
  const scores = new Map([
    ["premier league", 1],
    ["la liga", 0.96],
    ["serie a", 0.92],
    ["bundesliga", 0.92],
    ["ligue 1", 0.86],
    ["eredivisie", 0.8],
    ["primeira liga", 0.78],
    ["brasileirao", 0.75],
    ["argentine primera division", 0.72],
    ["mls", 0.64],
    ["j1 league", 0.58],
    ["k league 1", 0.55],
    ["saudi pro league", 0.55],
    ["qatar stars league", 0.42],
  ]);
  return scores.get(normalized) ?? (normalized ? 0.58 : 0.5);
}

function blankStats() {
  return {
    clubGames: 0,
    appearances: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    source: "no_transfermarkt_player_match",
    sourceUrl: "",
    note: "No matched Transfermarkt player URL; role score uses squad role, market value, caps and availability only.",
  };
}

function summarizePerformance(playerId, payload) {
  const rows = Array.isArray(payload?.data?.performance) ? payload.data.performance : [];
  const clubRows = rows.filter((row) =>
    Number(row.gameInformation?.seasonId) === SEASON_ID &&
    row.gameInformation?.isNationalGame !== true &&
    row.gameInformation?.isGamePostponed !== true
  );
  const stats = {
    clubGames: clubRows.length,
    appearances: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    source: "transfermarkt_performance_game",
    sourceUrl: `https://tmapi.transfermarkt.technology/player/${playerId}/performance-game`,
    note: `${clubRows.length} club match rows from Transfermarkt performance-game API for season ${SEASON_ID}.`,
  };
  for (const row of clubRows) {
    const general = row.statistics?.generalStatistics || {};
    const goals = row.statistics?.goalStatistics || {};
    const playing = row.statistics?.playingTimeStatistics || {};
    const minutes = numberValue(playing.playedMinutes);
    const appeared = minutes > 0 || playing.isStarting === true || general.participationState === "played";
    if (!appeared) continue;
    stats.appearances += 1;
    stats.starts += playing.isStarting === true ? 1 : 0;
    stats.minutes += minutes;
    stats.goals += numberValue(goals.goalsScoredTotal);
    stats.assists += numberValue(goals.assists);
  }
  return stats;
}

async function fetchPerformance(playerId) {
  const url = `https://tmapi.transfermarkt.technology/player/${playerId}/performance-game`;
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "accept": "application/json",
          "user-agent": USER_AGENT,
        },
      });
      if (!response.ok) throw new Error(`Transfermarkt performance fetch failed ${response.status} for ${playerId}`);
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function parseSearchResult(html, squadPlayer) {
  const normalizedSquadName = normalizeName(squadPlayer);
  const sortedSquadName = sortedNameKey(squadPlayer);
  const linkPattern = /<a title="([^"]+)" href="([^"]+\/profil\/spieler\/\d+)">([^<]+)<\/a>/g;
  for (const match of html.matchAll(linkPattern)) {
    const candidate = decodeHtml(match[3] || match[1]);
    const normalizedCandidate = normalizeName(candidate);
    const sortedCandidate = sortedNameKey(candidate);
    const strongMatch =
      normalizedCandidate === normalizedSquadName ||
      sortedCandidate === sortedSquadName ||
      normalizedCandidate.includes(normalizedSquadName) ||
      normalizedSquadName.includes(normalizedCandidate);
    if (!strongMatch) continue;
    return {
      player: candidate,
      transfermarkt_url: new URL(match[2], "https://www.transfermarkt.us/").href,
    };
  }
  return null;
}

async function searchTransfermarktPlayer(player) {
  const url = `https://www.transfermarkt.us/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player)}`;
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      "accept-language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`Transfermarkt search failed ${response.status} for ${player}`);
  return parseSearchResult(await response.text(), player);
}

async function fillMissingTransfermarktUrls(rows) {
  const missing = rows.filter((row) => !row.transfermarkt_player_id);
  let cursor = 0;
  let completed = 0;
  let matched = 0;
  async function worker() {
    while (cursor < missing.length) {
      const row = missing[cursor];
      cursor += 1;
      try {
        const result = await searchTransfermarktPlayer(row.player);
        if (result) {
          row.transfermarkt_url = result.transfermarkt_url;
          row.transfermarkt_player_id = transfermarktPlayerId(result.transfermarkt_url);
          matched += 1;
        }
      } catch {
        // Keep the explicit no-match fallback below.
      }
      completed += 1;
      if (completed % 25 === 0 || completed === missing.length) {
        console.log(`Searched missing Transfermarkt URLs ${completed}/${missing.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(CONCURRENCY, missing.length || 1)) }, () => worker()));
  console.log(`Matched ${matched}/${missing.length} previously missing Transfermarkt player URLs by search.`);
}

async function fetchAllPlayerStats(playerIds) {
  const results = new Map();
  let cursor = 0;
  let completed = 0;
  async function worker() {
    while (cursor < playerIds.length) {
      const playerId = playerIds[cursor];
      cursor += 1;
      try {
        results.set(playerId, summarizePerformance(playerId, await fetchPerformance(playerId)));
      } catch (error) {
        results.set(playerId, {
          ...blankStats(),
          source: "transfermarkt_fetch_error",
          sourceUrl: `https://tmapi.transfermarkt.technology/player/${playerId}/performance-game`,
          note: error.message,
        });
      }
      completed += 1;
      if (completed % 100 === 0 || completed === playerIds.length) {
        console.log(`Fetched club season stats ${completed}/${playerIds.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, () => worker()));
  return results;
}

const squadRows = parseCsv(await readFile(new URL("../data/squads_2026.csv", import.meta.url), "utf8"));
const transfermarktRows = parseCsv(await readFile(new URL("../data/transfermarkt_player_market_values.csv", import.meta.url), "utf8"));

const transfermarktByName = new Map();
const transfermarktBySorted = new Map();
const duplicateSortedKeys = new Set();
for (const row of transfermarktRows) {
  const directKey = `${row.team}:${normalizeName(row.player)}`;
  const sortedKey = `${row.team}:${sortedNameKey(row.player)}`;
  transfermarktByName.set(directKey, row);
  if (transfermarktBySorted.has(sortedKey)) duplicateSortedKeys.add(sortedKey);
  else transfermarktBySorted.set(sortedKey, row);
}
for (const key of duplicateSortedKeys) transfermarktBySorted.delete(key);

const squadWithTransfermarkt = squadRows.map((row) => {
  const transfermarkt = transfermarktByName.get(`${row.team}:${normalizeName(row.player)}`) ||
    transfermarktBySorted.get(`${row.team}:${sortedNameKey(row.player)}`);
  return {
    ...row,
    transfermarkt_url: transfermarkt?.transfermarkt_url || "",
    transfermarkt_player_id: transfermarktPlayerId(transfermarkt?.transfermarkt_url),
  };
});

await fillMissingTransfermarktUrls(squadWithTransfermarkt);

const playerIds = [...new Set(squadWithTransfermarkt.map((row) => row.transfermarkt_player_id).filter(Boolean))];
const statsByPlayerId = await fetchAllPlayerStats(playerIds);

const maxValueByTeam = new Map();
for (const row of squadRows) {
  const value = numberValue(row.market_value_m);
  maxValueByTeam.set(row.team, Math.max(maxValueByTeam.get(row.team) || 0, value));
}

const headers = [
  "team",
  "slot",
  "player",
  "position",
  "club",
  "league",
  "season_id",
  "snapshot_date",
  "transfermarkt_player_id",
  "season_club_matches",
  "season_appearances",
  "season_starts",
  "season_minutes",
  "season_goals",
  "season_assists",
  "imported_role",
  "projected_role",
  "role_score",
  "performance_score",
  "stats_source",
  "source_url",
  "source_note",
];

const outputRows = squadWithTransfermarkt.map((row) => {
  const stats = row.transfermarkt_player_id
    ? statsByPlayerId.get(row.transfermarkt_player_id) || blankStats()
    : blankStats();
  const maxValue = maxValueByTeam.get(row.team) || 1;
  const valueScore = normalize(numberValue(row.market_value_m), 0, maxValue) * 100;
  const capsScore = normalize(numberValue(row.caps), 0, 85) * 100;
  const minutesScore = normalize(stats.minutes, 0, row.position === "GK" ? 3420 : 3000) * 100;
  const startsScore = normalize(stats.starts, 0, row.position === "GK" ? 38 : 34) * 100;
  const appearanceScore = normalize(stats.appearances, 0, 45) * 100;
  const attackingScore = normalize(stats.goals + stats.assists, 0, row.position === "GK" || row.position === "DF" ? 8 : 22) * 100;
  const roleProxyScore = importedRoleScore(row.expected_role) * 0.45 + valueScore * 0.35 + capsScore * 0.2;
  const realPerformanceScore = minutesScore * 0.5 + startsScore * 0.2 + appearanceScore * 0.12 + attackingScore * 0.08 + valueScore * 0.06 + capsScore * 0.04;
  const performanceScore = stats.source === "transfermarkt_performance_game" && stats.clubGames
    ? realPerformanceScore * (0.85 + leagueWeight(row.league) * 0.15)
    : roleProxyScore;
  const roleScore = clamp(performanceScore * 0.72 + roleProxyScore * 0.28 - injuryPenalty(row.injury_status), 0, 100);
  return {
    team: row.team,
    slot: row.slot,
    player: row.player,
    position: row.position,
    club: row.club,
    league: row.league,
    season_id: SEASON_ID,
    snapshot_date: SNAPSHOT_DATE,
    transfermarkt_player_id: row.transfermarkt_player_id,
    season_club_matches: stats.clubGames,
    season_appearances: stats.appearances,
    season_starts: stats.starts,
    season_minutes: stats.minutes,
    season_goals: stats.goals,
    season_assists: stats.assists,
    imported_role: row.expected_role,
    projected_role: projectedRole(roleScore),
    role_score: rounded(roleScore),
    performance_score: rounded(performanceScore),
    stats_source: stats.source,
    source_url: stats.sourceUrl,
    source_note: stats.note,
  };
});

await writeFile(
  new URL("../data/player_club_season_snapshot.csv", import.meta.url),
  [
    headers.join(","),
    ...outputRows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

const realRows = outputRows.filter((row) => row.stats_source === "transfermarkt_performance_game");
console.log(`Wrote club season snapshot for ${outputRows.length} players; ${realRows.length} rows use Transfermarkt performance-game stats.`);
