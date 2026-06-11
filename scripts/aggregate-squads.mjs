import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const SNAPSHOT_DATE = new Date().toISOString().slice(0, 10);
const inputPath = process.argv[2] || "../data/squads_2026.csv";
const outputPath = process.argv[3] || "../data/squad_profile_snapshot.csv";

function extractConst(name) {
  const start = appSource.indexOf(`const ${name} = `);
  if (start === -1) throw new Error(`Missing const ${name}`);
  const valueStart = start + `const ${name} = `.length;
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escape = false;
  for (let index = valueStart; index < appSource.length; index += 1) {
    const char = appSource[index];
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
    if (depth === 0 && char === ";") return appSource.slice(valueStart, index);
  }
  throw new Error(`Could not parse const ${name}`);
}

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

function numberValue(value) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function labelStatus(row) {
  if (!row) return "";
  if (row.announcement_status === "fifa_final_confirmed") return "FIFA最终名单";
  if (row.announcement_status === "association_26_announced") return "已公布26人名单";
  if (row.announcement_status === "squad_announced_unverified") return "已公布名单待核26人";
  if (row.announcement_status === "preliminary") return "暂定/初选名单";
  if (row.announcement_status === "training_camp") return "训练营名单";
  if (row.announcement_status === "pending") return "待公布";
  return row.announcement_status || "";
}

