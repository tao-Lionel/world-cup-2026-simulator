import { readFile, writeFile } from "node:fs/promises";

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

function average(rows, getter) {
  if (!rows.length) return 0;
  return rows.reduce((sum, row) => sum + getter(row), 0) / rows.length;
}

const playerRows = parseCsv(await readFile(new URL("../data/player_club_season_snapshot.csv", import.meta.url), "utf8"));
const rowsByTeam = new Map();
for (const row of playerRows) {
  if (!rowsByTeam.has(row.team)) rowsByTeam.set(row.team, []);
  rowsByTeam.get(row.team).push(row);
}

const headers = [
  "team",
  "season_id",
  "snapshot_date",
  "players",
  "real_player_stats",
  "proxy_player_stats",
  "starter_count",
  "rotation_count",
  "reserve_count",
  "avg_role_score",
  "top11_role_score",
  "top15_role_score",
  "minutes_coverage",
  "goals_assists",
  "goals_assists_score",
  "club_season_score",
  "source_note",
];

const outputRows = [...rowsByTeam.entries()].map(([team, rows]) => {
  const sorted = [...rows].sort((a, b) => numberValue(b.role_score) - numberValue(a.role_score));
  const top11 = sorted.slice(0, 11);
  const top15 = sorted.slice(0, 15);
  const realRows = rows.filter((row) => row.stats_source === "transfermarkt_performance_game");
  const starterCount = rows.filter((row) => row.projected_role === "starter").length;
  const rotationCount = rows.filter((row) => row.projected_role === "rotation").length;
  const reserveCount = rows.filter((row) => row.projected_role === "reserve").length;
  const minutesTotal = top15.reduce((sum, row) => sum + Math.min(numberValue(row.season_minutes), 3200), 0);
  const minutesCoverage = normalize(minutesTotal, 12000, 36000) * 100;
  const goalsAssists = top15.reduce((sum, row) => sum + numberValue(row.season_goals) + numberValue(row.season_assists), 0);
  const goalsAssistsScore = normalize(goalsAssists, 8, 85) * 100;
  const realCoverage = (realRows.length / rows.length) * 100;
  const avgRoleScore = average(rows, (row) => numberValue(row.role_score));
  const top11RoleScore = average(top11, (row) => numberValue(row.role_score));
  const top15RoleScore = average(top15, (row) => numberValue(row.role_score));
  const clubSeasonScore = clamp(
    top11RoleScore * 0.45 +
      top15RoleScore * 0.2 +
      avgRoleScore * 0.12 +
      minutesCoverage * 0.1 +
      goalsAssistsScore * 0.08 +
      realCoverage * 0.05,
    0,
    100,
  );

  return {
    team,
    season_id: rows[0]?.season_id || "",
    snapshot_date: rows[0]?.snapshot_date || "",
    players: rows.length,
    real_player_stats: realRows.length,
    proxy_player_stats: rows.length - realRows.length,
    starter_count: starterCount,
    rotation_count: rotationCount,
    reserve_count: reserveCount,
    avg_role_score: rounded(avgRoleScore, 1),
    top11_role_score: rounded(top11RoleScore, 1),
    top15_role_score: rounded(top15RoleScore, 1),
    minutes_coverage: rounded(minutesCoverage, 1),
    goals_assists: goalsAssists,
    goals_assists_score: rounded(goalsAssistsScore, 1),
    club_season_score: rounded(clubSeasonScore),
    source_note: `${realRows.length}/${rows.length} players use Transfermarkt performance-game rows; score weights top 11 role, top 15 depth, minutes, goals plus assists and source coverage.`,
  };
});

outputRows.sort((a, b) => a.team.localeCompare(b.team));

await writeFile(
  new URL("../data/squad_club_season_profile.csv", import.meta.url),
  [
    headers.join(","),
    ...outputRows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Wrote squad club season profiles for ${outputRows.length} teams.`);
