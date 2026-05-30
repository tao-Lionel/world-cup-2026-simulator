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

function stageScore(result) {
  const text = result.toLowerCase();
  if (text.includes("winner")) return 98;
  if (text.includes("runner")) return 88;
  if (text.includes("third")) return 78;
  if (text.includes("fourth") || text.includes("semi-final")) return 70;
  if (text.includes("quarter")) return 58;
  if (text.includes("round of 16")) return 42;
  if (text.includes("group")) return 18;
  if (text.includes("first appearance") || text.includes("dnq")) return 10;
  return 20;
}

function recencyScore(lastAppearance) {
  if (lastAppearance === "First appearance") return 18;
  const year = Number(lastAppearance);
  if (!Number.isFinite(year)) return 15;
  const gap = 2026 - year;
  if (gap <= 4) return 100;
  if (gap <= 8) return 82;
  if (gap <= 12) return 68;
  if (gap <= 16) return 56;
  if (gap <= 24) return 42;
  if (gap <= 40) return 28;
  return 18;
}

function titleCount(bestResult) {
  const matches = bestResult.match(/\b(19|20)\d{2}\b/g) || [];
  return bestResult.toLowerCase().includes("winner") ? matches.length : 0;
}

function finalCount(bestResult) {
  const text = bestResult.toLowerCase();
  if (!text.includes("winner") && !text.includes("runner")) return 0;
  return (bestResult.match(/\b(19|20)\d{2}\b/g) || []).length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const rows = parseCsv(await readFile(new URL("../data/world_cup_history_raw.csv", import.meta.url), "utf8"));
const headers = [
  "team",
  "snapshot_date",
  "source",
  "source_url",
  "previous_appearances",
  "wins",
  "draws",
  "losses",
  "win_pct",
  "best_result",
  "qatar_2022",
  "best_stage_score",
  "recent_stage_score",
  "experience_score",
  "record_score",
  "recency_score",
  "titles",
  "finals_from_best_result",
  "wc_path_score",
  "source_note",
];

const output = rows.map((row) => {
  const wins = Number(row.wins);
  const draws = Number(row.draws);
  const losses = Number(row.losses);
  const appearances = Number(row.previous_appearances);
  const matches = wins + draws + losses;
  const winPct = matches ? wins / matches : 0;
  const best = stageScore(row.best_result);
  const recent = stageScore(row.qatar_2022);
  const experience = clamp((appearances / 20) * 100, 0, 100);
  const record = clamp((winPct * 110) + ((draws / Math.max(1, matches)) * 20), 0, 100);
  const recency = recencyScore(row.last_appearance);
  const titles = titleCount(row.best_result);
  const finals = finalCount(row.best_result);
  const dynasty = clamp((titles * 10) + (finals * 4), 0, 28);
  const score = Math.round(
    (best * 0.34) +
    (recent * 0.18) +
    (experience * 0.16) +
    (record * 0.14) +
    (recency * 0.10) +
    dynasty +
    6,
  );
  return {
    team: row.team,
    snapshot_date: row.snapshot_date,
    source: "Football365 2026 qualified-team World Cup records + local champion path summary",
    source_url: row.source_url,
    previous_appearances: appearances,
    wins,
    draws,
    losses,
    win_pct: (winPct * 100).toFixed(1),
    best_result: row.best_result,
    qatar_2022: row.qatar_2022,
    best_stage_score: best,
    recent_stage_score: recent,
    experience_score: Math.round(experience),
    record_score: Math.round(record),
    recency_score: recency,
    titles,
    finals_from_best_result: finals,
    wc_path_score: clamp(score, 10, 98),
    source_note: row.note,
  };
});

await writeFile(
  new URL("../data/wc_path_features.csv", import.meta.url),
  [
    headers.join(","),
    ...output.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n",
);

console.log(`Built World Cup path features for ${output.length} teams.`);