function rounded(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function roleWeight(role) {
  const normalized = role.trim().toLowerCase();
  if (normalized === "starter") return 1.3;
  if (normalized === "rotation") return 1;
  if (normalized === "reserve") return 0.5;
  return 0.75;
}

function injuryPenalty(status) {
  const normalized = status.trim().toLowerCase();
  if (["available", "fit", "none"].includes(normalized)) return 0;
  if (["minor", "knock"].includes(normalized)) return 8;
  if (["doubtful", "questionable"].includes(normalized)) return 18;
  if (["injured", "out", "omitted_injury"].includes(normalized)) return 32;
  if (normalized === "suspended") return 28;
  return 6;
}

function externalAvailabilityPenalty(rows) {
  return rows.reduce((sum, row) => {
    const status = row.status.trim().toLowerCase();
    if (!["omitted_injury", "injured", "out", "suspended"].includes(status)) return sum;
    if (row.severity.trim().toLowerCase() === "major") return sum + 7;
    if (row.severity.trim().toLowerCase() === "moderate") return sum + 4;
    return sum + 2;
  }, 0);
}

function leagueScore(league) {
  const normalized = league.trim().toLowerCase();
  const scores = new Map([
    ["premier league", 95],
    ["la liga", 92],
    ["serie a", 88],
    ["bundesliga", 88],
    ["ligue 1", 80],
    ["eredivisie", 76],
    ["primeira liga", 75],
    ["brasileirao", 72],
    ["argentine primera division", 68],
    ["mls", 60],
    ["saudi pro league", 56],
    ["qatar stars league", 42],
    ["j1 league", 58],
    ["k league 1", 54],
    ["a-league", 45],
    ["eng", 82],
    ["esp", 82],
    ["ita", 80],
    ["ger", 80],
    ["fra", 76],
    ["ned", 72],
    ["por", 72],
    ["bra", 70],
    ["arg", 66],
    ["usa", 58],
    ["can", 58],
    ["mex", 56],
    ["ksa", 54],
    ["qat", 42],
    ["jpn", 56],
    ["kor", 52],
    ["aus", 45],
  ]);
  return scores.get(normalized) ?? (normalized ? 50 : 42);
}

function weightedAverage(rows, valueGetter) {
  let numerator = 0;
  let denominator = 0;
  for (const row of rows) {
    const weight = roleWeight(row.expected_role || "");
    numerator += valueGetter(row) * weight;
    denominator += weight;
  }
  return denominator ? numerator / denominator : 0;
}

const baseTeams = vm.runInNewContext(`(${extractConst("baseTeams")})`, {});
const teamFactors = vm.runInNewContext(`(${extractConst("teamFactors")})`, {});
const announcementRows = parseCsv(await readFile(new URL("../data/squad_announcement_status.csv", import.meta.url), "utf8"));
const announcementByTeam = new Map(announcementRows.map((row) => [row.team, row]));
const availabilityRows = parseCsv(await readFile(new URL("../data/player_availability_watchlist.csv", import.meta.url), "utf8"));
const availabilityByTeam = new Map();
for (const row of availabilityRows) {
  if (!availabilityByTeam.has(row.team)) availabilityByTeam.set(row.team, []);
  availabilityByTeam.get(row.team).push(row);
}

let squadRows;
try {
  squadRows = parseCsv(await readFile(new URL(inputPath, import.meta.url), "utf8"))
    .filter((row) => row.team && row.player);
} catch (error) {
  throw new Error("Missing data/squads_2026.csv. Copy data/squads_2026_template.csv, fill player rows, then rerun this script.");
}

const headers = [
  "team",
  "snapshot_date",
  "squad_status",
  "final_26_available",
  "announced_26_available",
  "announcement_status",
  "announcement_date",
  "squad_value_m",
  "avg_age",
  "injury_risk",
  "club_score",
  "profile_status",
  "source_note",
  "value_source",
  "replacement_key",
];

const outputRows = baseTeams.map((team) => {
  const factors = teamFactors[team.en];
  const announcement = announcementByTeam.get(team.en) || {};
  const availability = availabilityByTeam.get(team.en) || [];
  const externalPenalty = externalAvailabilityPenalty(availability);
  const availabilityKnown = availability.length;
  const players = squadRows.filter((row) => row.team === team.en);
  if (!players.length) {
    return {
      team: team.en,
      snapshot_date: SNAPSHOT_DATE,
      squad_status: announcement.announced_26_available === "true" ? labelStatus(announcement) || "已公布26人名单" : labelStatus(announcement) || factors.squadStatus,
      final_26_available: announcement.fifa_final_26_available || "false",
      announced_26_available: announcement.announced_26_available || "false",
      announcement_status: labelStatus(announcement) || factors.squadAnnouncementStatus || "",
      announcement_date: announcement.announced_date || factors.squadAnnouncementDate || "",
      squad_value_m: factors.squadValue,
      avg_age: factors.avgAge,
      injury_risk: Math.max(15, Math.min(50, rounded(factors.injuryRisk + externalPenalty))),
      club_score: factors.clubScore,
      profile_status: "provisional_aggregate",
      source_note: availabilityKnown
        ? `No player-level rows yet; retained current aggregate placeholder; ${availabilityKnown} availability watch rows applied at team level.`
        : "No player-level rows yet; retained current aggregate placeholder.",
      value_source: "team_level_proxy",
      replacement_key: "squads_2026.csv -> aggregate by team",
    };
  }

  const ages = players.map((row) => numberValue(row.age)).filter((value) => value !== null);
  const values = players.map((row) => numberValue(row.market_value_m)).filter((value) => value !== null);
  const goalkeeperCount = players.filter((row) => /^(gk|goalkeeper)$/i.test(row.position.trim())).length;
  const final26Available = players.length >= 23 && players.length <= 26 && goalkeeperCount >= 3;
  const allOfficial = players.every((row) => row.list_status.trim().toLowerCase() === "official_final");
  const allAssociationFinal = players.every((row) => ["official_final", "association_final"].includes(row.list_status.trim().toLowerCase()));
  const anyProjected = players.some((row) => row.list_status.trim().toLowerCase() === "projected");
  const injuryRisk = rounded(16 + weightedAverage(players, (row) => injuryPenalty(row.injury_status || "")) + externalPenalty);
  const clubScore = rounded(weightedAverage(players, (row) => leagueScore(row.league || "")));
  const statusText = allOfficial ? "官方最终名单" : allAssociationFinal ? "已公布名单" : "球员级名单";
  const knownAvailabilityRows = players.filter((row) => (row.injury_status || "").trim().toLowerCase() !== "unknown").length;

  return {
    team: team.en,
    snapshot_date: players.find((row) => row.snapshot_date)?.snapshot_date || SNAPSHOT_DATE,
    squad_status: `${players.length}人${statusText}`,
    final_26_available: final26Available && allOfficial ? "true" : "false",
    announced_26_available: final26Available && allAssociationFinal ? "true" : announcement.announced_26_available || "false",
    announcement_status: final26Available && allOfficial ? "FIFA最终名单" : final26Available && allAssociationFinal ? "已公布26人名单" : factors.squadAnnouncementStatus || "",
    announcement_date: announcement.announced_date || factors.squadAnnouncementDate || "",
    squad_value_m: values.length ? rounded(values.reduce((sum, value) => sum + value, 0)) : factors.squadValue,
    avg_age: ages.length ? rounded(ages.reduce((sum, value) => sum + value, 0) / ages.length, 1) : factors.avgAge,
    injury_risk: Math.max(15, Math.min(50, injuryRisk)),
    club_score: Math.max(30, Math.min(95, clubScore)),
    profile_status: allOfficial ? "official_final_player_level" : allAssociationFinal ? "association_final_player_level" : anyProjected ? "projected_player_level" : "provisional_player_level",
    source_note: `${players.length} player rows aggregated; ${goalkeeperCount} goalkeepers; source URLs ${players.filter((row) => row.source_url).length}/${players.length}; value rows ${values.length}/${players.length}; availability rows ${knownAvailabilityRows}/${players.length}.`,
    value_source: players.every((row) => row.value_source === "team_value_allocated_proxy") ? "team_value_allocated_proxy" : "mixed_or_manual",
    replacement_key: "squads_2026.csv -> aggregate by team",
  };
});

await writeFile(
  new URL(outputPath, import.meta.url),
  [
    headers.join(","),
    ...outputRows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Aggregated squad profiles for ${outputRows.length} teams from ${squadRows.length} player rows.`);
